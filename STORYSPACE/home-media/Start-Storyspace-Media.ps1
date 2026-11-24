$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Node = Get-Command node -ErrorAction SilentlyContinue
if (-not $Node) { throw "Node.js 20 or newer is required. Install the LTS release from https://nodejs.org/ and reopen PowerShell." }
$Version = (& node --version).Trim().TrimStart("v").Split(".")
if ([int]$Version[0] -lt 20) { throw "Node.js 20 or newer is required. Found $(& node --version)." }

$ConfigDir = Join-Path $env:LOCALAPPDATA "Storyspace\HomeMedia"
$ConfigFile = Join-Path $ConfigDir "media-host.json"
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Root "media") | Out-Null
if (-not (Test-Path $ConfigFile)) {
  $Bytes = New-Object byte[] 48
  $Rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $Rng.GetBytes($Bytes) } finally { $Rng.Dispose() }
  $Token = [Convert]::ToBase64String($Bytes).Replace("+","-").Replace("/","_").TrimEnd("=")
  $UploadBytes = New-Object byte[] 48
  $Rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $Rng.GetBytes($UploadBytes) } finally { $Rng.Dispose() }
  $UploadToken = [Convert]::ToBase64String($UploadBytes).Replace("+","-").Replace("/","_").TrimEnd("=")
  @{ adminToken = $Token; uploadToken = $UploadToken; createdAt = (Get-Date).ToString("o") } | ConvertTo-Json | Set-Content -Encoding UTF8 $ConfigFile
  Write-Host "Private uploader invitation token is stored in $ConfigFile. Share only the uploadToken value with trusted users." -ForegroundColor Yellow
  Write-Host "Created a private upload token at $ConfigFile" -ForegroundColor Green
}
$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json
if (-not $Config.uploadToken) {
  $UploadBytes = New-Object byte[] 48
  $Rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $Rng.GetBytes($UploadBytes) } finally { $Rng.Dispose() }
  $Config | Add-Member -NotePropertyName uploadToken -NotePropertyValue ([Convert]::ToBase64String($UploadBytes).Replace("+","-").Replace("/","_").TrimEnd("=")) -Force
  $Config | ConvertTo-Json | Set-Content -Encoding UTF8 $ConfigFile
  Write-Host "Added a separate uploader invitation token to $ConfigFile" -ForegroundColor Yellow
}
$env:STORYSPACE_MEDIA_ADMIN_TOKEN = [string]$Config.adminToken
$env:STORYSPACE_MEDIA_UPLOAD_TOKEN = [string]$Config.uploadToken
$env:STORYSPACE_MEDIA_DIR = Join-Path $Root "media"
$env:STORYSPACE_MEDIA_HOST = "127.0.0.1"
$env:STORYSPACE_MEDIA_PORT = "8787"
$env:STORYSPACE_MEDIA_MAX_UPLOAD_BYTES = "16106127360"
Write-Host "Starting Storyspace Home Media on loopback only: http://127.0.0.1:8787" -ForegroundColor Cyan
Write-Host "Keep this window open while users are streaming. Press Ctrl+C to stop."
& node (Join-Path $Root "server.mjs")
