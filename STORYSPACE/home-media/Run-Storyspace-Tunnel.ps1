param([string]$ConfigFile = (Join-Path $env:USERPROFILE ".cloudflared\storyspace-home-media.yml"))
$ErrorActionPreference = "Stop"
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) { throw "cloudflared is not installed." }
if (-not (Test-Path $ConfigFile)) { throw "Tunnel config not found: $ConfigFile. Run Setup-Cloudflare-Tunnel.ps1 first." }
$ConfigText = Get-Content -Raw $ConfigFile
$TunnelMatch = [regex]::Match($ConfigText, '(?im)^tunnel:\s*([a-f0-9-]{36})\s*$')
if (-not $TunnelMatch.Success) { throw "Tunnel UUID is missing or invalid in $ConfigFile." }
$TunnelId = $TunnelMatch.Groups[1].Value
Write-Host "Starting Storyspace HTTPS tunnel $TunnelId. Press Ctrl+C to stop." -ForegroundColor Cyan
& cloudflared tunnel --config $ConfigFile run $TunnelId
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Tunnel stopped with exit code $LASTEXITCODE." }
