import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
import Colors from 'src/constants/colors';
import { DomainName } from 'src/constants/Domain';
import Images from 'src/constants/images';
import { iconForDomain } from 'src/helpers/DomainHelper';

type IconsOnCircleProps = {
  style?: StyleProp<ViewStyle>,
  circleRaius: number,
  symbolSize: number,
  highlightedDomains?: Array<DomainName>,
  onLayout?: (event: LayoutChangeEvent) => void,
}

type CircleState = {x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, x5: number, y5: number, x6: number, y6: number, x7: number, y7: number, x8: number, y8: number, x9: number, y11:number, y9: number, x10: number, y10: number, x11: number}

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

    this.state = {x0: 0, y0: 0, x1: 0, y1: 0, x2: 0, y2: 0, y4: 0, x3: 0, y3: 0, x4: 0, x5: 0, y5: 0, x6: 0, y6: 0, x7: 0, y7: 0, x8: 0, y8: 0, x9: 0, y9: 0, x10: 0, y10: 0, x11: 0, y11: 0}
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

  render() {
    const style0 = {
      position:'absolute',
      left: this.state.x0,
      top: this.state.y0 }
      
    return (
      <View style={[this.props.style, { justifyContent:'center', alignItems:'center'}]} onLayout={this.props.onLayout}>
        <View style={{backgroundColor: 'transparent', width: this.size, height: this.size, borderRadius: this.radius, marginTop: this.symbolRadius, marginBottom: this.symbolRadius}}>

       {iconForDomain(DomainName.MOOD, { position:'absolute', left: this.state.x0, top: this.state.y0 }, this.getIconColor(DomainName.MOOD), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.PHYSICAL, { position:'absolute', left: this.state.x1, top: this.state.y1 }, this.getIconColor(DomainName.PHYSICAL), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.SLEEP, { position:'absolute', left: this.state.x2, top: this.state.y2 }, this.getIconColor(DomainName.SLEEP), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.THINKING, { position:'absolute', left: this.state.x3, top: this.state.y3 }, this.getIconColor(DomainName.THINKING), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.IDENTITY, { position:'absolute', left: this.state.x4, top: this.state.y4 }, this.getIconColor(DomainName.IDENTITY), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.LEISURE, { position:'absolute', left: this.state.x5, top: this.state.y5 }, this.getIconColor(DomainName.LEISURE), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.INDEPENDENCE, { position:'absolute', left: this.state.x6, top: this.state.y6 }, this.getIconColor(DomainName.INDEPENDENCE), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.SELFESTEEM, { position:'absolute', left: this.state.x7, top: this.state.y7 }, this.getIconColor(DomainName.SELFESTEEM), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.HOME, { position:'absolute', left: this.state.x8, top: this.state.y8 }, this.getIconColor(DomainName.HOME), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.MONEY, { position:'absolute', left: this.state.x9, top: this.state.y9 }, this.getIconColor(DomainName.MONEY), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.SPIRITUAL, { position:'absolute', left: this.state.x10, top: this.state.y10 }, this.getIconColor(DomainName.SPIRITUAL), this.symbolSize, this.symbolSize )}

       {iconForDomain(DomainName.RELATIONSHIPS, { position:'absolute', left: this.state.x11, top: this.state.y11 }, this.getIconColor(DomainName.RELATIONSHIPS), this.symbolSize, this.symbolSize )}
      
    </View>
      </View>
    );
  }
} 
