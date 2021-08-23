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

If you are setting up the project for the first time, follow the steps below. Otherwise, you may want to check out the instructions in the following section.

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

### 3. (Optional) Importing Environment from an Existing Project Instance

If you have an already set-up clone of the project on your machine, and wish to copy the configuration over to a fresh clone - sometimes useful in cases of failed setup, broken dependencies etc.- you can run the provided script to automate the process, e.g.

```sh
bash bin/migrate-project.bash <path-to-old-project> <path-to-new-project>
```

## Running and Deploying the App

### Run Mobile Apps Locally on a Simulator

**iOS**: To run project locally run `yarn ios` from the `./mobile` directory

**Android**: To run project locally the first time, open the android directory in android studio, sync with gradle and run the app. In subsequent runs, run `yarn android` from the `./mobile` directory

### Run Mobile Apps Locally on a Real Device

**iOS** (Mac Instructions):

1. Open `./mobile/ios/CompanionKit.xcworkspace` in Xcode
2. In the menu bar (top of screen), go to: Xcode > Preferences > Accounts and sign in with your Apple ID
3. Click the folder icon in the left navigation pane, and click on “CompanionKit”
4. In the tabs that open, select “Signing and Capabilities"
5. Remove the “Associated Domains” capability
6. Select “Automatically manage signing”
7. In the “Team dropdown, select your personal team
8. Open “Keychain Access” from your search bar and on the left navigation pane, ensure “login” is selected
9. In the tabs that open, select the “Certificates” tab. Find your apple development key, right click and select “Get Info”. In the pop-up that opens, select “Access Control”, and add Xcode with the plus button. (You may also need to follow this step again in the “Keys” tab)
10. Change the bundle id in your `.env` file to something unique and run `yarn env:set` from the root directory
11. Run the app on your physical device through Xcode. When prompted, "CompanionKit" would like to find and connect to local devices on your network choose OK otherwise you will receive a bundle.js error and not be able to run. If you tapped Don't Allow delete CompanionKit from your iPhone and retry.

**Android** (Mac Instructions):

1. Enable "DEVELOPER OPTIONS" by going to Settings > About phone > Software Information
2. Scroll to the bottom and tap on "Build number" seven times (you will see a countdown to let you know when you get to 7)
3. Go back to Settings > Developer options, and enable "USB Debugging"
4. Plug in your device via USB and run `adb devices` on your terminal (this verifies connection to the Android Debug Bridge)
5. You should see "List of devices attached". Make sure your device is listed
6. Run the app on your physical device by running `yarn android`


### Deploy Cloud Functionality

After making any changes to the functions, firestore or the dashboard, you must redeploy the changes to see them on the firebase project and the staging dashboard.

- **Deploy only functions**: Run `yarn deploy:functions:stage` from within the `./server/functions` directory
- **Deploy functions and firestore**: Run `yarn deploy:server:stage` from within the root directory

### Deploy Dashboard

1. Run `firebase target:apply hosting dashboard-staging <project-id>` from the `./server/functions` directory
2. Run `yarn deploy:dashboard:stage` from within the root directory

The staging dashboard is currently hosted [here](https://bipolarbridges.web.app/)

## Testing Code
All tests are currently in the `server/functions` directory. To run tests, navigate there and run
```
yarn test
```
This same command is used by the CI workflow to guarantee correctness on commits.