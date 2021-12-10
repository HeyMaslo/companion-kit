import {useState} from 'react';
import AppleHealthKit from 'react-native-health';

const PERMS = AppleHealthKit.Constants.Permissions;

const getHealthKitData = () => {
  const [data, setData] = useState({
    gender: null
  });

  const updateData = (field,value) => {
      setData({
        ...data,
        [field]: value
      });
  };

  const options = {
    permissions: {
      read: [PERMS.BiologicalSex],
      write: null,
    },
  };

  AppleHealthKit.initHealthKit(options, (err, results) => {
    if (err) {
        console.log("error initializing Healthkit: ", err);
        return;
    }
});

  AppleHealthKit.getBiologicalSex(null, (err, results) => {
    if (err) {
      console.log(`Error returning sex`, err);
    } 
    updateData("gender",results);
});

  return data;
};

export default getHealthKitData;
