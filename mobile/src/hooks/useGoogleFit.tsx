import {useState, useEffect} from 'react';
import GoogleFit, { Scopes } from 'react-native-google-fit';
import logger from 'common/logger';
import { Scope } from 'sentry-expo';

const useGoogleFit = () => {
  const [data, setData] = useState(false);
  const [res, setRes] = useState([]);

  const options = {
    scopes: [
      // Scopes.FITNESS_ACTIVITY_READ,
      // Scopes.FITNESS_ACTIVITY_WRITE,
      // Scopes.FITNESS_BODY_READ,
      //Scopes.FITNESS_BODY_WRITE,
      Scopes.FITNESS_AUTH,
    ]
  }

  // GoogleFit.disconnect();

  GoogleFit.checkIsAuthorized().then(() => {
    logger.log("GOOGLE_FIT_IS_AUTHORIZED",GoogleFit.isAuthorized) // Then you can simply refer to `GoogleFit.isAuthorized` boolean.
})
GoogleFit.isAvailable((res, err) => {
  logger.log("IS_AVAILABLE", res);
  logger.log("IS_AVAILABLE_ERR", err);
})


GoogleFit.authorize(options)
  .then(authResult => {
    if (authResult.success) {
      logger.log("AUTH_SUCCESS_IMPROVED", authResult);
      setData(true);
    } else {
      logger.log("AUTH_DENIED", authResult);
      setData(false);
    }
  })
  .catch((err) => {
    logger.log("AUTH_ERROR", err.message, err);
    setData(false);
  })

  useEffect (() => {
    if (data) {
      logger.log("in IF_STATEMENT", data);
    
      const opt = {
          startDate: "2017-01-01T00:00:17.971Z", // required ISO8601Timestamp
          endDate: new Date().toISOString(), // required ISO8601Timestamp
          // bucketUnit: "DAY", // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
          bucketInterval: 1, // optional - default 1. 
        };
         
        // GoogleFit.getDailyStepCountSamples(opt)
        //  .then((res) => {
        //      logger.log('Daily steps >>> ', res)
        //      setRes(res);
        //  })
        //  .catch((err) => {logger.warn(err)});


         const opt1 = {
          unit: "pound", // required; default 'kg'
          startDate: "2017-01-01T00:00:17.971Z", // required
          endDate: new Date().toISOString(), // required
          // bucketUnit: "DAY", // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
          bucketInterval: 1, // optional - default 1. 
          ascending: false // optional; default false
        };
         
        GoogleFit.getWeightSamples(opt1).then((res)=> {
          logger.log(res)
        });
    }

  }, [data])
    
return res;
};

export default useGoogleFit;