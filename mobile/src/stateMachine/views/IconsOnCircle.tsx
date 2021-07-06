import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';
import Colors from 'src/constants/colors';
import Images from 'src/constants/images';

/**
 * 
 * @param highlightedIndices index 0 is located at 3 o'clock on the circle and continues clockwise from there. eg. 5 is at 8 o'clock
 */
type IconsOnCircleProps = {
  style?: StyleProp<ViewStyle>,
  circleRaius: number,
  symbolSize: number,
  highlightedIndices?: Array<number>,
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
  console.log(obj)
  this.setState({... obj})
}

private getIconColor(index: number): string {
  if (this.props.highlightedIndices.includes(index)) {
    return Colors.typography.h1;
  }
  return Colors.typography.labelMedium;
}
  
  render() {
    return (
      <View style={[this.props.style, { justifyContent:'center', alignItems:'center' }]} onLayout={this.props.onLayout}>
        <View style={{backgroundColor: 'transparent', width: this.size, height: this.size, borderRadius: this.radius, marginTop: this.symbolRadius, marginBottom: this.symbolRadius}}>

       <Images.leisureIcon
       color={this.getIconColor(0)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x0,
          top: this.state.y0}]}
      />

       <Images.physicalIcon
       color={this.getIconColor(1)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x1,
          top: this.state.y1}]}
      />

       <Images.selfEsteemIcon
       color={this.getIconColor(2)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x2,
          top: this.state.y2}]}
      />

       <Images.sleepIcon
       color={this.getIconColor(3)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x3,
          top: this.state.y3}]}
      />

      <Images.moneyIcon
       color={this.getIconColor(4)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
            left: this.state.x4,
            top: this.state.y4,
            width: this.symbolSize,
            height: this.symbolSize}]}
      />

      <Images.physicalIcon
      color={this.getIconColor(5)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x5,
          top: this.state.y5}]}
      />

       <Images.sleepIcon
       color={this.getIconColor(6)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x6,
          top: this.state.y6}]}
      />

       <Images.moneyIcon
       color={this.getIconColor(7)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x7,
          top: this.state.y7}]}
      />

      <Images.leisureIcon
      color={this.getIconColor(8)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x8,
          top: this.state.y8}]}
      />

       <Images.selfEsteemIcon
       color={this.getIconColor(9)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x9,
          top: this.state.y9}]}
      />

       <Images.moneyIcon
       color={this.getIconColor(10)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x10,
          top: this.state.y10}]}
      />

        <Images.sleepIcon
        color={this.getIconColor(11)}
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x11,
          top: this.state.y11}]}
      />
      
    </View>
      </View>
    );
  }
} 

const styles = StyleSheet.create({
  icon: {
    position:'absolute',
  },
});
