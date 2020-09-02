import React from 'react';
import Preloader from './common/components/Preloader';
import { createLoader } from 'app/utils/ReactLoadable';
import Env from 'app/constants/env';
import type { } from 'common/declarations/process';

import './styles/projects/app/index.sass';

import { initializeAsync as initializeFirebaseAsync } from 'common/services/firebase';

export const App = createLoader({
    moduleLoader: () => import(/* webpackChunkName: "theapp" */'./Router'),
    loading: Preloader,
    libraries: {
        firebase: () => initializeFirebaseAsync({
            functionsEmulatorUrl: Env.Firebase.FunctionsEmulator,
            firestoreEmulatorUrl: Env.Firebase.FirestoreEmulator,
            config: Env.Firebase.Configuration,
        }),
    },
});
