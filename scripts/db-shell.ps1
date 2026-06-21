param(
  [string]$ContainerName = "bazzato-postgres",
  [string]$Database = "bazzato",
  [string]$User = "postgres",
  [string]$Sql = "",
  [switch]$FromStdin
)

$ErrorActionPreference = "Stop"

$dockerExe = "docker"
$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
$dockerDesktopDockerExe = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"

if (Test-Path $dockerBin) {
  $env:PATH = "$dockerBin;$env:PATH"
}

if (-not (Get-Command $dockerExe -ErrorAction SilentlyContinue)) {
  if (Test-Path $dockerDesktopDockerExe) {
    $dockerExe = $dockerDesktopDockerExe
  } else {
    throw "docker is not available. Install Docker Desktop, start it, then reopen PowerShell."
  }
}

$container = & $dockerExe ps --filter "name=$ContainerName" --format "{{.Names}}"
if ($container -ne $ContainerName) {
  throw "Docker container '$ContainerName' is not running. Start Docker, then run npm run setup:infra."
}

if ($FromStdin) {
  $Sql = [Console]::In.ReadToEnd()
}

if ($Sql.Trim()) {
  $Sql | & $dockerExe exec -i $ContainerName psql -U $User -d $Database
  exit $LASTEXITCODE
}

& $dockerExe exec -it $ContainerName psql -U $User -d $Database
