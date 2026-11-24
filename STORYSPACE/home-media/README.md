# Storyspace Home Media (Windows PC host)

This optional home-host service streams files from your Windows PC using HTTP byte ranges. It binds to **127.0.0.1 only**; do not expose port 8787 directly on your router. Publish it through a Cloudflare Tunnel (or another authenticated/reviewed HTTPS tunnel) after you have configured the tunnel yourself.

## Requirements

- Windows 10/11
- Node.js 20 LTS or newer
- A stable, always-on PC and reliable upload bandwidth
- For a permanent public address: a domain managed in Cloudflare and a named Cloudflare Tunnel
- Only upload media you own or are authorized to distribute to all Storyspace users

## Start the local server

1. Open PowerShell.
2. Run \`cd path\\to\\JAVA-OOPS\\STORYSPACE\\home-media\`.
3. Run \`Set-ExecutionPolicy -Scope Process Bypass\` if PowerShell blocks local scripts.
4. Run \`./Start-Storyspace-Media.ps1\`.
5. Leave that PowerShell window open. Check \`http://127.0.0.1:8787/health\`.

The first run creates a private upload token under \`%LOCALAPPDATA%\\Storyspace\\HomeMedia\\media-host.json\`. Keep this file private. It is not committed to Git.

## Upload your movie

In a second PowerShell window, run:

\`\`\`powershell
./Upload-Movie.ps1 -VideoPath "D:\\Movies\\YourMovie.mp4" -Title "Your Movie"
\`\`\`

Supported containers: MP4, M4V, WebM, MOV. The default upload limit is 15 GiB. Files are stored under this folder's \`media\\\` directory, which is intentionally ignored by Git. Uploads use a private admin header; public catalog and playback are read-only.

## Public HTTPS tunnel (do not port-forward)

For a durable public hostname, install \`cloudflared\`, sign in to Cloudflare, create a named tunnel, and route a hostname such as \`media.example.com\` to \`http://127.0.0.1:8787\`. Keep the tunnel credentials private and run the tunnel as a Windows service or scheduled task. In Cloudflare, configure the hostname's tunnel route to this local service. Do **not** create router port-forwarding rules and do not bind this service to 0.0.0.0.

A temporary Quick Tunnel can be used for a short connectivity test, but its random hostname is not a production URL and can change when restarted. A permanent hostname requires a domain in your Cloudflare account. Do not paste tunnel credentials or the admin token into chat or GitHub.

After the tunnel is active, test:
- \`https://YOUR-HOSTNAME/health\`
- \`https://YOUR-HOSTNAME/api/catalog\`

The catalog is public by design because you selected “all users”. The media URLs are unlisted UUID paths, not DRM or copy protection. Anyone who obtains a playback URL can share it. For stronger protection, use authenticated, expiring playback URLs and a proper identity integration before distributing private content.

## Bandwidth and availability

The PC must remain powered on, awake, connected to the Internet, and running both the media server and tunnel. Upload bandwidth is the bottleneck: one 8 Mbps stream consumes roughly 8 Mbps of sustained upstream bandwidth per viewer. Multiple simultaneous viewers multiply that requirement. ISP data caps, CGNAT/tunnel limits, Windows sleep, power loss, and home-network outages can interrupt playback. A home PC is suitable for a personal prototype, not a reliable global streaming origin.

## Current integration boundary

This service supplies a public JSON catalog at \`/api/catalog\` and byte-range video at \`/media/{uuid}\`. It is a hosting foundation; the main Storyspace catalogue/player still needs a frontend + API integration and the public HTTPS hostname must be configured before the movie appears in the app. This does not deploy the service onto your PC automatically.
