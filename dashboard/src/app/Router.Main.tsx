import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import * as Routes from './constants/routes';
import Env from 'app/constants/env';

import Header from 'app/components/Header';
import Clients from './pages/Clients';

import SignUpComplete from 'app/pages/SignUpComplete';
import Profile from 'app/pages/Profile';
import ClientEditor from 'app/pages/ClientEditor';
import ClientView from 'app/pages/ClientView';
import AddNewClientSuccess from 'app/pages/AddNewClientSuccess';
import { ClientDetailsWithTabs } from 'app/pages/ClientDetails';
import JournalInner from 'app/pages/JournalInner';
import { DocsImagesInner } from 'app/pages/DocsImagesInner';
import Transcription from 'app/pages/Transcription';
import SessionInner from 'app/pages/SessionInner';
import AssessmentInner from 'app/pages/clientDetailsTabs/AssessmentInner';
import IntakeFormInner from 'app/pages/IntakeFormInner';
import Pricing from 'app/pages/Pricing';
import ToDesktop from 'app/pages/ToDesktop';
import { AdminPageLoader } from 'app/pages/admin/AdminPageLoader';
import AppController from 'app/controllers';
import CheckYourEmail from 'app/pages/CheckYourEmail';
import Prompts from 'app/pages/Prompts';
import Interventions from 'app/pages/Interventions';

import * as Features from 'common/constants/features';

export function MobileRouter() {
    return (
        <>
            <Switch>
                <Route exact path={Routes.ToDesktop} component={ToDesktop} />
                <Redirect to={Routes.ToDesktop} />
            </Switch>
        </>
    );
}

export function ForcePricingRouter() {
    return (
        <>
            <Header hasNav={true} profileOnly />
            <Switch>
                <Route path={Routes.Profile} component={Profile} />
                <Route exact path={Routes.CheckYourEmailBase} component={CheckYourEmail} />
                <Route exact path={Routes.Pricing} component={Pricing} />
                <Redirect to={Routes.Pricing} />
            </Switch>
        </>
    );
}

export function NewUserRouter() {
    return (
        <>
            <Header hasNav={false} />
            <Switch>
                <Route exact path={Routes.SignUpComplete} component={SignUpComplete} />
                <Redirect to={Routes.SignUpComplete} />
            </Switch>
        </>
    );
}

export default function MainRouter() {
    const user = AppController.Instance.User;

    const canAddClients = Features.Dashboard.CoachVerificationRequired
        ? !!user.freeAccess
        : !user.clientsLimitReached;

    const adminEnabled = user.user.isAdmin;

    return (
        <>
            <Header hasNav={true}  />
            <Switch>
                {canAddClients && <Route exact path={Routes.AddNewClient} component={ClientEditor} />}
                {canAddClients && <Route exact path={Routes.AddNewClientSuccess} component={AddNewClientSuccess} />}

                <Route exact path={Routes.Clients} component={Clients} />

                <Route path={Routes.Profile} component={Profile} />

                <Route exact path={Routes.ClientDetails.Edit} component={ClientEditor} />

                <Route exact path={Routes.ClientDetails.View} component={ClientView} />

                {/* Must be before ClientDetals to override it */}
                <Route exact path={Routes.ClientDetails.Prompts} component={Prompts} />

                <Route exact path={Routes.ClientDetails.Interventions} component={Interventions} />

                <Route exact path={Routes.ClientDetails.GeneralTab} component={ClientDetailsWithTabs} />

                <Route exact path={Routes.ClientDetails.JournalInner.Template} component={JournalInner} />
                {process.appFeatures.SESSIONS_DISABLED ? null : <Route exact path={Routes.ClientDetails.SessionInner.Template} component={SessionInner} />}

                <Route exact path={Routes.ClientDetails.JournalTranscription.Template} component={Transcription} />
                {process.appFeatures.SESSIONS_DISABLED ? null : <Route exact path={Routes.ClientDetails.SessionTranscription.Template} component={Transcription} />}

                {!process.appFeatures.BILLING_DISABLED ? <Route exact path={Routes.Pricing} component={Pricing} /> : null}
                {adminEnabled && <Route exact path={Routes.Admin} component={AdminPageLoader} />}

                {process.appFeatures.ASSESSMENTS_ENABLED && <Route exact path={Routes.ClientDetails.AssessmentInner.Template} component={AssessmentInner} /> }
                {process.appFeatures.ASSESSMENTS_ENABLED && <Route exact path={Routes.ClientDetails.IntakeFormInner.Template} component={IntakeFormInner} />}

                {process.appFeatures.PICTURE_CHECKINS_ENABLED && <Route exact path={Routes.ClientDetails.DocsImagesInner.Template} component={DocsImagesInner} />}

                <Route exact path={Routes.CheckYourEmailBase} component={CheckYourEmail} />

                <Redirect to={Routes.Clients} />
            </Switch>
        </>
    );
}
