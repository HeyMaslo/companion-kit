import React from 'react';
// import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { observer } from 'mobx-react';
// import TextStyles from 'src/styles/TextStyles';
// import Colors from 'src/constants/colors';
import {
    // Container, MasloPage, Button,
    ButtonContext,
} from 'src/components';
import * as Links from 'src/constants/links';
import { ViewState } from '../base';
import { NoProfileViewModel } from 'src/viewModels/NoProfileViewModel';
import Localization from 'src/services/localization';

@observer
export class MissingAccountView extends ViewState {
    private readonly model = new NoProfileViewModel();

    start() {
        // this.resetPersona();

        if (this.model.hasDisabledAccount) {
            this.showModal({
                title: Localization.Current.MobileProject.disabledClientAccount,
                primaryButton: {
                    text: Localization.Current.Logout,
                    action: this.model.logout,
                },
                secondaryButton: {
                    customRender: () =>
                        ButtonContext({
                            text: Localization.Current.ThinkItsAMistake,
                            buttonText: Localization.Current.ContactUs,
                            onPress: () =>
                                Links.tryOpenLink(
                                    Localization.Current.MobileProject
                                        .contactUsLink,
                                    false,
                                ),
                        }),
                },
            });
        } else {
            this.showModal({
                title: Localization.Current.MobileProject.missingAccountTitle,
                message:
                    Localization.Current.MobileProject
                        .missingAccountDescription,
                primaryButton: {
                    text: Localization.Current.TryAgain,
                    action: this.model.logout,
                },
                secondaryButton: {
                    customRender: () =>
                        ButtonContext({
                            text: Localization.Current.ThinkItsAMistake,
                            buttonText: Localization.Current.ContactUs,
                            onPress: () =>
                                Links.tryOpenLink(
                                    Localization.Current.MobileProject
                                        .contactUsLink,
                                    false,
                                ),
                        }),
                },
            });
        }
    }

    renderContent() {
        return null;
        // const { model } = this;
        // const accounts = model.allAccounts;

        // return (
        //     <MasloPage>
        //         <ScrollView contentContainerStyle={{ flex: 1 }}>
        //             <Container style={styles.contentContainer}>
        //                 <View style={styles.inputWrap}>
        //                     { model.name
        //                         ? (<Text style={[TextStyles.h1, styles.title]}>
        //                             Hey {model.name}!
        //                         </Text>
        //                         ) : null}
        //                     <Text style={[TextStyles.p1, styles.desc]}>
        //                         I can't recognize you by your email: <Text style={[TextStyles.p1, styles.emailText]}>
        //                             {model.email}
        //                         </Text>
        //                     </Text>
        //                     <Text style={[TextStyles.p1, styles.desc]}>
        //                         It can be a mistake, please log in again with the email address you provided to your coach.
        //                     </Text>
        //                     { (accounts && accounts.length > 0) ? (
        //                         <>
        //                             <Text style={[ TextStyles.p1, styles.desc ]}>But there're some other accounts:</Text>
        //                             {accounts.map(s => (<Text style={[TextStyles.p3, styles.desc]} key={s.id}>{s.text}</Text>))}
        //                         </>
        //                     ) : null}
        //                 </View>
        //                 <Button
        //                     title="logout"
        //                     onPress={model.logout}
        //                 />
        //             </Container>
        //         </ScrollView>
        //     </MasloPage>
        // );
    }
}

// const styles = StyleSheet.create({
//     contentContainer: {
//         width: '100%',
//         height: '100%',
//         flex: 1,
//         justifyContent: 'space-between',
//         alignContent: 'center',
//         paddingTop: 220,
//         paddingBottom: 40,
//     },
//     emailText: {
//         color: Colors.noProfileScreen.emailTextColor,
//     },
//     title: {
//         justifyContent: 'center',
//         alignContent: 'space-between',
//         textAlign: 'center',
//         width: '100%',
//         color: Colors.noProfileScreen.titleColor,
//     },
//     desc: {
//         textAlign: 'center',
//         marginTop: 12,
//         color: Colors.noProfileScreen.descColor,
//     },
//     inputWrap: {
//         marginTop: 25,
//     },
// });
