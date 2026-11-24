param(
  [Parameter(Mandatory=$true)][ValidatePattern('^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}$')][string]$TunnelName,
  [Parameter(Mandatory=$true)][ValidatePattern('^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$')][string]$Hostname,
  [string]$TunnelId
)
$ErrorActionPreference = "Stop"
if (-not (Get-Command cloudflared -ErrorAction SilentlyContinue)) { throw "cloudflared is not installed. Install it, reopen PowerShell, and retry." }
$CloudflaredDir = Join-Path $env:USERPROFILE ".cloudflared"
New-Item -ItemType Directory -Force -Path $CloudflaredDir | Out-Null
$CertFile = Join-Path $CloudflaredDir "cert.pem"
if (-not (Test-Path $CertFile)) {
  Write-Host "A browser will open so you can authorize this PC in Cloudflare." -ForegroundColor Cyan
  & cloudflared tunnel login
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $CertFile)) { throw "Cloudflare login did not complete." }
}
if (-not $TunnelId) {
  Write-Host "Creating named tunnel '$TunnelName'..." -ForegroundColor Cyan
  $CreateOutput = (& cloudflared tunnel create $TunnelName 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0) { throw "Could not create tunnel. If it exists, rerun with -TunnelId <UUID>. $CreateOutput" }
  $Match = [regex]::Match($CreateOutput, '(?i)([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})')
  if (-not $Match.Success) { throw "Could not read the created tunnel UUID. $CreateOutput" }
  $TunnelId = $Match.Value
}
if ($TunnelId -notmatch '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$') { throw "TunnelId must be a Cloudflare tunnel UUID." }
$CredentialsFile = Join-Path $CloudflaredDir ($TunnelId + ".json")
if (-not (Test-Path $CredentialsFile)) { throw "Tunnel credentials not found: $CredentialsFile" }
Write-Host "Creating DNS route $Hostname..." -ForegroundColor Cyan
& cloudflared tunnel route dns $TunnelId $Hostname
if ($LASTEXITCODE -ne 0) { throw "DNS route failed. Confirm the hostname belongs to a zone in this Cloudflare account." }
$ConfigFile = Join-Path $CloudflaredDir "storyspace-home-media.yml"
$CredentialsForYaml = $CredentialsFile.Replace("\", "/") | ConvertTo-Json -Compress
$Config = @"
tunnel: $TunnelId
credentials-file: $CredentialsForYaml
ingress:
  - hostname: $Hostname
    service: http://127.0.0.1:8787
  - service: http_status:404
"@
Set-Content -Path $ConfigFile -Value $Config -Encoding UTF8
Write-Host "Tunnel config saved: $ConfigFile" -ForegroundColor Green
Write-Host "Public address: https://$Hostname" -ForegroundColor Green
Write-Host "Start Start-Storyspace-Media.ps1 first, then Run-Storyspace-Tunnel.ps1 in a second PowerShell window."
Write-Host "Keep both windows open. Never expose port 8787 or share adminToken."
