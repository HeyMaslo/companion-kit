// import { ViewState } from '../base';
// import React from 'react';
// import { observer } from 'mobx-react';
// import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
// import { MasloPage, Container } from 'src/components';
// import { ScenarioTriggers } from '../../abstractions';
// import { createLogger } from 'common/logger';
// import Images from 'src/constants/images';

// export const logger = createLogger('[PrefInstruction]');

// const minContentHeight = 1000;

// const display = [{ title: 'In the Polarus App. access Settings on the top right of your Profile.', image: Images.settingsIcon },
// { title: 'Next, tap on Notification Preferences to turn on/off notifications.', image: Images.settingsIcon },
// { title: 'Tap on Customize Notifications to set domain preferences.', image: Images.settingsIcon },
// ]

// @observer
// export class PreferencesInstructionsView extends ViewState {
//     constructor(props) {
//         super(props);
//         this._contentHeight = this.persona.setupContainerHeight(minContentHeight, { transition: { duration: 2.2 } });
//     }

//     state = {
//         screen: 0
//     }

//     async start() {
//     }

//     onClose = () => {
//         this.trigger(ScenarioTriggers.Back);
//     }

//     onThreeSelected = () => {
//         this, this.trigger(ScenarioTriggers.Submit)
//     }

//     renderContent() {
//         let { screen } = this.state;
//         return (
//             <MasloPage style={this.baseStyles.page} onClose={this.onClose} withDots dotLength={4} activeDot={screen}>
//                 <Container style={[{ height: this._contentHeight, alignItems: 'center', felx: 1, paddingTop: 100 }]}>
//                     <Text style={[this.textStyles.h1, styles.title]}>{display[screen].title}</Text>
//                     <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', flex: 1, width: '100%' }}>
//                         {display[screen].image}
//                     </View>
//                     {screen < 2 ? <TouchableOpacity
//                         style={[styles.continueButton]}
//                         onPress={() => this.setState({ screen: screen + 1 })}
//                     >
//                         <Text style={[this.textStyles.p1, { fontSize: 25 }]}>Continue   </Text>
//                         <Images.backIcon style={{ transform: [{ rotate: '180deg' }] }} />
//                     </TouchableOpacity> : <View style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={[this.textStyles.h2, styles.continueButton, { justifyContent: 'center' }]}>Your Done!</Text></View>}
//                 </Container>
//             </MasloPage>
//         );
//     }
// }

// const styles = StyleSheet.create({
//     title: {
//         justifyContent: 'center',
//         textAlign: 'center',
//         width: '100%',
//     },
//     message: {
//         marginTop: "100%",
//         textAlign: 'center',
//         width: '90%',
//         marginBottom: '20%',
//     },
//     readyButton: {
//         width: '45%',
//         height: 45,
//     },
//     readyButtonNo: {
//         width: '45%',
//         height: 45,
//         backgroundColor: '#ffff',
//         borderRadius: 5
//     },
//     continueButton: {
//         width: '100%',
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 100,
//         justifyContent: 'center'
//     },
// });
