param([string]$ConfigFile = (Join-Path $env:USERPROFILE ".cloudflared\storyspace-home-media.yml"))
$ErrorActionPreference = "Stop"
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) { throw "cloudflared is not installed." }
if (-not (Test-Path $ConfigFile)) { throw "Tunnel config not found: $ConfigFile. Run Setup-Cloudflare-Tunnel.ps1 first." }
Write-Host "Starting Storyspace HTTPS tunnel. Press Ctrl+C to stop." -ForegroundColor Cyan
& cloudflared tunnel --config $ConfigFile run
if ($LASTEXITCODE -ne 0) { throw "Cloudflare Tunnel stopped with exit code $LASTEXITCODE." }
