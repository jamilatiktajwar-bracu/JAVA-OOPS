# Storyspace Home Media (Windows PC host)

This optional service streams media from your Windows PC using HTTP byte ranges. It binds to **127.0.0.1 only**; never expose port 8787 directly through your router. Publish it through a reviewed HTTPS tunnel after configuring that tunnel yourself.

## Requirements

- Windows 10/11 and Node.js 20 LTS or newer
- A powered-on PC, reliable Internet connection, and sufficient upload bandwidth
- For a permanent public address, a domain and a configured Cloudflare named tunnel
- Only upload media you own or are authorized to distribute to all users

## Start the local server

1. Open PowerShell in this folder.
2. Run \`Set-ExecutionPolicy -Scope Process Bypass\` if needed.
3. Run \`./Start-Storyspace-Media.ps1\`.
4. Keep the window open. Check \`http://127.0.0.1:8787/health\`.

The first run creates \`%LOCALAPPDATA%\\Storyspace\\HomeMedia\\media-host.json\` with two separate secrets:
- \`adminToken\`: private owner-only approval/admin access. Never share it.
- \`uploadToken\`: uploader invitation key. Share only with people you trust to submit media. It is a shared invitation key, not per-user accounts; rotate it by changing the value and restarting the service if it leaks.

The startup script also upgrades older config files by generating a missing upload invitation key.

## Upload and approval API

Uploads use persistent chunks (default 8 MiB) and can resume from the server's last accepted byte offset after a network interruption or server restart.

1. Uploader calls \`POST /api/uploads/init\` with JSON \`{ "title": "Movie title", "filename": "movie.mp4", "size": 123456 }\` and header \`x-storyspace-upload-token\`.
2. Uploader sends chunks to \`PUT /api/uploads/{uploadId}/chunk\`, with \`x-upload-offset\` set to the exact current byte offset.
3. On reconnect, call \`GET /api/uploads/{uploadId}\` to retrieve the accepted offset, then continue from there.
4. Call \`POST /api/uploads/{uploadId}/complete\` when all bytes are sent. The item enters the private pending queue.
5. Owner reviews \`GET /admin/pending\` using \`x-storyspace-admin-token\`. Approve/reject with \`POST /admin/review/{id}\` and JSON \`{ "action": "approve" }\` or \`{ "action": "reject" }\`.

Only approved items appear in \`GET /api/catalog\` or stream through \`/media/{id}\`. Pending uploads are not publicly playable. The older \`POST /admin/upload\` endpoint is retained for owner uploads, but its result also requires approval.

The upload invitation key is currently shared across invited uploaders. It does not provide individual user identity, per-user quotas, or per-user revocation. Do not embed either secret in the public app bundle. A secure registered-user integration requires the production Storyspace account backend and short-lived per-user upload credentials.

## Public HTTPS tunnel

For a permanent public hostname, configure a Cloudflare named tunnel to \`http://127.0.0.1:8787\`. A temporary Quick Tunnel URL changes when restarted and is not suitable as a permanent app endpoint. Do not configure router port forwarding or bind this service to \`0.0.0.0\`.

## Important limits

- If the PC is off, no remote upload can reach it. The uploader must keep the original file and its client queue must retry when the PC becomes reachable.
- This backend persists accepted chunks on the PC, but the current Storyspace UI does not yet include an uploader, IndexedDB queue, admin approval screen, or endpoint discovery. API support alone does not make the workflow visible in the app.
- A closed app/device cannot be promised to retry uploads on every platform. Reliable background transfers need platform-specific native work and OS permission.
- The PC must stay awake with this service and tunnel running for streaming. Home upload bandwidth limits concurrent viewers. This is a prototype origin, not a CDN or reliable global streaming service.
- Media URLs are unlisted, not DRM or copy protection. Anyone with a published URL can share it.
