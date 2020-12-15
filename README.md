# Maslo Companion Kit


Clone the respository and ensure you have the requirements below.

### Requirements

 * React Native CLI development environment for both iOS and Android (instructions [`here`](https://reactnative.dev/docs/environment-setup)) 
 
 * Node.js 10 ([`nvm`](https://github.com/nvm-sh/nvm) is preferable)

 To install:
 ```nvm install 10```
 
 To switch to version 10:
 ```nvm use 10```
 
 * Expo CLI
 ```
 npm i -g expo-cli
 ```
 * React-native CLI
 ```
 npm i -g react-native-cli
 ```
 * Firebase Tools:
 ```
 npm i -g firebase-tools
 ```
 


## Configuration Setup

1. Copy the values from the `firebaseConfig` variable in the web app in the firebase console to the `FirebaseConfigs` variable in `./config/app.js`
2. Download the `GoogleService-Info.plist` file from the ios app on firebase. Place this file in `./mobile/configs/app`
3. Open `./mobile/ios.CompanionKit.xcworkspace` in Xcode. Right click on the project name and choose 'Add files to "Companion Kit"' and add the downloaded plist file. Ensure "Copy items if needed" is checked.
3. Copy the `GOOGLE_APP_ID` and `API_KEY` from the plist file into the ios object in the `FirebasePlatformOverrides` variable in `./config/app.js`. Then copy the `CLIENT_ID` to line 48 in the `GoogleConfigs` variable in the same file.
4. Copy the `REVERSED_CLIENT_ID` from the same plist file into line 39 in `./mobile/app.json`
5. In `./config/app.js` copy the url the staging dashboard has been deployed to on lines 117 and 118. (this url is linked below under "Maslo Dashboard").
6. Create `.runtimeconfig.json` in `./server/functions` with the following:

	```
	{
	  "envs": {
	    "project_name": "[appName]",
	    "sendgrid_api_key": "...",
	    "sendgrid_emails_validation_api_key": "...",
	    "is_prod": "false", // set false for staging,
	    "devlogin": true,
	    "twilio_phone_number_from": "...",
	    "twilio_auth_token": "...",
	    "twilio_account_sid": "..."
	  }
	}
	```
7. Add the Sendgrid API key to `./server/functions/.runtimeconfig.json` (get this key from a dev on the team)

## Run Setup Script

Navigate back to the root directory and run:

```
./bin/setup.bash
```

## Running the App

### Run & build app

* iOS: To run project locally run `yarn ios` from the `mobile/` folder
* Android: To run project locally run `yarn android` from the `mobile/` folder

## Maslo Dashboard

The staging dashboard is currently hosted [here](https://bipolarbridges.web.app/)

## Redeploy Cloud Functionality and Dashboard

After making any changes to the functions, firestore or the dashboard, you must redeploy to see the changes.

[insert steps for firebase init] - Rowan currently working on workaround for needing to do this

### Deploy Functions and Firestore

- Deploy only functions: Run `yarn deploy:functions:stage` from within the `./server/functions` dir
- Deploy functions and firestore: Run `yarn deploy:server:stage` from within the root dir


### Deploy Dashboard

1. Run `firebase target:apply hosting dashboard-staging <project-id>` from the `./server/functions` dir
2. Run `yarn deploy:dashboard:stage` from within the root dir




