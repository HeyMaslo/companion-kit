import React from 'react';
import { Router, Switch, Route } from 'react-router';
import 'mobx-react/batchingForReactDom';
import { observer } from 'mobx-react';
import history from 'app/services/history';
import * as Routes from './constants/routes';

import Preloader from './common/components/Preloader';
import AppController from './controllers';
import PromptModal from './components/PromptModal';

import AnonRouter from './Router.Auth';
import MainRouter, { MobileRouter, ForcePricingRouter, NewUserRouter } from './Router.Main';
import { createLogger } from 'common/logger';

import { AppActivityContext } from './common/AppActivityComponent';
import { ClientTrackerComponent } from 'common/components/ClientTrackerComponent';
import WebClientTrackerFactory from './services/webTracker';
import Toaster from './components/Toaster';
import { ModalRenderer } from './components/Modal';

import Privacy from 'app/pages/Privacy';
import Terms from 'app/pages/Terms';

const logger = createLogger('[Router]');

function getRouter(this: void, isMobile: boolean) {
    const { initializing: authInitializing, setPasswordMode } = AppController.Instance.Auth;
    const { initializing, accountMissing, roleMismatch, user, paymentRequired } = AppController.Instance.User;
    const onboarded = user && user.coach && user.coach.onboarded;
    const forcePricing = paymentRequired;
    const loggedIn = !!user && !roleMismatch && !setPasswordMode;

    if (initializing || authInitializing) {
        return <Preloader isSingle={true} />;
    }

    let router: React.ReactNode;
    if (!loggedIn) {
        const forceSignUp = accountMissing || roleMismatch;
        logger.log('Rendering anon, force =', forceSignUp);
        router = <AnonRouter />;
    } else {
        logger.log('Rendering main, onboarded =', onboarded);
        if (isMobile) {
            router = <MobileRouter />;
        } else if (forcePricing && !process.appFeatures.BILLING_DISABLED) {
            router = <ForcePricingRouter />;
        } else if (!onboarded) {
            router = <NewUserRouter />;
        } else {
            router = <MainRouter />;
        }
    }

    return router;
}

const AppRouter = observer(function(this: never) {

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const onQueryMatch = ({ matches }: any) => setIsMobile(matches);

        const query = '(max-width: 640px)';
        const mQuery = window.matchMedia(query);

        mQuery.addListener(onQueryMatch);

        onQueryMatch(mQuery);

        return () => {
            mQuery.removeListener(onQueryMatch);
        };
    }, []);

    const userId = AppController.Instance.User?.user?.id;

    return (
        <>
            <Router history={history}>
                <Switch>
                    <Route exact path={Routes.Terms} component={Terms} />
                    <Route exact path={Routes.Privacy} component={Privacy} />
                    { getRouter(isMobile) }
                </Switch>
            </Router>
            <Toaster />
            <ModalRenderer />
            <PromptModal
                model={AppController.Instance.PromptModal}
            />
            <AppActivityContext>
                <AppActivityContext.Consumer>
                    {value => (<ClientTrackerComponent tracker={WebClientTrackerFactory} isActive={value.isActive} userId={userId} />)}
                </AppActivityContext.Consumer>
            </AppActivityContext>
        </>
    );
});

export default AppRouter;
