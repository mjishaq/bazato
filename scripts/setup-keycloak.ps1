param(
  [string]$ContainerName = "bazzato-keycloak",
  [string]$AdminUser = "admin",
  [string]$AdminPassword = "admin",
  [string]$RealmFile = "infra/keycloak/bazzato-realm.json",
  [int]$WaitSeconds = 120
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$docker = "docker"
$dockerDesktop = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

if (-not (Get-Command $docker -ErrorAction SilentlyContinue) -and (Test-Path $dockerDesktop)) {
  $docker = $dockerDesktop
}

Set-Location $root

$ready = $false
for ($i = 0; $i -lt $WaitSeconds; $i += 3) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/realms/master" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Seconds 3
  }
}

if (-not $ready) {
  throw "Keycloak did not become ready at http://localhost:8080 within $WaitSeconds seconds."
}

& $docker exec $ContainerName /opt/keycloak/bin/kcadm.sh config credentials `
  --server http://localhost:8080 `
  --realm master `
  --user $AdminUser `
  --password $AdminPassword | Out-Null

$realmExists = $true
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& $docker exec $ContainerName /opt/keycloak/bin/kcadm.sh get realms/bazzato *> $null
if ($LASTEXITCODE -ne 0) {
  $realmExists = $false
}
$ErrorActionPreference = $previousErrorActionPreference

& $docker cp (Join-Path $root $RealmFile) "${ContainerName}:/tmp/bazzato-realm.json"

if ($realmExists) {
  & $docker exec $ContainerName /opt/keycloak/bin/kcadm.sh create partialImport `
    -r bazzato `
    -s ifResourceExists=OVERWRITE `
    -o `
    -f /tmp/bazzato-realm.json | Out-Null
} else {
  & $docker exec $ContainerName /opt/keycloak/bin/kcadm.sh create realms `
    -f /tmp/bazzato-realm.json | Out-Null
}

Write-Host "Keycloak realm is ready."
Write-Host "Realm: bazzato"
Write-Host "Mobile client: bazzato-mobile"
Write-Host "API audience: bazzato-api"
Write-Host "Test customer: 9876543210 / Test@1234"
