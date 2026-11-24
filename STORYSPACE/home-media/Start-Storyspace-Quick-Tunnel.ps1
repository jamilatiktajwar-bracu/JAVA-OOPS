param(
  [string]$MediaUrl = "http://127.0.0.1:8787",
  [int]$HealthWaitSeconds = 45
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerScript = Join-Path $Root "Start-Storyspace-Media.ps1"
$HealthUrl = "$($MediaUrl.TrimEnd('/'))/health"

function Test-MediaServer {
  try {
    $response = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 3
    return ($response.ok -eq $true)
  } catch { return $false }
}

$Cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $Cloudflared) {
  $Winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $Winget) {
    throw "cloudflared is missing and winget is unavailable. Install Cloudflare cloudflared from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ then reopen PowerShell."
  }
  Write-Host "Installing Cloudflare cloudflared with Windows Package Manager..." -ForegroundColor Cyan
  & winget install --id Cloudflare.cloudflared --exact --source winget --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) { throw "cloudflared installation failed. Install it manually, then rerun this script." }
  $Cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
  if (-not $Cloudflared) { throw "cloudflared was installed but is not on PATH. Reopen PowerShell and rerun this script." }
}

$StartedServer = $false
if (-not (Test-MediaServer)) {
  if (-not (Test-Path $ServerScript)) { throw "Media server startup script not found: $ServerScript" }
  Write-Host "Starting the local Storyspace media server in a separate PowerShell window..." -ForegroundColor Cyan
  $PowerShell = (Get-Command pwsh.exe -ErrorAction SilentlyContinue)
  if (-not $PowerShell) { $PowerShell = (Get-Command powershell.exe -ErrorAction Stop) }
  Start-Process -FilePath $PowerShell.Source -ArgumentList @("-NoExit","-ExecutionPolicy","Bypass","-File",$ServerScript)
  $StartedServer = $true
  $Deadline = (Get-Date).AddSeconds($HealthWaitSeconds)
  while ((Get-Date) -lt $Deadline -and -not (Test-MediaServer)) { Start-Sleep -Seconds 2 }
}
if (-not (Test-MediaServer)) {
  throw "Storyspace media server did not become healthy at $HealthUrl. Check the separate server window before retrying."
}

Write-Host ""
Write-Host "Storyspace local media server is healthy." -ForegroundColor Green
if ($StartedServer) { Write-Host "The media server is running in a separate PowerShell window; keep it open." -ForegroundColor Yellow }
Write-Host "Starting a temporary Cloudflare Quick Tunnel. No domain or Cloudflare login is required." -ForegroundColor Cyan
Write-Host "Wait for the https://....trycloudflare.com URL below, then paste it into Storyspace > Upload." -ForegroundColor Yellow
Write-Host "This URL is temporary and may change whenever the tunnel restarts." -ForegroundColor Yellow
Write-Host "Keep this window open for the public link to work. Press Ctrl+C to stop the tunnel." -ForegroundColor Yellow
& cloudflared tunnel --url $MediaUrl --no-autoupdate
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Quick Tunnel exited with code $LASTEXITCODE." }
