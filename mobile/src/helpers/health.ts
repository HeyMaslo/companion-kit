import GoogleFit, { Scopes } from 'react-native-google-fit';
import AppleHealthKit from 'react-native-health';
import logger from 'common/logger';

const runOptions = {
  scopes: [
    Scopes.FITNESS_ACTIVITY_READ,
    Scopes.FITNESS_ACTIVITY_WRITE,
    Scopes.FITNESS_BODY_READ,
  ]
};

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
    write: [],
  },
};

export const auth = async () => {
  var isAuth;

  return await GoogleFit.checkIsAuthorized().then(() => {
    isAuth = GoogleFit.isAuthorized;
    logger.log('GOOGLE_FIT_IS_AUTHORIZED?', isAuth)
    isAuth = GoogleFit.authorize(runOptions)
      .then(authResult => {
        if (authResult.success) {
          logger.log('GOOGLE_FIT_IS_AUTHORIZED', authResult.success);
          return true;

        } else {
          logger.log('GOOGLEFIT_AUTH_DENIED' + authResult);
          return false;
        }
      })
      .catch(() => {
        return false;
      })
    return isAuth;
  })
}

export const disconnectAndroid = () => { GoogleFit.disconnect() }

export const initHealthKit = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(permissions, (err, results) => {
      if (err) {
        console.log('error initializing Healthkit:', err);
        resolve(false);
      }
      console.log('RESULTS FROM INIT HEALTHKIT', results);
      resolve(true);
    });
  })
}

// returns true if there is step count data that is greater than 0
export const checkForStepsData = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getStepCount(null, (err, results) => {
      if (err) {
        console.log('appleHealthKit.getStepCount error:', err);
        resolve(false);
        return;
      }

      console.log('Step Count results FROM HEALTHKIT, if this is ZERO we assume perms were not granted', results.value);
      const res: boolean = results.value && results.value > 0;
      resolve(res);
      return;
    });
  })
}

// returns true if there is sleep data
export const checkForSleepData = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let options = {
      startDate: (new Date(2016, 10, 1)).toISOString(), // using this date because thats what the example used and `startDate` is required
    }
    AppleHealthKit.getSleepSamples(options, (err, results) => {
      if (err) {
        console.log('appleHealthKit.getSleepSamples error:', err);
        resolve(false);
        return;
      }

      console.log('SleepData results FROM HEALTHKIT', results);
      const res: boolean = results && results.length > 0;
      resolve(res);
      return;
    });
  })
}

export const getDOB = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDateOfBirth(null, (err, results) => {
      if (err) {
        resolve(false);
        return;
      }

      console.log('getDateOfBirth FROM HEALTHKIT', results.value);
      resolve(!!results.value);
      return
    });
  })
}

export const getAuthStatus = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getAuthStatus(permissions, (err, results) => {
      if (err) {
        if (err == 'No data available for the targeted permissions.') {
          resolve(true);
        } else {
          resolve(false);
        }
        return;
      }
      console.log('RESULTS FROM HEALTHKIT', results);
      if (!results.permissions || results.permissions.read.includes(1)) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  })
}