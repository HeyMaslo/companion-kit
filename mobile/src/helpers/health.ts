import GoogleFit, { Scopes } from 'react-native-google-fit';
import AppleHealthKit from 'react-native-health';
import logger from 'common/logger';

// GOOGLE FIT:
const runOptions = {
  scopes: [
    Scopes.FITNESS_ACTIVITY_READ,
    Scopes.FITNESS_SLEEP_READ
  ],
};

//Google Fit Steps
let dailyStepCount;

var today = new Date();
var lastWeekDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - 8,
);
const opt = {
  startDate: lastWeekDate.toISOString(), // required ISO8601Timestamp
  endDate: today.toISOString(), // required ISO8601Timestamp
  bucketUnit: 'DAY', // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
  bucketInterval: 1, // optional - default 1.
};

const fetchStepsData = async opt => {
  const res = await GoogleFit.getDailyStepCountSamples(opt);
  if (res.length !== 0) {
    for (var i = 0; i < res.length; i++) {
      if (res[i].source === 'com.google.android.gms:estimated_steps') {
        let data = res[i].steps.reverse();
        dailyStepCount = res[i].steps;
        // setdailySteps(data[0].value);
        return dailyStepCount;
      }
    }
  } else {
    logger.log('Daily Steps Not Found');
  }
};

const fetchSleepData = async opt => {
  const midnight = "00:00"
  // var midnight = new Date();
  // midnight.setHours(0, 0, 0, 0);
  let sleepTotal = 0;
  const res = await GoogleFit.getSleepSamples(opt);

  for (var i = 0; i < res.length; i++) {
    if (Date.parse(res[i].endDate) > Date.parse(midnight)) {
      if (Date.parse(res[i].startDate) > Date.parse(midnight)) {
        sleepTotal +=
          Date.parse(res[i].endDate) - Date.parse(res[i].startDate);
      } else {
        sleepTotal += Date.parse(res[i].endDate) - Date.parse(midnight);
      }
      if (
        i + 1 < res.length &&
        Date.parse(res[i].startDate) < Date.parse(res[i + 1].endDate)
      ) {
        sleepTotal -=
          Date.parse(res[i + 1].endDate) - Date.parse(res[i].startDate);
      }
    }
  }
  return Math.round((sleepTotal / (1000 * 60 * 60)) * 100) / 100;
  // setSleep(Math.round((sleepTotal / (1000 * 60 * 60)) * 100) / 100);
};

const fetchAndroidHealthData = async () => {
      let sleepData;
      let stepsData;
      // call Google Fit API to get the steps data for the user
      // opts --> options object
      logger.log('GOOGLE_FIT: Fetching Step Data');
      stepsData = await fetchStepsData(opt);

      // call Google Fit API to get the sleep data for the user
      // opts --> options object
      logger.log('GOOGLE_FIT: Fetching Sleep Data');
      sleepData = await fetchSleepData(opt);

      logger.log('GOOGLE_FIT: Sleep Data: ', JSON.stringify(sleepData));
      logger.log('GOOGLE_FIT: Step Data: ', JSON.stringify(stepsData));
}

export const authAndroid = async () => {
  await GoogleFit.checkIsAuthorized();
  let isAuth = GoogleFit.isAuthorized;
  logger.log('GOOGLE_FIT_IS_AUTHORIZED?', isAuth)
  if (isAuth) {
    logger.log('GOOGLE_FIT_IS_AUTHORIZED');
    // Authentication already authorized for a particular device
    // fetch the android health data
    await fetchAndroidHealthData();
  } else {
    try {
      // Authentication if already not authorized for a particular device
      const authResult = await GoogleFit.authorize(runOptions);
      if (authResult.success) {
        console.log('AUTH_SUCCESS');
        isAuth = true
        // if successfully authorized, fetch data
        await fetchAndroidHealthData();
      } else {
        // Auth fails/denied
        console.log('AUTH_DENIED ' + authResult);
        isAuth = false;
      }
    } catch (error) {
        // catch errors if Auth fails
        console.log('AUTH_ERROR: ', error);
    };
  }
  return isAuth;
}

export const disconnectAndroid = () => { GoogleFit.disconnect() }


// APPLE HEALTH KIT:

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
    write: [],
  },
};
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

      console.log('Step Count results FROM HEALTHKIT', results.value);
      const res: boolean = results.value && results.value > 0;
      resolve(res);
      return;
    });
  })
}

// returns true if there is sleep data
export const checkForSleepData = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(null, (err, results) => {
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