# Bipolar Bridges Companion Kit

This is a fork of [HeyMaslo/companion-kit](https://github.com/HeyMaslo/companion-kit) that is extended to include features specifically for the Bipolar Bridges project.

## Setup

The steps below are required to set up a local instance of this project. The subsequent section outlines how to run the applications and deploy new functionality to the firebase server after the project has been set up.

### 1. Install Requirements

Clone the respository and ensure you have the requirements below:

 * React Native CLI development environment for both iOS and Android (Needed for running mobile apps. Xcode and Android studio must be installed in order to run iOS and android apps, respectively.)  
 Instructions: [https://reactnative.dev/docs/environment-setup](https://reactnative.dev/docs/environment-setup)

 * Node.js 10 ([`nvm`](https://github.com/nvm-sh/nvm) is preferable)  
 To install:  ```nvm install 10```	
 To switch to version 10:  ```nvm use 10```
 
 * Expo CLI  
 To install: ```npm i -g expo-cli```
 
 * React-native CLI  
 To install: ```npm i -g react-native-cli```
 
 * Firebase Tools (Needed to test and deploy firebase functions, dashboard etc.)  
 To install: ```npm i -g react-native-cli```

### 2. Configure the Development Environment

1. Download the `GoogleService-Info.plist` file from the ios app on firebase. Place this file in `./mobile/configs/app`.
2. Download the `google-services.json` file from the android app on firebase. Place this file in `./mobile/configs/app` and in `./mobile/android/app`.
3. Copy the `.env-starter` file to `.env` in the root directory, and fill in each variable with the correct values. Alternatively, obtain an environment file from another developer on the team.
4. From the root directory, run (examine the script first!)
    ```
    ./bin/setup.bash
    ```
5.  Now create `.env` in `./server/functions` with the following:
	```
	GOOGLE_APPLICATION_CREDENTIALS=/path/to/json/credentials
	```
	(we will fill in the path in the next step)

6. Go to the Google Cloud Platform [here](https://console.cloud.google.com/iam-admin/serviceaccounts?project=bipolarbridges). On the "App Engine default service account", click the three dots, select "Create key", and download the json file. Fill in the path to this downloaded file in the `.env` from the previous step.
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
