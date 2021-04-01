import {useState, useEffect} from 'react';
import { Alert } from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import AppleHealthKit from 'rn-apple-healthkit';
import logger from 'common/logger';
import moment from 'moment'
import { Scope } from 'sentry-expo';
import Env from 'src/constants/env';
import getHealth from 'src/hooks/getHealthKitData'

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

const options = {
  permissions: {
    read: ["StepCount"],
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
        // Alert.alert(
        //   "AUTH_ERROR",
        //   "Click Reload button to re-authorize.",
        //   [
        //     {
        //       text: "Cancel",
        //       onPress: () => {},
        //       style: "cancel"
        //     },
        //     { text: "OK", onPress: () => auth() }
        //   ],
        //   { cancelable: false }
        // );
        return false;
      })
    }

    return isAuth;
  })

  // return isAuth;
}

export const disconnectAndroid = () => { GoogleFit.disconnect()}

export const init = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(options, (err, results) => {
      if (err) {
          console.log("error initializing Healthkit:", err);
          resolve(false);
      }
      console.log("RESULTS FROM INIT HEALTHKIT", results);
      resolve(true);
    });
  })
}


export const isAvailable = async (): Promise<boolean>  => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.isAvailable((err, results) => {
      if (err) {
          console.log("error initializing ISAVAIL----:", err.hasOwnProperty("message"));
          resolve(false);
          return;
      }
      console.log("RESULTS FROM IS_AVAIL HEALTHKIT", results);
      resolve(true);
    });
  })
}

export const stepCount = async (): Promise<boolean>  => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getStepCount(null,(err, results) => {
      if (err) {
          console.log("error initializing StepCount:", err);
          resolve(false);
          return;
      }
      console.log("RESULTS FROM Steps HEALTHKIT");
      resolve(true);
    });
  })
}

export const getHeight = async () => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getLatestHeight(null,(err, results) => {
      if (err) {
          console.log("error initializing height:", err);
          resolve(false);
          return;
      }
      console.log("RESULTS FROM Height HEALTHKIT");
      resolve(true);
    });
  })
}