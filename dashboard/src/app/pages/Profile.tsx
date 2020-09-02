import React from 'react';
import { observer } from 'mobx-react';
import { TextAreaObservable } from 'app/common/components/TextArea';
import { InputObservable } from 'app/common/components/Input';
import ProfileViewModel from 'app/viewModels/ProfileViewModel';
import MarkdownView from 'app/components/MarkdownView';
import { Button, Container, View, Text, Page, UploadAvatar, Input } from 'app/common/components';
import { Link } from 'react-router-dom';
import { getUserAvatarUrl } from 'app/components/UserAvatarImage';
import SubscriptionCard from 'app/components/SubscriptionCard';
import * as Routes from 'app/constants/routes';
import AppController from 'app/controllers';
import Localization from 'app/services/localization';
import { Dashboard as DashboardFeatures } from 'common/constants/features';

type State = {
    editingBio: boolean;
    editingEmail: boolean;
};

@observer
class Profile extends React.Component<{}, State> {
    _name: React.RefObject<HTMLInputElement> = React.createRef();

    state = {
        editingBio: false,
        editingEmail: false,
    };

    constructor(props: any) {
        super(props);

        ProfileViewModel.Prewarm();
    }

    get model() { return ProfileViewModel.Instance; }

    editPersonalInfo = () => {
        this.setState({ editingBio: true }, () => {
            this._name?.current?.focus();
        });
    }

    canceEditPersonalInfo = () => {
        this.model.resetPersonalInfo();
        this.setState({ editingBio: false });
    }

    savePersonalInfo = async () => {
        await this.model.savePersonalInfoAsync();
        this.setState({ editingBio: false });
    }

    render() {
        const bio = this.model.bio.value;
        const { editingBio } = this.state;
        const userAvatarUrl = getUserAvatarUrl();

        const { user, disablePassword, editingPhoneNumbers, savePhones, resetPhones } = this.model;
        const billing = user?.billing;
        const nextPaymentAttempt = billing?.nextPaymentAttempt;
        const trialEnd = billing?.trialPeriondEnd;
        const cancelAt = billing?.cancelAt;

        const plan = billing?.plan;
        const planCategory = billing?.planCategory;

        const feedbackLink = Localization.Current.DashboardProject.feedbackLink;

        return (
            <Page className={`profile-page ${editingBio ? 'editing' : ''}`} inProgress={this.model.inProgress}>
                <Container>
                    <UploadAvatar currentUrl={userAvatarUrl} saveAvatar={this.model.saveAvatar} />
                    <View className="content">

                        <View className="top-content">
                            <View className="left-block">
                                <View className="name-row">
                                    {editingBio
                                        ? (
                                        <InputObservable
                                            model={this.model.name}
                                            disabled={!editingBio}
                                            lightTheme
                                            className="name"
                                            createRef={this._name}
                                            maxLength={35}
                                        />
                                        )
                                        : <Text className="title title-h1">{this.model.name.value}</Text>
                                    }
                                </View>
                                <View className="desc-1 bio">
                                    {
                                        editingBio
                                            ? (
                                                <TextAreaObservable
                                                    model={this.model.bio}
                                                    placeholder="Add your bio"
                                                    disabled={!editingBio}
                                                    className="bio"
                                                    maxLength={350}
                                                    lightTheme
                                                />
                                            )
                                            : <MarkdownView content={bio || 'Add your bio'} />
                                    }
                                </View>

                                {
                                    editingBio
                                        ? (
                                            <View className="btn-wrap">
                                                <View className="label-btn4 type1 edit-title" onClick={this.canceEditPersonalInfo}>cancel</View>
                                                <View className="divider" />
                                                <View className="label-btn4 type2 edit-title" onClick={this.savePersonalInfo}>save changes</View>
                                            </View>
                                        )
                                        : <View className="label-btn4 type2 edit-title" onClick={this.editPersonalInfo}>edit personal info</View>
                                }
                            </View>
                            <View className="right-block">
                                {!this.model.isFreeAccess && !process.appFeatures.BILLING_DISABLED && (
                                    <SubscriptionCard
                                        plan={plan}
                                        planCategory={planCategory}
                                        trialEnd={trialEnd}
                                        cancelAt={cancelAt}
                                        nextPaymentAttempt={nextPaymentAttempt}
                                    />
                                )}
                            </View>
                        </View>

                        <View className="separator" />
                        <InputObservable
                            label="email"
                            model={this.model.email}
                            placeholder="your email"
                            disabled={true}
                            lightTheme
                            className="email"
                        />
                        <View className="separator" />

                        {
                            this.model.organization &&

                            <>
                                <Input
                                    label="Organization"
                                    value={this.model.organization}
                                    disabled={true}
                                    lightTheme
                                    className="organization"
                                />
                                <View className="separator" />
                            </>

                        }
                        {DashboardFeatures.UseMobileNumber && (
                            <>
                                <View className="phones-row">
                                    <InputObservable
                                        label="mobile number"
                                        type="tel"
                                        model={this.model.mobileNumber}
                                        lightTheme
                                        placeholder="Mobile Phone Number"
                                        className="mobile-phone-wrap"
                                    />
                                    <InputObservable
                                        label="office number"
                                        type="tel"
                                        model={this.model.officeNumber}
                                        lightTheme
                                        placeholder="Office Phone Number"
                                        className="office-phone-wrap"
                                    />
                                    <View className="phones-row-buttons">
                                    { editingPhoneNumbers &&
                                        <>
                                            <View className="label-btn4 type1 phones-btn" onClick={resetPhones}>
                                                Cancel
                                            </View>
                                            <View className="divider" />
                                            <View className="label-btn4 type2 phones-btn" onClick={savePhones}>
                                                Save
                                            </View>
                                        </>
                                    }
                                    </View>
                                </View>
                                <View className="separator" />
                            </>
                        )}

                        {!disablePassword ?
                            <>
                                <View className="password-row">
                                    {this.model.needsCreatePassword
                                        ? (
                                            <View className="password-row-create">
                                                <View className="text-block">
                                                    <Text className="desc-1 type1 password-row-create-title">
                                                        Secure your account
                                                    </Text>
                                                    <Text className="desc-3 password-row-create-subtitle">
                                                        Use a strong password with a minimum of 6 symbols
                                                    </Text>
                                                </View>
                                                <View className="label-btn4 type2 password-row-create-btn" onClick={this.model.createPassword}>
                                                    Create password
                                                </View>
                                            </View>
                                        ) : (
                                            <>
                                                <View className="password-row-inputs">
                                                    <InputObservable
                                                        label="Old Password"
                                                        model={this.model.oldPassword}
                                                        placeholder="Type Your Old Password"
                                                        lightTheme
                                                        className="pass-input-wrap"
                                                        type="password"
                                                        autocomplete="password"
                                                        errorMessage={this.model.passwordsError ? this.model.passwordsError : null}
                                                    />
                                                    <InputObservable
                                                        label="new Password"
                                                        model={this.model.newPassword}
                                                        placeholder="Type Your New Password"
                                                        lightTheme
                                                        className="pass-input-wrap"
                                                        type="password"
                                                        autocomplete="new-password"
                                                        onSubmit={this.model.savePassword}
                                                    />
                                                    <View className="password-row-buttons">
                                                        <View className="label-btn4 type1 password-row-inputs-btn" onClick={this.model.forgotPassword}>
                                                            forgot password?
                                                        </View>
                                                        <View className="divider" />
                                                        <View className="label-btn4 type2 password-row-inputs-btn" onClick={this.model.savePassword}>
                                                            Save
                                                        </View>
                                                    </View>
                                                </View>
                                                { this.model.passwordsError && (
                                                    <Text className="input-error up-text input-error-message passwords-error">
                                                        {this.model.passwordsError}
                                                    </Text>
                                                )}
                                            </>
                                        )}
                                </View>
                                <View className="separator" />
                            </>
                        : null}
                        <View className="profile-page-footer">
                            <Button
                                title="I want to sign out"
                                onClick={this.model.signOut}
                                titleClassName="label-btn4 up-text"
                                className="sign-out"
                            />
                            <View className="links-list">
                                <Text className="label-btn3 app-version">
                                    {Localization.Current.DashboardProject.projectName} v{AppController.Instance.FullVersion}
                                </Text>
                                {
                                    (!!feedbackLink && feedbackLink.length !== 0) &&
                                    <a href={feedbackLink} rel="noopener" target="_blank" className="label-btn3 type1 links-list-item">
                                        product feedback
                                    </a>
                                }
                                <Link to={Routes.Terms} className="label-btn3 type1 links-list-item">terms of service</Link>
                                <Link to={Routes.Privacy} className="label-btn3 type1 links-list-item">privacy policy</Link>
                            </View>
                        </View>
                    </View>
                </Container>
            </Page>
        );
    }
}

export default Profile;
