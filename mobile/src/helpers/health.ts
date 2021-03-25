import {useState, useEffect} from 'react';
import { Alert } from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import AppleHealthKit from 'rn-apple-healthkit';
import logger from 'common/logger';
import moment from 'moment'
import { Scope } from 'sentry-expo';
import Env from 'src/constants/env';

const runOptions = {
  scopes: [
    Scopes.FITNESS_ACTIVITY_READ,
    Scopes.FITNESS_ACTIVITY_WRITE,
    Scopes.FITNESS_BODY_READ,
    // Scopes.FITNESS_BODY_READ,
    Scopes.FITNESS_BODY_WRITE,
    // Scopes.FITNESS_LOCATION_READ,
    // Scopes.FITNESS_LOCATION_READ,
    // Scopes.FITNESS_AUTH,
  ]
};
const PERMS = AppleHealthKit.Constants.Permissions;

const options = {
  permissions: {
    read: [PERMS.BiologicalSex],
    write: [],
  },
};


// GoogleFit.checkIsAuthorized().then(() => {
//   logger.log("IS_AUTHORIZED_GGFIT", GoogleFit.isAuthorized)
// })

export const auth = async() => {
  // var isAuth = GoogleFit.isAuthorized;
  var isAuth;

  return await GoogleFit.checkIsAuthorized().then (() => {
    isAuth = GoogleFit.isAuthorized;
    logger.log("GOOGLE_FIT_IS_AUTHORIZED", isAuth)

  // toggle authentication
    if (!isAuth) {
      isAuth = GoogleFit.authorize(runOptions)
      .then(authResult => {
        if(authResult.success) {
          logger.log("GOOGLEFIT.isAuthorized: " + authResult.success);

        }else{
          logger.log("AUTH_DENIED" + authResult);
        }
        return authResult.success === true;
      })
      .catch(() => {
        Alert.alert(
          "AUTH_ERROR",
          "Click Reload button to re-authorize.",
          [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel"
            },
            { text: "OK", onPress: () => auth() }
          ],
          { cancelable: false }
        );
        return false;
      })
    }

    return isAuth;
  })

  // return isAuth;
}

export const init = async () => {
  // var isAuth;
  AppleHealthKit.initHealthKit(options, (err, results) => {
    if (err) {
        console.log("error initializing Healthkit: ", err);
        return false;
    }
    console.log("RESULTS FROM INIT HEALTHKIT", results == 1);
    return results;
});
}