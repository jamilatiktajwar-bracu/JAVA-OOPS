# Storyspace Home Media (Windows PC host)

This optional service streams owner-approved media from your Windows PC using HTTP byte ranges. It binds only to loopback addresses (`127.0.0.1`, `::1`, or `localhost`) and rejects public bind addresses even if `STORYSPACE_MEDIA_HOST` is misconfigured; never expose port 8787 directly through your router. You can publish it through a temporary Cloudflare Quick Tunnel (no domain or Cloudflare account required) or a stable named tunnel with your own domain.

Catalog entries are validated before use: media filenames must be the generated UUID plus a supported extension, and the stored MIME type, title, size, and timestamp must be valid. Unsafe or malformed entries are ignored, preventing a tampered catalog filename from being used for streaming or moderation file deletion.

## Requirements

- Windows 10/11 and Node.js 20 LTS or newer
- Internet access and sufficient upload bandwidth
- Only upload media you own or are authorized to distribute to all users

## 1. Start a temporary public HTTPS link (easiest)

1. Open PowerShell in this folder (or open the folder in File Explorer and choose **Open in Terminal**).
2. If script execution is blocked, run `Set-ExecutionPolicy -Scope Process Bypass` in that window.
3. Run:

   ```powershell
   ./Start-Storyspace-Quick-Tunnel.ps1
   ```

4. The script checks for the local media server and starts it in a separate PowerShell window if needed. Keep that server window open.
5. If Cloudflared is missing, the script tries to install it using Windows Package Manager (`winget`). If that is unavailable, install Cloudflared from the official [Cloudflare downloads page](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) and rerun the script.
6. Wait for Cloudflared to print a public URL similar to `https://random-words.trycloudflare.com`. Copy that HTTPS URL into Storyspace **Upload** as the media server address.
7. Keep both the media-server window and tunnel window open. Press Ctrl+C in the tunnel window to stop public access.

Quick Tunnels do not require a domain, DNS setup, Cloudflare login, router port forwarding, or opening port 8787 to the Internet. The generated URL is temporary and may change when the tunnel restarts. Anyone who has the URL can reach the public media service, so share it carefully.

## 2. Start the local media server manually (optional)

If you prefer to start the server yourself, open PowerShell in this folder and run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
./Start-Storyspace-Media.ps1
```

Keep the window open. Confirm the health endpoint reports `ok: true`: `http://127.0.0.1:8787/health`. Then start the Quick Tunnel from a second PowerShell window:

```powershell
./Start-Storyspace-Quick-Tunnel.ps1
```

The first server run creates `%LOCALAPPDATA%\Storyspace\HomeMedia\media-host.json` with two separate secrets:

- `adminToken`: private owner-only approval/admin access. Never share it or paste it into a public issue, repository, or screenshot.
- `uploadToken`: uploader invitation key. Share only with people you trust to submit media. It is a shared invitation key, not per-user accounts; rotate it by changing the value and restarting the service if it leaks.

Keep the config file private.

## 3. Configure a stable HTTPS address (optional, requires your domain)

For a permanent hostname, install Cloudflared and ensure `cloudflared --version` works in a new PowerShell window. Then run:

```powershell
./Setup-Cloudflare-Tunnel.ps1 -TunnelName storyspace-home-media -Hostname media.yourdomain.com
```

Replace the hostname with one in a domain/zone managed by your Cloudflare account. The script opens Cloudflare login if needed, creates a named tunnel and DNS route, and saves a local config under `%USERPROFILE%\.cloudflared\storyspace-home-media.yml`. Cloudflare login and domain authorization require your action. For each session, keep the media server running and launch:

```powershell
./Run-Storyspace-Tunnel.ps1
```

Do not commit local Cloudflare credentials or config files. A named tunnel is optional; use the Quick Tunnel above if you do not own a domain.

## 4. Connect Storyspace and upload

1. Open Storyspace and choose **Upload**.
2. Enter the public HTTPS address printed by Cloudflared (Quick Tunnel) or your named hostname.
3. Enter the `uploadToken` value from the private `media-host.json` file and save the connection.
4. Enter a title, select an MP4/M4V/WebM/MOV file, and start the upload. The server accepts files up to 15 GB in 8 MiB resumable chunks. Incomplete upload sessions and abandoned staging files are automatically removed after 7 days by default; set `STORYSPACE_MEDIA_SESSION_TTL_MS` to a value of at least `3600000` milliseconds to change this retention period.
5. Open the owner approval section in Upload, enter the private `adminToken`, load pending uploads, then approve or reject each item.
6. Approved items appear in the Community Library and stream through the HTTPS tunnel.

The app keeps connection settings in the current browser session. Its upload queue stores metadata in IndexedDB and, where supported, a file handle. If the browser cannot retain a handle or the app/browser is closed, you may need to reselect the original file to resume. Keep the source video until the upload is fully approved and verified.

## 5. Verify keys and troubleshoot authorization

The Storyspace Upload connection form checks the media server's `/health` endpoint and verifies the uploader invitation key before saving it. The owner approval panel separately verifies the admin key before loading pending uploads. A healthy tunnel alone does not prove either key is correct.

On the Windows PC, copy the correct key directly to the clipboard without printing it:

```powershell
# Uploader invitation key
(Get-Content "$env:LOCALAPPDATA\\Storyspace\\HomeMedia\\media-host.json" -Raw | ConvertFrom-Json).uploadToken | Set-Clipboard

# Owner-only admin key
(Get-Content "$env:LOCALAPPDATA\\Storyspace\\HomeMedia\\media-host.json" -Raw | ConvertFrom-Json).adminToken | Set-Clipboard
```

Paste each key only into its matching field. Never interchange the two keys. If you replace either value in `media-host.json`, stop and restart the Storyspace Media Server process: the running Node.js process reads the secrets when it starts and will not automatically reload edited configuration. Keep keys out of screenshots, chat messages, repository files, and public links.

## Security and operating limits

- The upload invitation key is shared among invited uploaders. It does not provide individual user identity, per-user quotas, or per-user revocation. Do not embed either secret in the public app bundle. A secure registered-user integration needs the production Storyspace account backend and short-lived per-user upload credentials.
- This prototype runs as a single Node.js server process. Upload-session and catalog locks serialize concurrent requests within that process; they are not distributed locks and do not protect multiple server instances sharing the same files. Run one media-server instance per storage directory.
- Catalog updates use serialized read-modify-write transactions and atomic file replacement. If catalog persistence fails during chunked-upload completion, the completed media file is moved back into staging so the upload can be retried rather than silently orphaned.
- Published media supports single byte ranges (including suffix and open-ended ranges), `HEAD`, ETag/Last-Modified validators, conditional `If-None-Match`, and `If-Range` fallback. Unsupported multi-range requests return `416`; stream errors terminate the response cleanly.
- Owner admin requests use a separate admin header. The web client omits ambient browser credentials and does not send the admin key as the uploader key.
- If the PC is off, asleep, offline, or either process stops, remote upload and playback stop. Configure Windows power settings so the PC does not sleep during hosting.
- Home upload bandwidth limits concurrent viewers. This is a prototype origin, not a CDN or reliable global streaming service. Large files may use substantial upstream bandwidth and data allowance.
- A Quick Tunnel URL is temporary and unlisted, not access control, DRM, or copy protection. Anyone with a published media URL can share it. Do not upload content you lack rights to distribute.
- The script starts the media server and tunnel in separate windows; it does not install a Windows service or guarantee restart after reboot.
- A successful CI build does not prove a 5–10 GB upload or playback from another country. Test with a small authorized file first, then a large file, and verify from a separate network before inviting viewers.

### HTTP server lifecycle
- Header parsing is capped at 15 seconds, request bodies at 30 minutes, keep-alive at 5 seconds, and header count at 100. The 30-minute request window supports large uploads on slower connections.
- SIGINT/SIGTERM stops accepting new requests, closes idle connections, drains active work, and force-closes remaining sockets after a 30-second grace period.

### Playback integrity
- Before streaming, the server checks the media file's actual size against its catalog record and returns HTTP 503 for truncated or otherwise size-mismatched media instead of presenting a broken stream as healthy.
