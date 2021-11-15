import GoogleFit, { Scopes } from 'react-native-google-fit';
import AppleHealthKit from 'react-native-health';
import logger from 'common/logger';

// GOOGLE FIT:
const runOptions = {
  scopes: [
    Scopes.FITNESS_ACTIVITY_READ,
    Scopes.FITNESS_ACTIVITY_WRITE,
    Scopes.FITNESS_BODY_READ,
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
      }
    }
  } else {
    console.log('Daily Steps Not Found');
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
  // return Math.round((sleepTotal / (1000 * 60 * 60)) * 100) / 100;
  // setSleep(Math.round((sleepTotal / (1000 * 60 * 60)) * 100) / 100);
};

export const authAndroid = () => {
  const authValue = GoogleFit.checkIsAuthorized().then(() => {
    var isAuth = GoogleFit.isAuthorized;
    logger.log('GOOGLE_FIT_IS_AUTHORIZED?', isAuth)
    if (isAuth) {
      // Authentication already authorized for a particular device
      logger.log('GOOGLE_FIT_IS_AUTHORIZED');
      logger.log('GOOGLE_FIT: Fetching Step Data');
      fetchStepsData;
      logger.log('GOOGLE_FIT: Fetching Sleep Data');
      fetchSleepData;
    } else {
      // Authentication if already not authorized for a particular device
      GoogleFit.authorize(runOptions)
        .then(authResult => {
          if (authResult.success) {
            console.log('AUTH_SUCCESS');
            isAuth = true
            // if successfully authorized, fetch data
            logger.log('GOOGLE_FIT: Fetching Step Data');
          fetchStepsData;
          logger.log('GOOGLE_FIT: Fetching Sleep Data');
          fetchSleepData;
          } else {
            console.log('AUTH_DENIED ' + authResult);
            isAuth = false;
          }
        })
        .catch(() => {
          console.log('AUTH_ERROR');
        });
    }
    return isAuth;
  })
  return authValue;
}

export const disconnectAndroid = () => { GoogleFit.disconnect() }


// APPLE HEALTH KIT:

const permissions = {
  permissions: {
    read: [
      // Activity
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.AppleStandTime,
      AppleHealthKit.Constants.Permissions.Workout,
      // Mindfulness
      AppleHealthKit.Constants.Permissions.MindfulSession,
      // Nutrition
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      AppleHealthKit.Constants.Permissions.Sugar,
      AppleHealthKit.Constants.Permissions.Thiamin,
      AppleHealthKit.Constants.Permissions.Biotin,
      AppleHealthKit.Constants.Permissions.Caffeine,
      AppleHealthKit.Constants.Permissions.Calcium,
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      AppleHealthKit.Constants.Permissions.Chloride,
      AppleHealthKit.Constants.Permissions.Copper,
      AppleHealthKit.Constants.Permissions.EnergyConsumed,
      AppleHealthKit.Constants.Permissions.Fiber,
      AppleHealthKit.Constants.Permissions.Folate,
      AppleHealthKit.Constants.Permissions.Iodine,
      AppleHealthKit.Constants.Permissions.Iron,
      AppleHealthKit.Constants.Permissions.Magnesium,
      AppleHealthKit.Constants.Permissions.Manganese,
      AppleHealthKit.Constants.Permissions.Molybdenum,
      AppleHealthKit.Constants.Permissions.FatMonounsaturated,
      AppleHealthKit.Constants.Permissions.Niacin,
      AppleHealthKit.Constants.Permissions.PantothenicAcid,
      AppleHealthKit.Constants.Permissions.Phosphorus,
      AppleHealthKit.Constants.Permissions.FatPolyunsaturated,
      AppleHealthKit.Constants.Permissions.Potassium,
      AppleHealthKit.Constants.Permissions.Protein,
      AppleHealthKit.Constants.Permissions.Riboflavin,
      AppleHealthKit.Constants.Permissions.FatSaturated,
      AppleHealthKit.Constants.Permissions.Selenium,
      AppleHealthKit.Constants.Permissions.Sodium,
      AppleHealthKit.Constants.Permissions.Thiamin,
      AppleHealthKit.Constants.Permissions.FatTotal,
      AppleHealthKit.Constants.Permissions.VitaminA,
      AppleHealthKit.Constants.Permissions.VitaminB6,
      AppleHealthKit.Constants.Permissions.VitaminB12,
      AppleHealthKit.Constants.Permissions.VitaminC,
      AppleHealthKit.Constants.Permissions.VitaminD,
      AppleHealthKit.Constants.Permissions.VitaminE,
      AppleHealthKit.Constants.Permissions.VitaminK,
      AppleHealthKit.Constants.Permissions.Water,
      AppleHealthKit.Constants.Permissions.Zinc,
      // Respiractory
      AppleHealthKit.Constants.Permissions.OxygenSaturation,
      AppleHealthKit.Constants.Permissions.RespiratoryRate,
      // Sleep
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