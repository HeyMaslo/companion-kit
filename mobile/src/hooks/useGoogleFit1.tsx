import {useState, useEffect} from 'react';
import { Alert } from 'react-native';
import GoogleFit, { Scopes } from 'react-native-google-fit';
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
          logger.log("AUTH_DENIED" + authResult.message);
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

export const startRecording = async() => {
  const isAuth = await auth();
  if(isAuth) {
    GoogleFit.startRecording( callback => {
      const data = loadDaily();
      logger.log(data);
       // Process data from Google Fit Recording API (no google fit app needed)
     }, ['step']);
  }
}

export const loadDaily = () => {
  logger.log("IN LOAD_DAILY")
  return async () => {
    logger.log("IN LOAD_DAILY1")
    const isAuth = await auth();
    

    if(isAuth){
      const opt = {
        startDate: "2017-01-01T00:00:17.971Z", // required ISO8601Timestamp
        endDate: new Date().toISOString(), // required ISO8601Timestamp
        // bucketUnit: "DAY", // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
        bucketInterval: 1, // optional - default 1. 
      };
       
      GoogleFit.getDailyStepCountSamples(opt)
       .then((res) => {
           logger.log('Daily steps >>> ', res)
       })
       .catch((err) => {logger.warn(err)});
      // logger.log("IN LOAD_DAILY")
      // const today = moment()
      // const opt = {
      //   startDate: moment(today).startOf('day').toISOString(), // required ISO8601Timestamp
      //   endDate: moment(today).endOf('day').toISOString(), // required ISO8601Timestamp
      //   // bucketUnit: "DAY", // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
      //   bucketInterval: 1, // optional - default 1. 
      // };

      // GoogleFit.getDailyStepCountSamples(opt)
      // .then((res) => {
      //     logger.log('Daily steps >>> ', res)
      // })
      // .catch((err) => {logger.warn(err)});
    }
  }
}
