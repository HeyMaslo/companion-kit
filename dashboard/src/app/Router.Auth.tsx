import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import * as Routes from 'app/constants/routes';

import Header from 'app/components/Header';

// import SignUp from 'app/pages/SignUp';
import SignIn from 'app/pages/SignIn';
import CheckYourEmail from 'app/pages/CheckYourEmail';

export default function AnonRouter() {
    return (
        <>
            <Header hasNav={false} />
            <Switch>
                {/* <Route exact path={Routes.SignUp} component={SignUp} /> */}
                <Route exact path={Routes.SignIn} component={SignIn} />
                <Route exact path={Routes.CheckYourEmailBase} component={CheckYourEmail} />

                <Redirect to={Routes.SignIn}  />
            </Switch>
        </>
    );
}