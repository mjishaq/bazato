param(
  [string]$DatabaseUrl = "postgresql://postgres:postgres@localhost:5432/bazzato",
  [string]$ApiPort = "4000",
  [int]$PostgresWaitSeconds = 90
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Invoke-Checked {
  param(
    [scriptblock]$Command,
    [string]$Label
  )

  & $Command

  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE."
  }
}

function Assert-Command($Name, $InstallHint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is not available. $InstallHint"
  }
}

Assert-Command "npm" "Install Node.js 20+ and npm."

$DockerExe = "docker"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"
$DockerDesktopDockerExe = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

if (Test-Path $DockerBin) {
  $env:PATH = "$DockerBin;$env:PATH"
}

if (-not (Get-Command $DockerExe -ErrorAction SilentlyContinue)) {
  if (Test-Path $DockerDesktopDockerExe) {
    $DockerExe = $DockerDesktopDockerExe
  } else {
    throw "docker is not available. Install Docker Desktop, start it, then reopen PowerShell."
  }
}

Set-Location $root

Invoke-Checked -Label "Docker Compose startup" -Command {
  & $DockerExe compose -f infra/docker-compose.dev.yml up -d
}

$postgresReady = $false
for ($i = 0; $i -lt $PostgresWaitSeconds; $i += 3) {
  $status = & $DockerExe inspect --format "{{.State.Health.Status}}" bazzato-postgres 2>$null

  if ($status -eq "healthy") {
    $postgresReady = $true
    break
  }

  Start-Sleep -Seconds 3
}

if (-not $postgresReady) {
  Write-Host ""
  Write-Host "Postgres did not become healthy in time. Container status:"
  & $DockerExe compose -f infra/docker-compose.dev.yml ps
  Write-Host ""
  Write-Host "Postgres logs:"
  & $DockerExe logs bazzato-postgres --tail 80
  throw "Postgres container is not healthy yet."
}

$env:DATABASE_URL = $DatabaseUrl
Invoke-Checked -Label "Prisma generate" -Command {
  npm --workspace apps/backend run db:generate
}
Invoke-Checked -Label "Prisma migrations" -Command {
  npm --workspace apps/backend run db:deploy
}
Invoke-Checked -Label "Database seed" -Command {
  npm --workspace apps/backend run db:seed
}
Invoke-Checked -Label "Keycloak setup" -Command {
  .\scripts\setup-keycloak.ps1
}

Write-Host ""
Write-Host "Infrastructure is ready."
Write-Host "Backend:"
Write-Host "  `$env:DATA_SOURCE='postgres'"
Write-Host "  `$env:DATABASE_URL='$DatabaseUrl'"
Write-Host "  `$env:PORT='$ApiPort'"
Write-Host "  npm run dev:backend"
Write-Host ""
Write-Host "Mobile with mock OTP:"
Write-Host "  `$env:EXPO_PUBLIC_AUTH_PROVIDER='mock-otp'"
Write-Host "  `$env:EXPO_PUBLIC_API_URL='http://YOUR_LAPTOP_IP:$ApiPort'"
Write-Host "  npm run dev:mobile"
Write-Host ""
Write-Host "Mobile with Keycloak:"
Write-Host "  `$env:EXPO_PUBLIC_AUTH_PROVIDER='keycloak'"
Write-Host "  `$env:EXPO_PUBLIC_KEYCLOAK_ISSUER='http://YOUR_LAPTOP_IP:8080/realms/bazzato'"
Write-Host "  `$env:EXPO_PUBLIC_KEYCLOAK_CLIENT_ID='bazzato-mobile'"
Write-Host "  `$env:EXPO_PUBLIC_API_URL='http://YOUR_LAPTOP_IP:$ApiPort'"
Write-Host "  npm run dev:mobile"
