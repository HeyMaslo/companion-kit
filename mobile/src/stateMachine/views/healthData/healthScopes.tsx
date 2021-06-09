import React from 'react';
import { observer } from 'mobx-react';
import { StyleSheet, View, Text,ScrollView,Platform} from 'react-native';
import { ViewState } from '../base';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import { PushToast } from '../../toaster';

import { Button, MasloPage,Container, Card, Checkbox} from 'src/components';
import { ScenarioTriggers } from '../../abstractions';
import Layout from 'src/constants/Layout';
import { PersonaScrollMask } from 'src/components/PersonaScollMask';
import Switch from 'dependencies/react-native-switch-pro';
import { HealthPermissionsViewModel } from 'src/viewModels/HealthPermissionsViewModel';
import TextStyles from 'src/styles/TextStyles';


@observer
export class HealthScopesView extends ViewState {
    constructor(props) {
        super(props);
        // this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { rotation: 405 });
        this._contentHeight = this.persona.setupContainerHeightForceScroll();
    }

    state = {
        // opacity: new Animated.Value(0),
    };

    private readonly model = new HealthPermissionsViewModel();


    async start() {
        this.model.settingsSynced.on(this.onScheduleSynced);
    }
    componentWillUnmount() {
        this.model.settingsSynced.off(this.onScheduleSynced);
    }

    onScheduleSynced = () => {
        PushToast({ text: 'Changes saved' });
    }

    onNext = () => {
         this.trigger(ScenarioTriggers.Primary)
    }
    renderContent() {
        const enabled = Platform.OS == 'ios'? this.model.isEnabledOG : this.model.isEnabled;
        const permissionsEnabled = enabled && !this.model.isToggleInProgress;
        const titleText = "Health Data";
        const explaining ="We are collecting your health data to build a better personalized experience for you in the app";
        const perm = this.model.getPermissions();
        return (
        <MasloPage style={this.baseStyles.page}>
            <Container style={styles.topBarWrapWrap}>
                <PersonaScrollMask />
                <View style={styles.topBarWrap}>
                    <Button style={styles.backBtn} underlayColor="transparent" onPress={() => this.trigger(ScenarioTriggers.Back)}>
                        <Images.backIcon width={28} height={14} />
                    </Button>
                </View>
            </Container>
            <ScrollView style={[{ zIndex: 0, elevation: 0 }]}>
                <Container style={[this.baseStyles.container, styles.container]}>
                    <Text style={[this.textStyles.h1, styles.title]}>{titleText}</Text>
                    <Text style={[this.textStyles.p1, styles.subTitle]}>{explaining}</Text>
                    <Card
                        title="Permissions"
                        description={permissionsEnabled ? "ON" :  'Off' }
                        style={{ marginBottom: 20 }}
                    >
                        <Switch
                                value={Platform.OS == 'ios'? this.model.isEnabledOG : this.model.isEnabled}
                                disabled={this.model.isToggleInProgress}
                                onSyncPress={this.model.toggleEnabledState}
                                width={50}
                                height={24}
                                backgroundActive={Colors.switch.activeBg}
                                backgroundInactive={Colors.switch.inactiveBg}
                                style={styles.switchStyles}
                                circleStyle={{ width: 18, height: 18 }}
                            />
                    </Card>
                    {(
                        <>
                           {perm.map((n, key) => {
                               return <Card
                               title={n.title}
                               description={permissionsEnabled? "Authorization on" : "Authorization off"}
                               Image={n.icon}
                               key={key}
                           >
                               <Checkbox
                                   checked={permissionsEnabled}
                                   onChange={this.onNext}
                               />
                           </Card>
                           })}
                        </>
                    )} 
                    {!permissionsEnabled && Platform.OS == 'ios' && (
                    <View style={styles.buttonView}>
                    <Button
                   title="How Do I change permissions?"
                   style={[styles.mailButton, TextStyles.h2]}
                   titleStyles={styles.mailButtonTitle}
                   onPress={this.onNext}
                   isTransparent
                    />
                    </View>
                    )}
                </Container>
            </ScrollView>
        </MasloPage>
    );
}
}

const styles = StyleSheet.create({
topBarWrapWrap: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 2,
    elevation: 2,
},
topBarWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 72,
    zIndex: 2,
    elevation: 2,
},
backBtn: {
    width: 52,
    height: 52,
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: 'transparent',
},
container: {
    minHeight: Layout.window.height,
    paddingTop: Layout.getViewHeight(21),
},
title: {
    marginBottom: 40,
    textAlign: 'center',
},

subTitle: {
    marginBottom: 40,
    textAlign: 'center',
    color: 'grey',
    borderStartWidth: 23,
    borderEndWidth:23
},
exactCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
},
exactTime: {
    width: '100%',
    borderColor: Colors.borderColor,
    borderWidth: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
},
switchStyles: {
    paddingHorizontal: 3,
},
mailButtonTitle: {
    color: Colors.welcome.mailButton.title,
},
mailButton: {
    width: 320,
    height: 50,
    borderColor: 'white',
    borderWidth: 0.25,
    backgroundColor: '#f3f3f3',
    padding: 5
},
buttonView : {
   alignContent: 'center',
   alignItems: 'center',
   padding: 5
},
closeBtn: {
    width: 50,
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: 'transparent',
},
bottomBlock: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: process.appFeatures.GOALS_ENABLED ? 90 : 0,
},
});
