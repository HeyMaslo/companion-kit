import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Image, Page, Container, Button } from '../common/components';
import ButtonArrow from 'app/components/ButtonArrow';
import PaymentInfoViewModel from 'app/viewModels/PaymentInfoViewModel';
import { StripeProvider } from 'react-stripe-elements';
import { Elements } from 'react-stripe-elements';

import CreditCardElements from 'app/components/CreditCardElements';

import checkedIcon from 'assets/img/checked-icon.svg';
import { PlanUI } from 'common/models/Plans';
import History from 'app/services/history';
import * as Routes from 'app/constants/routes';
import RadioButtonsGroup from 'app/common/components/RadioButtonsGroup';
import PricingRadioButtonsGroup from 'app/common/components/PricingRadioButtonsGroup';
import EnterpriseModal from 'app/components/EnterpriseModal';
import Env from 'app/constants/env';
import Localization from 'app/services/localization';

@observer
class Pricing extends React.Component {

    state = {
        isModalOpen: false,
    };

    _cardRef: React.RefObject<any> = React.createRef();

    private readonly model = new PaymentInfoViewModel();

    get planExist() {
        const { user } = this.model;
        const billing = user && user.billing;
        const planExist = billing && !!billing.defaultSource;

        return planExist;
     }

    start = async (token: stripe.Token) => {
        const res = await this.model.submit(token);

        if (res && res.ok) {
            if (this.planExist) {
                History.push(Routes.Profile);
            } else {
                // location.reload();
                /** TODO update router and push to profile */
            }
        }
    }

    onError = (err: stripe.Error & { decline_code?: string; }) => {
        this.model.error = err.message;
    }

    private _toggleEnterpiseModal = () => {
        this.setState({
            isModalOpen: !this.state.isModalOpen,
        });
    }

    componentDidMount() {
        this.model.initialize();
    }

    componentWillUnmount() {
        this.model.clearError();
        this.model.dispose();
    }

    submit = () => {
        // call onSave method of the credit card row component
        const cardRow = this._cardRef.current && this._cardRef.current.wrappedInstance;

        if (cardRow && cardRow.onSave) {
            cardRow.onSave();
        }
    }

    getFormattedChargeDate = (date?: number) => {
        const { billing } = this.model;
        const trialEnd = billing && billing.trialPeriondEnd;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();

        let playmenDate: Date = date ? new Date(date * 1000) : null;

        if (!playmenDate) {
            playmenDate = trialEnd
                ? new Date(trialEnd * 1000)
                : new Date(now.setMonth(now.getMonth() + 1));
        }

        const displayMonth = monthNames[playmenDate.getMonth()];

        return `${displayMonth} ${playmenDate.getDate()}`;
    }

    render() {
        const { clients, inProgress, PlanRadioModel, PlanCategoryRadioModel, billing, error, downgradeAllowed } = this.model;

        const plan = PlanRadioModel.selectedItem;
        const planCategory = PlanCategoryRadioModel.selectedItem;
        const userSubscribed = !!billing;
        const changingPlan = !!billing && !!plan && !!planCategory && (plan !== billing.plan || planCategory !== billing.planCategory);
        const showTotal = !userSubscribed && plan && planCategory || userSubscribed && changingPlan;

        // TODO use enum helper
        const period = () => {
            let val: string = 'monthly';
            if (plan === 'monthly') {
                val = 'month';
            } else if (plan === 'annual') {
                val = 'year';
            }
            return val;
        };

        const planUIObj = PlanUI[PlanRadioModel.selectedItem];
        const uiObj = planUIObj && planUIObj[planCategory];
        const price = uiObj && uiObj.price || null;
        const nextPaymentAttempt = new Date().getTime();
        const paymentFailed = billing && billing.paymentFailed;
        // const nextPaymentAttempt = billing && billing.nextPaymentAttempt;

        const featureItems = Localization.Current.DashboardProject.signUp.leftBlock.listFeatures;

        return (
            <Page className="pricing-page" inProgress={inProgress}>
                <Container className="pricing-container">
                    <View className="row-wrap pricing-billing-wrap">
                        <Text className="title-h2 type1 pricing-title">Billing</Text>
                        <Text className="desc-3 pricing-subtitle">Save two months with annual pricing.</Text>
                        <RadioButtonsGroup model={PlanRadioModel} />
                    </View>
                    <View className="row-wrap pricing-plans-wrap">
                        <Text className="title-h2 type1 pricing-title">Plans</Text>
                        {!downgradeAllowed &&
                            <View className="pricing-subtitle">
                                <Text className="desc-3">
                                    {/* tslint:disable-next-line: max-line-length */}
                                    You have <Text className="desc-3 type2">{clients.length} clients</Text>, to downgrade you need to&nbsp;
                                    {/* tslint:disable-next-line: max-line-length */}
                                    <Button onClick={() => History.push(Routes.Clients)} titleClassName="desc-3 type3">deactivate and delete some client accounts</Button>
                                </Text>
                            </View>
                        }

                        {paymentFailed && (
                            <View className="up-text input-error-message">
                                {`Your last charge wasn't successful. We have temporarily restricted your access.`}
                                {nextPaymentAttempt ? ` We will retry to charge you on ${new Date(nextPaymentAttempt).toLocaleDateString()}` : ''}
                            </View>
                        )}

                        <View className="pricing-items-wrap">
                            <PricingRadioButtonsGroup
                                model={PlanCategoryRadioModel}
                                currentCategory={billing && billing.planCategory}
                                currentPlan={billing && billing.plan}
                                selectedPlan={PlanRadioModel.selectedItem}
                                acitveUsersCount={clients.length}
                            />
                            <View className="enterprise-plan">
                                <View className="enterprise-plan-heading">
                                    <Text className="desc-1 type1 enterprise-plan-title">Enterprise</Text>
                                    <Text className="desc-3">for Large Organizations</Text>
                                </View>
                                <Text className="label-btn4 enterprise-plan-client-limit">Unlimited Client Accounts</Text>
                                <ButtonArrow
                                    typeButton="primary"
                                    title="Contact us"
                                    titleClassName="type1"
                                    onClick={() => this._toggleEnterpiseModal()}
                                    className="enterprise-plan-button"
                                />
                            </View>
                        </View>
                    </View>
                    <View className="row-wrap pricing-features-wrap">
                        <Text className="title-h2 type1 pricing-title">Features</Text>
                        <Text className="desc-3 pricing-subtitle">What’s included in every plan</Text>
                        <ul className="features-list">
                            {featureItems.map((item, i) => (
                                <li key={i} className="feature-item">
                                    <Image className="feature-icon" src={checkedIcon} />
                                    <Text className="desc-3 type2">{item}</Text>
                                </li>
                            ))}
                        </ul>
                        <View className="desc-3 pricing-help">
                            Got a question?&nbsp;
                            <a href={Routes.HelpLink} target="_blank" className="desc-3 type3">Check out our FAQs</a>
                        </View>
                    </View>
                    <View className="row-wrap card-row-wrap">
                        <Text className="title-h2 type1 pricing-title">Payment Details</Text>
                        <View className="credit-card-row">
                            <StripeProvider apiKey={Env.StripeProviderKey}>
                                <Elements>
                                    <CreditCardElements onCardSave={this.start} onError={this.onError} ref={this._cardRef} />
                                </Elements>
                            </StripeProvider>
                        </View>
                        {error && <View className="up-text input-error-message">{error}</View>}
                    </View>
                    <View className="row-wrap pricing-total-wrap">
                        <Text className="title-h2 type1 pricing-title">Total</Text>
                            {showTotal
                                ? (
                                    <View className="pricing-total">
                                        {!billing &&
                                            <View className="pricing-total-column">
                                                <Text className="label-btn4">Free Trial</Text>
                                                <Text className="desc-1 type1 cap-text">30 days</Text>
                                            </View>
                                        }
                                        <View className="pricing-total-column">
                                            <Text className="label-btn4">Selected Plan</Text>
                                            <Text className="desc-1 type1 cap-text">{planCategory}</Text>
                                        </View>
                                        <View className="pricing-total-column">
                                            <Text className="label-btn4">Price</Text>
                                            <Text className="desc-1 type1 cap-text">${price}<Text className="period">/{period()}</Text></Text>
                                        </View>
                                        <View className="pricing-total-column">
                                            <Text className="label-btn4">{!billing ? 'First Charge' : 'Next Charge'}</Text>
                                            <Text className="desc-1 type1 cap-text">
                                                {billing && billing.nextPaymentAttempt
                                                    ? this.getFormattedChargeDate(billing.nextPaymentAttempt)
                                                    : this.getFormattedChargeDate()
                                                }
                                            </Text>
                                        </View>
                                    </View>
                                )
                                : <Text className="desc-3 pricing-total-no-plan">Please, select a plan to continue</Text>
                            }
                    </View>
                    <View className="row-wrap submit-wrap">
                        <ButtonArrow
                            typeButton="primary"
                            title="start working"
                            titleClassName="type4"
                            onClick={this.submit}
                            className="submit-button"
                        />
                        {
                            billing && billing.subscriptionId && !billing.cancelAt && (
                                <Button
                                    title="Cancel Subscription"
                                    onClick={this.model.cancelSubscription}
                                    titleClassName="label-btn4 up-text"
                                    className="sign-out cancel-subscription"
                                />
                            )
                        }
                    </View>
                </Container>
                <EnterpriseModal
                    isOpen={this.state.isModalOpen}
                    onClose={() => this._toggleEnterpiseModal()}
                    onSubmit={() => {}}
                />
            </Page>
        );
    }
}

export default Pricing;