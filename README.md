# Bipolar Bridges Companion Kit

This is a fork of [HeyMaslo/companion-kit](https://github.com/HeyMaslo/companion-kit) that is extended to include features specifically for the Bipolar Bridges project.

## Setup

The steps below are required to set up a local instance of this project. The subsequent section outlines how to run the applications and deploy new functionality to the firebase server after the project has been set up.

### 1. Install Requirements

Clone the respository and ensure you have the requirements below:

 * React Native CLI development environment for both iOS and Android (instructions [`here`](https://reactnative.dev/docs/environment-setup))

 * Node.js 10 ([`nvm`](https://github.com/nvm-sh/nvm) is preferable)  
 To install:  ```nvm install 10```	
 To switch to version 10:  ```nvm use 10```
 
 * Expo CLI  
 To install: ```npm i -g expo-cli```
 
 * React-native CLI  
 To install: ```npm i -g react-native-cli```
 
 * Firebase Tools:  
 To install: ```npm i -g firebase-tools```


### 2. Configure the Development Environment

1. Copy the values from the `firebaseConfig` variable in the web app in the firebase console to the `FirebaseConfigs` variable in `./config/app.js`.
2. Download the `GoogleService-Info.plist` file from the ios app on firebase. Place this file in `./mobile/configs/app`.
3. Copy the `GOOGLE_APP_ID` and `API_KEY` from the plist file you just downloaded into the ios object in the `FirebasePlatformOverrides` variable in `./config/app.js`. Then copy the `CLIENT_ID` from the same plist file to line 48 in the `GoogleConfigs` variable in `./config/app.js`.
4. Copy the `REVERSED_CLIENT_ID` from the same plist file into line 39 in `./mobile/app.json`.
5. Download the `google-services.json` file from the android app on firebase. Place this file in `./mobile/configs/app` and in `./mobile/android/app`.
6. Copy the `current_key` and `mobilesdk_app_id` from the json file you just downloaded into the android object in the `FirebasePlatformOverrides` variable in `./config/app.js`. Then copy the `client_id` on line 18 to line 47 of the same `app.js` file.
7. Again from the downloaded json file, copy the `current_key` and the `certificate_hash` to lines 54 and 55 of `./mobile/app.json`.
8. Create `.runtimeconfig.json` in `./server/functions` with the following:

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
9. Add the Sendgrid API key to the `.runtimeconfig.json` file you just created (get this key from a dev on the team).
10. Now create `.env` in `./server/functions` with the following:

	```
	GOOGLE_APPLICATION_CREDENTIALS=/path/to/json/credentials
	```
	(we will fill in the path in the next step)
11. Go to the Google Cloud Platform [here](https://console.cloud.google.com/iam-admin/serviceaccounts?project=bipolarbridges). On the "App Engine default service account", click the three dots, select "Create key", and download the json file. Fill in the path to this downloaded file in the `.env` from the previous step.
12. Open the `./mobile/ios` folder in Xcode. Go to the "Info" tab and scroll down to "URL Types". Add a new URL type with a "Role" of "Editor" and in "URL Schemes" paste in the `REVERSED_CLIENT_ID` from the plist file you downloaded earlier.


### 3. Run the Setup Script

Navigate back to the root directory and run:

```
./bin/setup.bash
```

## Running and Deploying the App

### Run Mobile Apps Locally

* **iOS**: To run project locally run `yarn ios` from the `./mobile` directory
* **Android**: To run project locally the first time, open the android directory in android studio, sync with gradle and run the app. In subsequent runs, run `yarn android` from the `./mobile` directory

### Deploy Cloud Functionality

After making any changes to the functions, firestore or the dashboard, you must redeploy the changes to see them on the firebase project and the staging dashboard.

- **Deploy only functions**: Run `yarn deploy:functions:stage` from within the `./server/functions` directory
- **Deploy functions and firestore**: Run `yarn deploy:server:stage` from within the root directory

### Deploy Dashboard

1. Run `firebase target:apply hosting dashboard-staging <project-id>` from the `./server/functions` directory
2. Run `yarn deploy:dashboard:stage` from within the root directory

The staging dashboard is currently hosted [here](https://bipolarbridges.web.app/)
