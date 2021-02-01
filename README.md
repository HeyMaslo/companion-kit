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

1. Download the `GoogleService-Info.plist` file from the ios app on firebase. Place this file in `./mobile/configs/app`.
2. Download the `google-services.json` file from the android app on firebase. Place this file in `./mobile/configs/app` and in `./mobile/android/app`.
3. Copy the `.env-starter` file to `.env` in the root directory, and fill in each variable with the correct values. Alternatively, obtain an environment file from another developer on the team.
4.  Now create `.env` in `./server/functions` with the following:

	```
	GOOGLE_APPLICATION_CREDENTIALS=/path/to/json/credentials
	```
	(we will fill in the path in the next step)
5. Go to the Google Cloud Platform [here](https://console.cloud.google.com/iam-admin/serviceaccounts?project=bipolarbridges). On the "App Engine default service account", click the three dots, select "Create key", and download the json file. Fill in the path to this downloaded file in the `.env` from the previous step.


## Run Setup Script

Navigate back to the root directory and run:

```
./bin/setup.bash
```

## Running the App

### Run & build app

* **IOS**: To run project locally run `yarn ios` from the `./mobile` directory
* **Android**: To run project locally the first time, open the android directory in android studio, sync with gradle and run the app. In subsequent runs, run `yarn android` from the `./mobile` directory

## Maslo Dashboard

The staging dashboard is currently hosted [here](https://bipolarbridges.web.app/)

## Redeploy Cloud Functionality and Dashboard

After making any changes to the functions, firestore or the dashboard, you must redeploy the changes to see them on the firebase project and the staging dashboard.

### Deploy Functions and Firestore

- **Deploy only functions**: Run `yarn deploy:functions:stage` from within the `./server/functions` directory
- **Deploy functions and firestore**: Run `yarn deploy:server:stage` from within the root directory


### Deploy Dashboard

1. Run `firebase target:apply hosting dashboard-staging <project-id>` from the `./server/functions` directory
2. Run `yarn deploy:dashboard:stage` from within the root directory
