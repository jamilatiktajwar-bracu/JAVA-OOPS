param(
  [Parameter(Mandatory=$true)][string]$VideoPath,
  [Parameter(Mandatory=$true)][string]$Title
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $env:LOCALAPPDATA "Storyspace\HomeMedia\media-host.json"
if (-not (Test-Path $ConfigFile)) { throw "Run Start-Storyspace-Media.ps1 once first to create the local admin token." }
if (-not (Test-Path -LiteralPath $VideoPath -PathType Leaf)) { throw "Video file not found: $VideoPath" }
$File = Get-Item -LiteralPath $VideoPath
$Extension = $File.Extension.ToLowerInvariant()
if ($Extension -notin @(".mp4",".m4v",".webm",".mov")) { throw "Supported formats: MP4, M4V, WebM, MOV." }
$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json
$EncodedTitle = [uri]::EscapeDataString($Title)
$EncodedFile = [uri]::EscapeDataString($File.Name)
$Uri = "http://127.0.0.1:8787/admin/upload?title=$EncodedTitle&filename=$EncodedFile"
Write-Host ("Uploading {0:N2} GB: {1}" -f ($File.Length / 1GB), $File.Name) -ForegroundColor Cyan
$Result = Invoke-RestMethod -Method Post -Uri $Uri -Headers @{ "x-storyspace-admin-token" = [string]$Config.adminToken } -ContentType "application/octet-stream" -InFile $File.FullName -TimeoutSec 0
$Result | ConvertTo-Json -Depth 5
Write-Host "Upload complete. Keep the media server running." -ForegroundColor Green
