import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent, GestureResponderEvent, Text, TouchableOpacity, Animated } from 'react-native';
import Colors from 'src/constants/colors';
import { DomainName } from 'src/constants/Domain';
import Images from 'src/constants/images';
import { iconForDomain } from 'src/helpers/DomainHelper';
import TextStyles, { mainFontMedium } from 'src/styles/TextStyles';

type IconsOnCircleProps = {
  style?: StyleProp<ViewStyle>,
  circleRaius: number,
  symbolSize: number,
  highlightedDomains?: Array<DomainName>,
  onLayout?: (event: LayoutChangeEvent) => void,
}

type CircleState = {currentCallout?: DomainName, calloutLeft: number, calloutTop: number, fadeIn: Animated.Value, fadeOut: Animated.Value, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, x5: number, y5: number, x6: number, y6: number, x7: number, y7: number, x8: number, y8: number, x9: number, y11:number, y9: number, x10: number, y10: number, x11: number}

// Following adapted from https://stackoverflow.com/a/61118656

export default class IconsOnCircle extends React.Component<IconsOnCircleProps, CircleState> {

  private size: number;
  private symbolSize: number;
  private symbolRadius: number;
  private radius: number;
  private center: number;

  constructor(props) {
    super(props);
    this.radius = props.circleRaius;
    this.size = this.radius * 2;
    this.symbolSize = props.symbolSize;
    this.symbolRadius = this.symbolSize / 2;
    this.center = this.radius;

    this.state = {calloutLeft: 0, calloutTop: 0, fadeIn: new Animated.Value(0), fadeOut: new Animated.Value(1), x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, y4: 0, x3: 0, y3: 0, x4: 0, x5: 0, y5: 0, x6: 0, y6: 0, x7: 0, y7: 0, x8: 0, y8: 0, x9: 0, y9: 0, x10: 0, y10: 0, x11: 0, y11: 0}
  }

  componentDidMount() {
    Array.from({length: 12}, (x, i) => i).forEach((index) => {
      this.setupWithIndex(index);
    })
  }

  private degToRad(deg: number) {
    return deg * Math.PI / 180;
}

  private angleToCoordinates(rad: number): {x: number, y: number} {
    return {x: this.radius * Math.cos(rad) + this.center - this.symbolRadius, y: this.radius * Math.sin(rad) + this.center - this.symbolRadius};
  }

private setupWithIndex(index: number) {
  const angleRad = this.degToRad(index * 360 / 12);
  const {x, y} = this.angleToCoordinates(angleRad);

  const xKey = `x${index}`;
  const yKey = `y${index}`;
  var obj = {};
  obj[xKey] = x;
  obj[yKey] = y;
  this.setState({... obj})
}

private getIconColor(domainName: DomainName): string {
  if (this.props.highlightedDomains.includes(domainName)) {
    return Colors.typography.h1;
  }
  return Colors.typography.labelMedium;
}

private onIconTap = (domainNameKey: DomainName) => (event: GestureResponderEvent) => {
  console.log('key tapped', domainNameKey) 
  const {x, y} = this.locationForCallout(domainNameKey);
  this.setState({currentCallout: domainNameKey, calloutLeft: x, calloutTop: y});
  this.fadeIn()
}

private locationForCallout(domainName: DomainName): {x: number, y: number} {
  const offsetY = styles.calloutText.lineHeight + styles.callout.padding * 2 + 10;
  const offsetX = 20;
  switch (domainName) {
    // Bottom Half
    case DomainName.MOOD:    
      return {x: this.state.x0 - offsetX, y: this.state.y0 - offsetY};
    case DomainName.PHYSICAL:
      return {x: this.state.x1 - offsetX, y: this.state.y1 - offsetY};
    case DomainName.SLEEP:
      return {x: this.state.x2 - offsetX, y: this.state.y2 - offsetY};
    case DomainName.THINKING:
      return {x: this.state.x3 - offsetX, y: this.state.y3 - offsetY};
    case DomainName.IDENTITY:
      return {x: this.state.x4 - offsetX, y: this.state.y4 - offsetY};
    case DomainName.LEISURE:
      return {x: this.state.x5 - offsetX, y: this.state.y5 - offsetY};
    case DomainName.INDEPENDENCE:
      return {x: this.state.x6 - offsetX, y: this.state.y6 - offsetY};
      // Top Half
    case DomainName.SELFESTEEM:
      return {x: this.state.x7 - offsetX, y: this.state.y7 - offsetY};
    case DomainName.HOME:
      return {x: this.state.x8 - offsetX, y: this.state.y8 + offsetY};
    case DomainName.MONEY:
      return {x: this.state.x9 - offsetX, y: this.state.y9 + offsetY};
    case DomainName.SPIRITUAL:
      return {x: this.state.x10 - offsetX, y: this.state.y10 + offsetY};
    case DomainName.RELATIONSHIPS:
      return {x: this.state.x11 - offsetX, y: this.state.y11 - offsetY};
  }
}

fadeIn() {
  this.state.fadeIn.setValue(0)                  
  Animated.timing(
    this.state.fadeIn,           
    {
      toValue: 1,                   
      duration: 200,       
      useNativeDriver: true,       
    }
  ).start(() => this.fadeOut());                        
}

fadeOut() {
  Animated.timing(                  
     this.state.fadeIn,            
     {
       delay: 1500,
       toValue: 0,                   
       duration: 500,
       useNativeDriver: true,              
     }
  ).start();                        
}

  render() {
    return (
      // <>
      <View style={[this.props.style, { justifyContent:'center', alignItems:'center'}]} onLayout={this.props.onLayout}>
        <View style={{backgroundColor: 'transparent', width: this.size, height: this.size, borderRadius: this.radius, marginTop: this.symbolRadius, marginBottom: this.symbolRadius}}>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.MOOD)}>{iconForDomain(DomainName.MOOD, {backgroundColor: 'transparent', position:'absolute', left: this.state.x0, top: this.state.y0 }, this.getIconColor(DomainName.MOOD), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.PHYSICAL)}>{iconForDomain(DomainName.PHYSICAL, {backgroundColor: 'transparent', position:'absolute', left: this.state.x1, top: this.state.y1 }, this.getIconColor(DomainName.PHYSICAL), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.SLEEP)}>{iconForDomain(DomainName.SLEEP, {backgroundColor: 'transparent', position:'absolute', left: this.state.x2, top: this.state.y2 }, this.getIconColor(DomainName.SLEEP), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.THINKING)}>{iconForDomain(DomainName.THINKING, {backgroundColor: 'transparent', position:'absolute', left: this.state.x3, top: this.state.y3 }, this.getIconColor(DomainName.THINKING), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.IDENTITY)}>{iconForDomain(DomainName.IDENTITY, {backgroundColor: 'transparent', position:'absolute', left: this.state.x4, top: this.state.y4 }, this.getIconColor(DomainName.IDENTITY), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.LEISURE)}>{iconForDomain(DomainName.LEISURE, {backgroundColor: 'transparent', position:'absolute', left: this.state.x5, top: this.state.y5 }, this.getIconColor(DomainName.LEISURE), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.INDEPENDENCE)}>{iconForDomain(DomainName.INDEPENDENCE, {backgroundColor: 'transparent', position:'absolute', left: this.state.x6, top: this.state.y6 }, this.getIconColor(DomainName.INDEPENDENCE), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.SELFESTEEM)}>{iconForDomain(DomainName.SELFESTEEM, {backgroundColor: 'transparent', position:'absolute', left: this.state.x7, top: this.state.y7 }, this.getIconColor(DomainName.SELFESTEEM), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.HOME)}>{iconForDomain(DomainName.HOME, {backgroundColor: 'transparent', position:'absolute', left: this.state.x8, top: this.state.y8 }, this.getIconColor(DomainName.HOME), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.MONEY)}>{iconForDomain(DomainName.MONEY, {backgroundColor: 'transparent', position:'absolute', left: this.state.x9, top: this.state.y9 }, this.getIconColor(DomainName.MONEY), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.SPIRITUAL)}>{iconForDomain(DomainName.SPIRITUAL, {backgroundColor: 'transparent', position:'absolute', left: this.state.x10, top: this.state.y10 }, this.getIconColor(DomainName.SPIRITUAL), this.symbolSize, this.symbolSize )}</TouchableOpacity>

       <TouchableOpacity  onPress={this.onIconTap(DomainName.RELATIONSHIPS)}>{iconForDomain(DomainName.RELATIONSHIPS, {backgroundColor: 'transparent', position:'absolute', left: this.state.x11, top: this.state.y11 }, this.getIconColor(DomainName.RELATIONSHIPS), this.symbolSize, this.symbolSize )}</TouchableOpacity>
       {this.state.currentCallout &&
        <Animated.View                 
        style={{opacity: this.state.fadeIn}}>
        <View key='callout' style={[styles.callout, {left: this.state.calloutLeft, top: this.state.calloutTop}]}>
          <Text style={[styles.calloutText]}>{this.state.currentCallout}</Text>
        </View>
      </Animated.View>}
        </View>
      </View>
      // </>
    );
  }
} 

const styles = StyleSheet.create({ 
  callout: {
    position: 'absolute',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 5,
    padding: 4,
    zIndex: 999,
    backgroundColor: 'white',
  },
  calloutText: {
    color: TextStyles.p2.color,
    fontSize: TextStyles.p2.fontSize,
    fontFamily: mainFontMedium,
    lineHeight: TextStyles.p2.lineHeight,
    fontWeight: '500',
  }
  });
  
