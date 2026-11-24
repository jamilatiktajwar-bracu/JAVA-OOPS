# Storyspace Home Media (Windows PC host)

This optional service streams owner-approved media from your Windows PC using HTTP byte ranges. It binds to **127.0.0.1 only**; never expose port 8787 directly through your router. A Cloudflare named tunnel can publish it through HTTPS without router port forwarding.

## Requirements

- Windows 10/11 and Node.js 20 LTS or newer
- Cloudflared installed on the PC
- A Cloudflare account and a domain/hostname managed in that account for a stable public address
- A powered-on PC, reliable Internet connection, and sufficient upload bandwidth
- Only upload media you own or are authorized to distribute to all users

## 1. Start the local media server

1. Open PowerShell in this folder.
2. If script execution is blocked, run `Set-ExecutionPolicy -Scope Process Bypass` in that window.
3. Run `./Start-Storyspace-Media.ps1`.
4. Keep the window open. Confirm the health endpoint reports `ok: true`: `http://127.0.0.1:8787/health`.

The first run creates `%LOCALAPPDATA%\Storyspace\HomeMedia\media-host.json` with two separate secrets:

- `adminToken`: private owner-only approval/admin access. Never share it or paste it into a public issue, repository, or screenshot.
- `uploadToken`: uploader invitation key. Share only with people you trust to submit media. It is a shared invitation key, not per-user accounts; rotate it by changing the value and restarting the service if it leaks.

The startup script upgrades older config files by generating a missing upload invitation key. Keep the config file private.

## 2. Configure a stable HTTPS address (one-time setup)

Install Cloudflared on Windows and ensure `cloudflared --version` works in a new PowerShell window. Then, from this folder, run:

```powershell
./Setup-Cloudflare-Tunnel.ps1 -TunnelName storyspace-home-media -Hostname media.yourdomain.com
```

Replace `media.yourdomain.com` with a hostname in a domain/zone already managed by your Cloudflare account. The script opens Cloudflare login if this PC has not been authorized, creates a named tunnel, creates the DNS route, and saves a local config under `%USERPROFILE%\.cloudflared\storyspace-home-media.yml`. Cloudflare login and domain authorization require your action; this repository cannot do them for you.

For an existing named tunnel created on this same PC, pass its UUID with `-TunnelId` to skip tunnel creation. Do not commit the local Cloudflare credentials or config files.

For each session, keep the media server window running, then open a second PowerShell window and run:

```powershell
./Run-Storyspace-Tunnel.ps1
```

The tunnel forwards HTTPS requests to `http://127.0.0.1:8787`. Do not configure router port forwarding, bind the media server to `0.0.0.0`, or expose port 8787 directly. Both the PC and both processes must remain running for uploads and playback. A Quick Tunnel is temporary and is not a substitute for this named tunnel.

## 3. Connect Storyspace and upload

1. Open the Storyspace app and choose **Upload**.
2. Enter the public HTTPS address from the tunnel setup (for example, `https://media.yourdomain.com`).
3. Enter the `uploadToken` value from the private `media-host.json` file and save the connection.
4. Enter a title, select an MP4/M4V/WebM/MOV file, and start the upload. The server accepts files up to 15 GB in 8 MiB resumable chunks.
5. Open the owner approval section in Upload, enter the private `adminToken`, load pending uploads, then approve or reject each item.
6. Approved items appear in the Community Library and stream through the HTTPS tunnel.

The app keeps connection settings in the current browser session. Its upload queue stores metadata in IndexedDB and, where supported, a file handle. If the browser cannot retain a handle or the app/browser is closed, you may need to reselect the original file to resume. Keep the source video until the upload is fully approved and verified.

## Security and operating limits

- The upload invitation key is currently shared among invited uploaders. It does not provide individual user identity, per-user quotas, or per-user revocation. Do not embed either secret in the public app bundle. A secure registered-user integration needs the production Storyspace account backend and short-lived per-user upload credentials.
- Owner admin requests use a separate admin header. The web client omits ambient browser credentials and does not send the admin key as the uploader key.
- If the PC is off, asleep, offline, or either process stops, remote upload and playback stop. Configure Windows power settings so the PC does not sleep during hosting.
- Home upload bandwidth limits concurrent viewers. This is a prototype origin, not a CDN or reliable global streaming service. Large files may use substantial upstream bandwidth and data allowance.
- Media URLs are unlisted, not DRM or copy protection. Anyone with a published URL can share it. Do not upload content you lack rights to distribute.
- A successful CI build does not prove a 5–10 GB upload or playback from another country. Test with a small authorized file first, then a large file, and verify from a separate network before inviting viewers.
