# Maslo Coaching mobile

## App cloning & setup

### Required assets

* App name (short, full), full/short description, copyrights, privacy policy link
* App icon 1024x1024 (no alpha, no rounded corners)
* iOS marketing assets (no alpha channel)
* Android Marketing Assets

### Required infrastcture

* Firebase project on Blaze Plan

### Steps

1. Create app bundle ID (like `com.maslo.everee`) in Apple Dev Center with enabled 'Associated Domains', 'Push Notifications', 'Sign In with Apple'.
All profiles and certificates for iOS deployment can be managed via Expo.

2. Create iOS and Android apps in Firebase using app bundle id and package name (like `com.maslo.everee`). Download `GoogleService-Info.plist` and `google-services.json` and place them in `mobile/configs/<projectName>` folder. Use paths to them later during `app.json` setup.
Update `config/projects/<projectName>.js` from just downloaded `plist` and `json`:
 * `FirebasePlatformOverrides` with corresponding `appId` and `apiKey` fields
 * `GoogleConfigs` – `ExpoClientIdAndroid` and `ExpoClientIdIOS` (google client ids).

3. For iOS, ensure all necessary info is fill out in AppStore Connect; for Android – in Google Play Console.

4. Update iOS Firebase app with App Store ID and Team ID taken from AppStore Connect.
5. Update Android Firebase app with SHA certificate fingerprints after first build uploading.

6. Validate fields in `app.<project_id>.json`:

* `name` – app name in Expo
* `slug` – app unique id in Expo
* `version` – app version for Expo and iOS
* `icon` – app icon for Expo and iOS
* `splash/backgroundColor`
* `assetBundlePatterns` – should contains patterns for assets that will be included in the build
* `ios`
    * `icon`
    * `buildNumber`
    * `bundleIdentifier`
    * `config/googleSignIn/reservedClientId` – `REVERSED_CLIENT_ID` in `plist`
    * `associatedDomains` – magic link domains
    * `googleServicesFile`– path to `GoogleService-Info.plist`
    * `infoPlist`
* `android`
    * `config/googleSignIn` – take from `google-services.json`: `apiKey` (`api_key/current_key`), `certificateHash` (`oauth_client/client_id`)
    * `package`
    * `googleServicesFile` – path to `google-services.json`
    * `versionCode`
    * `intentFilters` – magic link domains

7. Enabled or disabled feature client-specific features in [`common/constants/features.ts`](../common/constants/features.ts)

## Run & build app

1. Ensure you've switched to desired project and call `yarn setup` in project root
2. To run project locally via Expo run `yarn start`. Ensure that correct `app.<projectName>.json` is used. Add ` -c` to clear build cache – it is required after switching the project and/or changing configs.

3. For building an APK (app bundle) or IPA use commands

```
yarn build:(ios|android):(stage|prod)
```

and manage all keystores/credentials via Expo.

It's important to use that commands because there's a wrapper that ensures correct project caught up.

Then follow default instructions to upload build artifacts to corresponding dashboards.

## Upload `ipa` to testflight via Fastlane

Install fastlane https://fastlane.tools/

```bash
fastlane pilot upload --skip_waiting_for_build_processing --skip_submission --ipa 'path/to/ipa'
```
