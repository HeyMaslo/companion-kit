import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import {
    MasloPage,
    Container,
    RadioButtonGroup,
    ActivityButton,
} from 'src/components';
import { ViewState } from '../base';
import * as ViewModels from 'common/viewModels';
import Layout from 'src/constants/Layout';
import Colors from 'src/constants/colors';
import AppController from 'src/controllers';
import { ScenarioTriggers } from 'src/stateMachine/abstractions';
import Markdown from 'react-native-markdown-renderer';

import Terms from 'src/assets/terms-of-service';
import PrivacyPolicy from 'src/assets/privacy-policy';
import { TextStyles } from 'src/styles/TextStyles';
import Localization from 'src/services/localization';

const ConsentOptions = [
    'I am 13 years old or older and agree to the Privacy Policy and Terms of Use',
    'I am the parent and/or guardian of the app user, and I agree to the Privacy Policy and Terms of Use',
];

const rules = {
    list_item: (node, children, parent, itemStyles) => {
        return (
            <View style={styles.listUnorderedItem} key={node.key}>
                <Text style={styles.listUnorderedItemIcon}>-</Text>
                {children}
            </View>
        );
    },
};

@observer
export class ConsentView extends ViewState {
    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScroll({
            rotation: 45,
        });
    }

    start() {
        this._showMessage();
    }

    private readonly _userType = new ViewModels.SelectString(
        ConsentOptions,
        null,
    );

    private _showMessage = () => {
        const { projectName } = Localization.Current.MobileProject;
        this.showModal({
            title: 'User Agreement',
            message: `Before you use ${projectName} you must agree to the Privacy Policy and Terms of Use. If you are under 13 years old, your parent or guardian needs to read these and agree to let you use this app.`,
            primaryButton: {
                text: 'OK',
                action: this.hideModal,
            },
            contentHeight: 373,
        });
    };

    private submit = async () => {
        const result = await AppController.Instance.User.acceptConsent(
            ConsentOptions[this._userType.index],
        );
        if (result) {
            this.trigger(ScenarioTriggers.Submit);
        }
    };

    renderContent() {
        return (
            <MasloPage style={this.baseStyles.page}>
                <Container
                    style={[
                        this.baseStyles.container,
                        this.baseStyles.flexBetween,
                        { height: this._contentHeight },
                    ]}>
                    <View style={styles.textBlockWrapper}>
                        <ScrollView style={styles.textBlock}>
                            <Markdown style={styles} rules={rules}>
                                {Terms}
                            </Markdown>
                            <View style={styles.divider} />
                            <Markdown style={styles} rules={rules}>
                                {PrivacyPolicy}
                            </Markdown>
                        </ScrollView>
                    </View>
                    <RadioButtonGroup
                        model={this._userType}
                        style={styles.radioButtonsWrap}
                    />
                    <ActivityButton
                        disabled={this._userType.index == null}
                        onPress={this.submit}
                        title="Continue"
                        loading="promise"
                        style={
                            this._userType.index == null
                                ? {
                                      backgroundColor:
                                          Colors.consent.buttonDisabledBg,
                                  }
                                : null
                        }
                        titleStyles={
                            this._userType.index == null
                                ? { color: Colors.consent.buttonDisabledText }
                                : null
                        }
                    />
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({
    textBlockWrapper: {
        width: '100%',
        borderRadius: 8,
        backgroundColor: Colors.consent.textBlockBg,
        marginBottom: 24,
        flex: 1,
    },
    textBlock: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    radioButtonsWrap: {
        marginBottom: 8,
        paddingLeft: Layout.isSmallDevice ? 0 : 20,
        paddingRight: Layout.isSmallDevice ? 0 : 20,
    },
    divider: {
        marginTop: 100,
    },
    // ================== markdown styles ==================
    date: {
        marginBottom: 3,
    },
    heading1: {
        ...TextStyles.h1,
        fontWeight: '300',
        marginBottom: 12,
    },
    heading2: {
        ...TextStyles.p1,
        fontWeight: '300',
        marginTop: 50,
        marginBottom: 12,
    },
    heading3: {
        ...TextStyles.h2,
        color: Colors.consent.contentHeading,
        marginTop: 50,
        marginBottom: 12,
    },
    heading4: {
        ...TextStyles.h3,
        color: Colors.consent.contentHeading,
        marginTop: 35,
        marginBottom: 12,
    },
    heading5: {
        marginTop: 15,
        marginBottom: 8,
        ...TextStyles.p2,
        color: Colors.consent.contentHeading,
    },
    heading6: {
        marginBottom: 20,
        ...TextStyles.labelSmall,
        textTransform: 'uppercase',
    },
    text: {
        ...TextStyles.p2,
        color: Colors.consent.contentBodyText,
    },
    paragraph: {
        marginBottom: 18,
    },
    listUnorderedItemText: {
        marginTop: 0,
    },
    listUnorderedItem: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '90%',
    },
    listUnorderedItemIcon: {
        color: Colors.consent.contentPrimaryColor,
        marginLeft: 5,
        marginRight: 10,
        marginTop: 5,
    },
    listRow: {
        flexDirection: 'row',
    },
    list: {
        marginVertical: 15,
    },
    em: {
        fontStyle: 'normal',
        color: Colors.consent.contentPrimaryColor,
    },
    link: {
        color: Colors.consent.contentHeading,
    },
    strong: {
        color: Colors.consent.contentHeading,
        fontWeight: '600',
    },
    hr: {
        borderWidth: 0,
        marginTop: 32,
    },
});
