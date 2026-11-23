# iOS signed IPA build

The regular iOS workflow creates an unsigned Simulator app. The separate manual workflow creates a signed iOS IPA artifact when Apple signing materials are supplied. It does not upload the app to App Store Connect.

## Required Apple materials

Create/export an **Apple Distribution** certificate together with its private key as a password-protected P12. Create an App Store provisioning profile for the bundle identifier \`io.storyspace.app\` and the same Apple Developer Team.

Add these repository **Actions secrets**:

- \`IOS_CERTIFICATE_P12_BASE64\`: base64-encoded P12 file.
- \`IOS_CERTIFICATE_PASSWORD\`: P12 export password.
- \`IOS_PROVISIONING_PROFILE_BASE64\`: base64-encoded \`.mobileprovision\` file.
- \`APPLE_TEAM_ID\`: Apple Developer Team ID.

macOS/Linux base64 encoding:

~~~bash
base64 < Storyspace-Distribution.p12 | tr -d '\\n'
base64 < Storyspace-AppStore.mobileprovision | tr -d '\\n'
~~~

Set the repository **Actions variable** \`STORYSPACE_API_ROOT\` to the absolute HTTPS API base URL. Without it, the native app will show that account sign-in is not configured.

## Build

Open GitHub Actions → **Storyspace iOS Signed IPA** → Run workflow. Check \`confirm_signed_build\` only after all four secrets are configured. The workflow validates the provisioning profile Team ID and bundle identifier, installs signing material on an ephemeral runner keychain, archives the app, exports an IPA, uploads the artifact, and removes temporary signing files.

The workflow does not submit the IPA for App Store review. Test the artifact on authorized devices/TestFlight and complete privacy, export compliance, entitlement, and App Store review requirements separately.
