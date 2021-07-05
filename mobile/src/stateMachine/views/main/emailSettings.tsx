import { ViewState } from '../base';
import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, Text, KeyboardAvoidingView, View } from 'react-native';
import {
    MasloPage,
    Container,
    BackArrow,
    Button,
    TextInput,
} from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import SettingsEmailViewModel from 'src/viewModels/SettingsEmailViewModel';
import { magicLinkModal } from '../login/magicLink';
import TextStyles, { mainFontThin } from 'src/styles/TextStyles';

@observer
export class EmailSettingsView extends ViewState {
    private readonly model = new SettingsEmailViewModel();

    start() {
        this.hidePersona();
    }

    onSave = () => {
        this.showModal(
            magicLinkModal(this, this.onSave, {
                title: 'Check your email for an activation link',
            }),
        );
    };

    renderContent() {
        return (
            <KeyboardAvoidingView behavior="padding" style={{ height: '100%' }}>
                <MasloPage>
                    <Container>
                        <BackArrow
                            onPress={() => this.trigger(ScenarioTriggers.Back)}
                        />
                        <Text
                            style={{
                                ...TextStyles.h1,
                                fontFamily: mainFontThin,
                            }}>
                            Email
                        </Text>
                    </Container>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            onSubmit={this.model.submit}
                            model={this.model.email}
                            placeholder="Your New Email"
                            forceError={this.model.error}
                            autoCompleteType="email"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            label="New Email"
                            styleWrap={styles.inputWrap}
                            styleInput={[
                                this.baseStyles.cardTitle,
                                styles.input,
                            ]}
                            // styleError={styles.errorMsg}
                            styleLabel={styles.inputLabel}
                        />
                    </View>
                    <Container>
                        <Button
                            withBorder
                            isTransparent
                            title="Save"
                            onPress={this.onSave}
                        />
                    </Container>
                </MasloPage>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    // errorMsg: {
    //     // marginTop: 8,
    //     paddingHorizontal: 20,
    //     justifyContent: 'flex-start',
    //     alignItems: 'flex-start',
    //     textAlign: 'left',
    // },
    inputWrap: {
        position: 'relative',
        alignItems: 'flex-start',
        paddingTop: 40,
    },
    input: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        textAlign: 'left',
    },
    inputLabel: {
        position: 'absolute',
        top: 20,
        left: 20,
        marginTop: 0,
    },
});
