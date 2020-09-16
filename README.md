# Maslo Companion App


Clone the respository and ensure you have the requirements below.

### Requirements

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
### Clone external dependencies

1. Create a folder inside of the ```mobile``` folder called ```dependencies``` and navigate inside it.
2. Clone both [Maslo Persona](https://github.com/HeyMaslo/maslo-persona/tree/dev-ts) from the dev-ts branch and [React Native Switch Pro](https://github.com/HeyMaslo/react-native-switch-pro) from the master branch inside the ```mobile/dependencies``` folder. To clone from a specific branch, use the command ```git clone -b <branch-name> <url>```.
3. Now rename the ```maslo-persona``` folder that you cloned in the previous step to ```persona```.


### Install dependencies and validate Node.js version

Navigate back to the root directory and run:

```
yarn all
```
### Install cocoapods

Navigate to the ```mobile/ios``` folder and run ```pod install```

## Mobile

### Run & build app

To run project locally via Expo run `react-native run-ios` from the `mobile/` folder


