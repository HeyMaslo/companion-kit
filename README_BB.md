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
 * Firebase Tools:
 ```
 npm i -g firebase-tools
 ```
### Clone external dependencies

1. Create a folder inside of the ```mobile``` folder called ```dependencies``` and navigate inside it.
2. Clone both [Maslo Persona](https://github.com/HeyMaslo/maslo-persona/tree/dev-ts) from the dev-ts branch and [React Native Switch Pro](https://github.com/HeyMaslo/react-native-switch-pro) from the master branch inside the ```mobile/dependencies``` folder.
3. Now rename the ```maslo-persona``` folder that you cloned in the previous step to ```persona```.


### Install dependencies and validate Node.js version

Navigate back to the root directory and run:
```
yarn all
```

### Configuration files references

Environment config file `./server/functions/.env` (should be created if not exists).
    * .env file content `GOOGLE_APPLICATION_CREDENTIALS=/path/to/json/credentials`
   
### Validate fields in app.json

1. ios.bundleIdentifier should be ```"com.maslo.evolution"```
2. ios.config.googleSignIn.reservedClientId should be ```com.googleusercontent.apps.858064288439-02l37uab6frvq67228g5taua7c112pii```
3. android.package should be ```"com.maslo.evolution"```
4. android.config.googleSignIn.apiKey should be ```AIzaSyBbEpbXQY-xKsrMzrsdXNBuBdHzsTpPMBw```
5. android.config.googleSignIn.certificateHash should be ```858064288439-oq1lit38a9cc39sb6dhcrrjmmk8k8i6t.apps.googleusercontent.com```


## Mobile

### Run & build app

1. To run project locally via Expo run `yarn start` from the `mobile/` folder

### -This is where I'm getting an error-
2. For building an APK (app bundle) or IPA use commands
```
yarn build:(ios|android):(stage|prod)
```
and manage all keystores/credentials via Expo.
It's important to use that command because there's a wrapper that ensures correct environment is caught up.