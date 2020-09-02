import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Button, Page, Image } from 'app/common/components';
import Select from 'app/common/components/Select';
import { InputObservable } from 'app/common/components/Input';
import Env from 'app/constants/env';
import SignInViewModel, { SignInStates, TextLabelProps } from 'app/viewModels/SignInViewModel';
import Localization from 'app/services/localization';
import logger from 'common/logger';
import { Dashboard as DashboardFeatures } from 'common/constants/features';
import ProjectImages from 'app/helpers/images';
import googleLogo from 'assets/img/google.svg';

const DEV_LOGIN = Env.AllowDevLogin;

@observer
export default class SignIn extends React.Component {

    private readonly model = new SignInViewModel();

    componentWillUnmount() {
        this.model.dispose();
    }

    onEnterPress = async (e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent) => {
        if (DEV_LOGIN && e?.shiftKey && this.model.currentState === SignInStates.Email) {
            this.model.devLogin();
            return;
        }

        this.model.submit();
    }

    googleSignIn = () => {
        this.model.googleSignIn();
    }

    renderLeftBlock(): JSX.Element {
        const state = this.model.currentState;
        const featureItems = Localization.Current.DashboardProject.signUp.leftBlock.listFeatures;
        const helpLink = Localization.Current.DashboardProject.helpLink;

        if (state === SignInStates.SignUp) {
            return (
                <View className="text-block signup">
                    { DashboardFeatures.UseSignUpFeaturesList ? (
                        <>
                            <Text className="title-h2 type1 title">{Localization.Current.DashboardProject.signUp.leftBlock.title}</Text>
                            <Text className="desc-6 desc">{Localization.Current.DashboardProject.signUp.leftBlock.subtitle}</Text>
                            <ul className="features-list">
                                {featureItems.map((item, i) => (
                                    <li key={i} className="feature-item">
                                        <Image className="feature-icon" src={ProjectImages.checkedIcon} />
                                        <Text className="desc-6 type2">{item}</Text>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <>
                            <Text className="title-h2 type1 title">{Localization.Current.DashboardProject.signIn.leftBlock.title}</Text>
                            <Image className="sign-in-visual" src={ProjectImages.signInVisual} />
                        </>
                    )}
                    {
                        (!!helpLink && helpLink.length !== 0) &&

                        <View className="desc-6 type1 sign-up-help">
                            {Localization.Current.DashboardProject.signUp.leftBlock.footer.questionText}&nbsp;
                            <a href={helpLink} target="_blank" className="desc-6 type3">{Localization.Current.DashboardProject.signUp.leftBlock.footer.butttonText}</a>
                        </View>
                    }
                </View>
            );
        }

        return (
            <>
                <View className="text-block signin">
                    <Text className="title-h2 type1 title">{Localization.Current.DashboardProject.signIn.leftBlock.title}</Text>
                </View>
                <Image className="sign-in-visual" src={ProjectImages.signInVisual} />
            </>
        );
    }

    private renderTextLabel(label: TextLabelProps | TextLabelProps[]): JSX.Element {
        if (!label) {
            return null;
        }

        if (Array.isArray(label)) {
            return (
                <>
                    {label.map(l => this.renderTextLabel(l))}
                </>
            );
        }

        if (typeof label === 'string') {
            return (
                <Text key={label} className="title-h2 type2">
                    {label}&nbsp;
                </Text>
            );
        }

        if (!label.submit) {
            return this.renderTextLabel(label.text);
        }

        return (
            <Text key={label.text} className="btn title-h2 text-type1" onClick={label.submit}>
                {label.text}&nbsp;
            </Text>
        );
    }

    renderTextBlock(): JSX.Element {
        const props = this.model.textBlockContent;
        if (!props) {
            return null;
        }
        const { title, label } = props.text;

        return (
            <>
                <Text className="title-h1 type2 title">{title}</Text>
                <View className="desc">
                    {this.renderTextLabel(label)}
                </View>
            </>
        );
    }

    renderInputs() {
        switch (this.model.currentState) {

            case SignInStates.Password: {
                return (
                    <InputObservable
                        model={this.model.password}
                        type="password"
                        label="password"
                        placeholder="Your password"
                        autocomplete="password"
                    />
                );
            }

            case SignInStates.SignUp: {
                return (
                    <>
                        <InputObservable
                            model={this.model.email}
                            type="email"
                            label={DashboardFeatures.UseWorkEmail ? 'Work email' : 'Email'}
                            placeholder="example@mail.com"
                            disabled={this.model.forceSignup}
                            autocomplete="username email"
                            infoMessage={DashboardFeatures.UseWorkEmail ? 'Please Use Your Work email' : null}
                        />
                        <InputObservable
                            model={this.model.fullName}
                            label="full name"
                            maxLength={35}
                            placeholder="Your full name"
                            autocomplete="name"
                        />
                        <InputObservable
                            model={this.model.password}
                            className="input-wrap-password"
                            type="password"
                            label="password"
                            autocomplete="new-password"
                            placeholder="Your password"
                        />
                        { DashboardFeatures.RequireOrganizationOnSignUp && (
                            <Select
                                model={this.model.organizationSelect}
                                required={true}
                                className="select-type2 select-organization"
                                buttonClassname="label-dropdown2"
                                label="Organization"
                                placeholder="Select Organization"
                            />
                        )}
                        { DashboardFeatures.UseMobileNumber && (
                            <InputObservable
                                type="tel"
                                model={this.model.mobilePhone}
                                label="mobile number"
                                placeholder="Mobile Phone Number"
                                required={true}
                                infoMessage="For important alerts about your clients"
                            />
                        )}
                    </>
                );
            }

            case SignInStates.ResetPassword:
            case SignInStates.CreatePassword: {
                return (
                    <InputObservable
                        model={this.model.password}
                        type="password"
                        label="password"
                        autocomplete="new-password"
                        placeholder="Your new password"
                    />
                );
            }

            case SignInStates.Email:
            default: {
                return (
                    <InputObservable
                        model={this.model.email}
                        type="email"
                        label={ DashboardFeatures.UseWorkEmail ? 'Work email' : 'Email' }
                        placeholder="Your email"
                        autocomplete="username email"
                    />
                );
            }
        }

    }

    renderButtons() {
        let useGoogle = false;
        let submitText = 'Create';

        switch (this.model.currentState) {
            case SignInStates.Email: {
                useGoogle = true;
                submitText = 'next';
                break;
            }

            case SignInStates.CreatePassword: {
                submitText = 'save';
                break;
            }

            case SignInStates.Password: {
                submitText = 'take me in';
                break;
            }

            default: {
                break;
            }
        }

        return (
            <>
                <Button
                    disabled={this.model.inProgress}
                    className="green-bg"
                    title={submitText}
                    titleClassName="label-btn4 type1"
                    onClick={this.model.submit}
                />
                {this.model.error &&
                    <View className="error-block">
                        <Text className="up-text input-error-message">{this.model.error}</Text>
                    </View>
                }
                { useGoogle && (
                    <>
                        <View className="divider">
                            <Text className="label-btn4 type4">or</Text>
                        </View>
                        <Button
                            disabled={this.model.inProgress}
                            className="google-btn"
                            title="sign in with Google"
                            titleClassName="label-btn4 type8"
                            icon={googleLogo}
                            iconAlt="logo google"
                            iconBefore
                            onClick={this.googleSignIn}
                        />
                    </>
                )}
            </>
        );
    }

    renderFooter() {
        const props = this.model.textBlockContent;
        if (!props?.footer) {
            return null;
        }

        return (
            <View className="footer-text">
                {this.renderTextLabel(props.footer)}
            </View>
        );
    }

    render() {
        const { inProgress, currentState } = this.model;

        logger.log('[SignIn] rendering with currentState =', SignInStates[currentState]);

        return (
            <Page inProgress={inProgress} className="auth-page">
                <View className="left-block">
                   {this.renderLeftBlock()}
                </View>
                <View className={`right-block ${this.model.currentState === SignInStates.SignUp ? 'signup' : 'signin'}`} onEnterPress={this.onEnterPress}>
                    <View className="text-block">
                        {this.renderTextBlock()}
                    </View>
                    <View className="inputs-block">
                        {this.renderInputs()}
                    </View>
                    <View className="btn-wrap">
                        {this.renderButtons()}
                    </View>
                    {this.renderFooter()}
                </View>
            </Page>
        );
    }
}
