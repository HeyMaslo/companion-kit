import firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';
// import 'firebase/remote-config';
// import 'firebase/analytics';

export default firebase;

export type FirebaseApp = typeof firebase;

// firebase.firestore.setLogLevel('debug');
