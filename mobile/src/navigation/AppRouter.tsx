import React from 'react';
import { observer } from 'mobx-react';

import AppController from 'src/controllers';

import { StateMachine } from 'src/stateMachine/machine';

const AppRouter = observer(() => {
    const isActive = AppController.Instance.isAppActive;

    return (
        <>
            <StateMachine paused={!isActive} />
        </>
    );
});

export default AppRouter;
