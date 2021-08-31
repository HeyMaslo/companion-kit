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
      // Activity
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      AppleHealthKit.Constants.Permissions.AppleStandTime,
      AppleHealthKit.Constants.Permissions.Workout,
      // Mindfulness
      AppleHealthKit.Constants.Permissions.MindfulSession,
      // Mobility
      AppleHealthKit.Constants.Permissions.Carbohydrates,
      // Nutrition
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

// returns true if there is walking/running distance data that is greater than 0
export const checkForStepsData = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDistanceWalkingRunning(null, (err, results) => {
      if (err) {
        console.log('appleHealthKit.getDistanceWalkingRunning error:', err);
        resolve(false);
        return;
      }

      console.log('Walking results FROM HEALTHKIT', results.value);
      const res = results.value && results.value > 0;
      resolve(res);
      return;
    });
  })
}

export const getDOB = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDateOfBirth(null, (err, results) => {
      if (err) {
        console.log('appleHealthKit.getDateOfBirth error:', err);

        if (err == 'No data available for the specified predicate.') {
          resolve(true);
        } else {
          resolve(false);
        }
        return;
      }

      if (!results.value) {
        console.log('RESULTS FROM HEALTHKIT11: value', results.value);
        console.log('RESULTS FROM Height HEALTHKIT11: age', results.age);
        resolve(false);
        return;
      }
      console.log('RESULTS FROM Height HEALTHKIT', results.value);
      resolve(true);
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