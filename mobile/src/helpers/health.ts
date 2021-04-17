import GoogleFit, { Scopes } from 'react-native-google-fit';
import AppleHealthKit from 'rn-apple-healthkit';
import logger from 'common/logger';

const runOptions = {
  scopes: [
    Scopes.FITNESS_ACTIVITY_READ,
    Scopes.FITNESS_ACTIVITY_WRITE,
    Scopes.FITNESS_BODY_READ,
    Scopes.FITNESS_BODY_WRITE,
  ]
};

const options = {
  permissions: {
    read: ["StepCount", "BiologicalSex", "DateOfBirth"],
    write: [],
  },
};

export const auth = async() => {
  var isAuth;

  return await GoogleFit.checkIsAuthorized().then (() => {
    isAuth = GoogleFit.isAuthorized;
    logger.log("GOOGLE_FIT_IS_AUTHORIZED", isAuth)
    if (!isAuth) {
      isAuth = GoogleFit.authorize(runOptions)
      .then(authResult => {
        if(authResult.success) {
        }else{
          logger.log("GOOGLEFIT_AUTH_DENIED" + authResult);
        }
        return authResult.success === true;
      })
      .catch(() => {
        return false;
      })
    }
    return isAuth;
  })
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

export const getDOB = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDateOfBirth(null,(err, results) => {
      if (err) {
          console.log("error initializing height:", err);

          if (err.message == "No data available for the specified predicate.") {
            resolve (true);
          } else {
            resolve(false);
          }
          return;
      }

      if (!results.value){
        console.log("RESULTS FROM Height HEALTHKIT11", results.value);
        console.log("RESULTS FROM Height HEALTHKIT11", results.age);
        resolve(false);
        return;
      }
      console.log("RESULTS FROM Height HEALTHKIT", results.value);
      resolve(true);
    });
  })
}