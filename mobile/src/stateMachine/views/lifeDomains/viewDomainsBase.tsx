import { months } from 'common/utils/dateHelpers';
import React from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Container, MasloPage } from 'src/components';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';
import { ViewState } from '../base';
import Layout from 'src/constants/Layout';
import { iconForDomain } from 'src/helpers/DomainHelper';
import { DomainName } from 'src/constants/Domain';

const { width } = Dimensions.get('window');
const date = new Date();
const today = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;


export abstract class ViewDomainsBase extends ViewState {

    constructor(props) {
        super(props);
        this._contentHeight = this.persona.setupContainerHeightForceScrollDown({ rotation: -15, transition: { duration: 1}, scale: 1.2});
    }

    state = {
        active: 0,
        xTabOne: 0,
        xTabTwo: 0,
        translateX: new Animated.Value(0),
        translateXTabTwo: new Animated.Value(width),
        translateXTabOne: new Animated.Value(0),
        translateY: 0,
        xDomain: 0,
    }

    handleSlide = type => {
        let {xTabOne, xTabTwo, active, translateX, translateXTabTwo, translateXTabOne } = this.state
        Animated.spring(translateX, {
            toValue: type,
            useNativeDriver: true,
        }).start()

        if (active === 0){
            Animated.parallel([
                Animated.spring(translateXTabOne, {
                    toValue: 0,
                    useNativeDriver: true,
                })
            ]).start()
            Animated.spring(translateXTabTwo, {
                toValue: width,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.parallel([
                Animated.spring(translateXTabOne, {
                    toValue: -width,
                    useNativeDriver: true,
                })
            ]).start()
            Animated.spring(translateXTabTwo, {
                toValue: 0,
                useNativeDriver: true,
            }).start()
        }

    }

    async start() {
    }

    public abstract onCancel? = () => {}

    public abstract onBack? = () => {}

    public abstract onDetails = () => {}

    public abstract getDomainDisplay = (): string[] => {
        return [];
      }

    public abstract goToRight = () => {}

    public abstract goToLeft = () => {}

    public getCenterElement(): JSX.Element {
      return(<></>);
  }

    renderContent() {
        let {xTabOne, xTabTwo, active, translateX, translateXTabTwo, translateXTabOne, translateY, xDomain} = this.state
        const [lDomain, domain, rDomain, importance] = this.getDomainDisplay();
        const centerDomainName = domain as DomainName
        console.log('DomainName iden', DomainName.IDENTITY);

        return (
            <MasloPage style={this.baseStyles.page} onClose={this.onCancel} onBack={this.onBack}>
                <Container style={[{height: this._contentHeight, paddingTop: 10, paddingBottom: 10}]}>
                    <View style={{justifyContent: 'space-between', flexDirection: 'row', marginBottom: 20}}>
                        <Text style={[TextStyles.p1, styles.domain]}>{domain}</Text>
                        <Text style={[TextStyles.labelMedium, styles.date]}>{today}</Text>
                    </View>
                    <View style={{borderWidth: 1, borderColor: '#CBC8CD', borderRadius: 10, height: Layout.window.height * 0.37, justifyContent: 'center', alignItems: 'center'}}>
                            <View style={{
                                flexDirection: 'row', 
                                margin: 10,
                                height: 36,
                                position: 'relative',
                                borderRadius: 4,
                            }}>
                                <TouchableOpacity
                                style={[styles.tabs,{
                                    borderRightWidth: 0,
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                }]}
                                onLayout = {event => this.setState({xTabOne: event.nativeEvent.layout.x})}
                                onPress = {() => this.setState({active: 0}, () => this.handleSlide(xTabOne))}
                                >
                                    <Text style={{fontWeight: active === 0 ? 'bold' : 'normal', textDecorationLine: active === 0 ? 'underline' : 'none'}}>Importance</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                 style={[ styles.tabs,{
                                    borderLeftWidth: 0,
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0
                                }]}
                                onLayout = {event => this.setState({xTabTwo: event.nativeEvent.layout.x})}
                                onPress = {() => this.setState({active: 1}, () => this.handleSlide(xTabTwo))}
                                >
                                    <Text style={{fontWeight: active === 1 ? 'bold' : 'normal', textDecorationLine: active === 1 ? 'underline' : 'none'}}>Timeline</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView>
                                <Animated.View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: 10,
                                    transform: [{
                                        translateX: translateXTabOne
                                    }]
                                   
                                }}
                                onLayout = {event => this.setState({translateY: event.nativeEvent.layout.height})}
                                >
                                    <Text style={this.textStyles.p2}>
                                        {importance}
                                    </Text>
                                </Animated.View>
                                <Animated.View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transform: [{
                                        translateX: translateXTabTwo
                                    },
                                    {
                                        translateY: -translateY
                                    }]
                                }}>
                                    <Images.noStatistics width={200} height={100} />
                                    <Text style={[this.textStyles.h1, styles.placeholderHeading]}>No statistics yet</Text>
                                    <Text style={[this.textStyles.p1, styles.placeholderSubtitle]}>{'Complete at-least one week of check-ins to use your timeline.'}</Text>
                                </Animated.View>     
                            </ScrollView>
                            <View style= {[{
                                    marginLeft: 'auto',
                                    flexDirection: 'row',
                                    paddingBottom: 10,
                                }]}>
                                    <Button
                                        title= {active === 0 ? 'View Details' : 'Calendar'}
                                        style={styles.buttonDetails}
                                        titleStyles={styles.mailButtonTitle}
                                        onPress={active === 0 ? () => this.onDetails() : null}
                                        isTransparent
                                     />

                                </View>
                    </View>
                    <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', height: Layout.window.height * 0.25, marginBottom: 10}}>
                         {iconForDomain(centerDomainName, {flex: 1}, TextStyles.h1.color, 60, 60)}
                        {this.getCenterElement()}
                    </View>
                    <View 
                     style={{
                         flexDirection: 'row', 
                         justifyContent: 'space-between', 
                         marginBottom: 50,
                         }}>
                         <TouchableOpacity onPress = {this.goToLeft}>
                            <Images.backIcon width={20} height={20} />
                         </TouchableOpacity>
                         <Text style={[TextStyles.p1, styles.domain, {fontSize: 30}]}>{domain}</Text>
                         <TouchableOpacity onPress = {this.goToRight}>
                            <Images.backIcon width={20} height={20} style={{transform: [{ rotate: '180deg' }]}}/>
                         </TouchableOpacity>
                    </View>
                     <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress = {this.goToLeft}>
                            <Text style={[TextStyles.labelMedium, styles.domain, {fontSize: 17}]}>{lDomain}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress = {this.goToRight}>
                            <Text style={[TextStyles.labelMedium, styles.domain, {fontSize: 17}]}>{rDomain}</Text>
                        </TouchableOpacity>
                     </View>
                </Container>
            </MasloPage>
        );
    }
}

const styles = StyleSheet.create({ 
    title: {
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        height: 350,
        paddingBottom: 50,
    },
    buttons: {
        height: 60,
        width: '90%',
    },
    tabs: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 4,
    },
    placeholderHeading: {
        marginTop: 16,
        marginBottom: 12,
    },
    placeholderSubtitle: {
        textAlign: 'center',
        maxWidth: '90%',
        marginVertical: 0,
        marginHorizontal: 'auto',
        color: Colors.secondarySubtitle,
    },
    buttonDetails : {
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 20,
        borderWidth: 1,
        backgroundColor: '#E0E0E0',
        height: 40,
        width: '45%',
    },
    mailButtonTitle: {
        color: 'black',
        fontSize: 10,
        padding: 10,
    },
    date: {
        textTransform: 'uppercase',
    },
    domain: {
        fontWeight: '500',
        letterSpacing: 1.79,
        fontFamily: mainFontMedium,
    },
});
