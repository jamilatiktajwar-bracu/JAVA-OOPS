# Android signed release bundle

The debug APK workflow is for sideload testing. A separate manual workflow can build and verify a signed Play Store Android App Bundle (AAB). It does not publish to Google Play.

## One-time setup

Generate a private upload/release keystore and keep a secure offline backup. Never commit the keystore or its passwords.

~~~bash
keytool -genkeypair -v -keystore storyspace-release.jks -keyalg RSA -keysize 4096 -validity 10000 -alias storyspace
~~~

Add these repository **Actions secrets**:

- \`ANDROID_KEYSTORE_BASE64\`: base64-encoded contents of the JKS/PKCS12 keystore.
- \`ANDROID_KEYSTORE_PASSWORD\`: keystore password.
- \`ANDROID_KEY_ALIAS\`: key alias (for example, \`storyspace\`).
- \`ANDROID_KEY_PASSWORD\`: key password.

macOS/Linux base64 encoding:

~~~bash
base64 < storyspace-release.jks | tr -d '\\n'
~~~

Set the repository **Actions variable** \`STORYSPACE_API_ROOT\` to the absolute HTTPS API base URL, such as \`https://api.example.com/api\`. If it is not set, the build can still be created, but native account sign-in will explicitly remain unavailable.

## Build

Open GitHub Actions → **Storyspace Android Signed AAB** → Run workflow. Check \`confirm_signed_build\` only after the four signing secrets are configured. On success, download the \`storyspace-android-signed-aab\` artifact and upload it to the Play Console using the normal Play release process.

The workflow removes the temporary keystore from the runner after completion. Never replace/lose the signing key after publishing; key rotation must follow Google Play App Signing procedures.
