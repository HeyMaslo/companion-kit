import {useState, useEffect} from 'react';
import GoogleFit, { Scopes } from 'react-native-google-fit'
import logger from 'common/logger';

const getGooglefitData = () => {
  const [data, setData] = useState({
    auth: null
  });

  const updateData = (field,value) => {
      setData({
        ...data,
        [field]: value
      });
  };

  useEffect(() => {
  //   GoogleFit.checkIsAuthorized().then(() => {
  //     logger.log("Authorizzed?", GoogleFit.isAuthorized) // Then you can simply refer to `GoogleFit.isAuthorized` boolean.
  // })  
    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_ACTIVITY_WRITE,
        Scopes.FITNESS_BODY_READ,
        Scopes.FITNESS_BODY_WRITE,
      ]
    }
  
  GoogleFit.authorize(options)
    .then(authResult => {
      if (authResult.success) {
        logger.log("AUTH_SUCCESS");
        updateData("auth", "Success");
      } else {
        logger.log("AUTH_DENIED", authResult);
        updateData("auth", "fail");
      }
    })
    .catch((err) => {
      logger.log("AUTH_ERROR", err.message, err);
    })
    
  },[]);
  
  logger.log("IN GOOGLE FIT");
  // const opt = {
  //   startDate: "2017-01-01T00:00:17.971Z", // required ISO8601Timestamp
  //   endDate: new Date().toISOString(), // required ISO8601Timestamp
  //   // bucketUnit: "DAY", // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
  //   bucketInterval: 1, // optional - default 1. 
  // };
   
  // GoogleFit.getDailyStepCountSamples(opt)
  //  .then((res) => {
  //      console.log('Daily steps >>> ', res)
  //  })
  //  .catch((err) => {console.warn(err)});

  // GoogleFit.checkIsAuthorized().then(() => {
  //   updateData("auth", GoogleFit.isAuthorized)
  //   logger.log(GoogleFit.isAuthorized) // Then you can simply refer to `GoogleFit.isAuthorized` boolean.
// })

return data;
};

export default getGooglefitData;