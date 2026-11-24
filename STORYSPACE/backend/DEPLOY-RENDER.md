# Deploy Storyspace API to Render

This repository includes a Render Blueprint at the root (`render.yaml`) and a Docker image build for the Spring Boot API.

## Deploy
1. Sign in to Render and connect this GitHub repository.
2. Choose **New → Blueprint** and select this repository. Render reads `render.yaml` to create the web service and PostgreSQL database.
3. Review the resources, plan/pricing, and approve deployment.
4. Wait for the service to finish deploying. Open its Render URL and verify `/api/health` returns healthy.
5. In GitHub repository settings, set the Actions variable `STORYSPACE_API_ROOT` to the deployed HTTPS API URL ending in `/api` (for example `https://storyspace-api.onrender.com/api`).
6. Run the **Storyspace Android APK** workflow manually. Download its `storyspace-android-debug` artifact and install the APK.

## Required before public production
- Review Render plan and PostgreSQL cost/retention before approving resources.
- Configure CORS with exact production web origin(s), not wildcards.
- Configure backups, monitoring, email verification/password reset, abuse/rate limiting and token revocation.
- Use only media for which streaming rights are cleared; media CDN/DRM is not configured by this deployment template.

The Blueprint provisions infrastructure only after you approve it in your Render account. It does not deploy automatically from this repository.
