import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Images from 'src/constants/images';


type IconsOnCircleProps = {
  style: StyleProp<ViewStyle>,
  circleRaius: number,
  symbolSize: number,
}

type CircleState = {
  x1: number,
  y1: number,

  x2: number,
  y2: number,

  x3: number,
  y3: number,

  x4: number,
  y4: number,

  x5: number,
  y5: number,

  x6: number,
  y6: number,

  x7: number,
  y7: number,

  x8: number,
  y8: number,

  x9: number,
  y9: number,

  x10: number,
  y10: number,

  x11: number,
  y11: number,

  x12: number,
  y12: number,
}

// Following adapted from https://stackoverflow.com/a/61118656

export default class IconsOnCircle extends React.Component<IconsOnCircleProps, CircleState> {

  private size;
  private symbolSize;
  private symbolRadius;
  private radius;
  private center;

  constructor(props) {
    super(props);
    this.radius = props.circleRaius;
    this.size = this.radius * 2;
    this.symbolSize = props.symbolSize;
    this.symbolRadius = this.symbolSize / 2;
    this.center = this.radius;


    this.state = {x1: 0, y1: 0, x2: 0, y2: 0, y4: 0, x3: 0, y3: 0, x4: 0, x5: 0, y5: 0, x6: 0, y6: 0, x7: 0, y7: 0, x8: 0, y8: 0, x9: 0, y9: 0, x10: 0, y10: 0, x11: 0, y11: 0, x12: 0, y12: 0}
  }

  componentDidMount() {
    Array.from({length: 12}, (x, i) => i).forEach((index) => {
      this.setupWithIndex(index);
    })
  }

  private degToRad(deg) {
    return deg * Math.PI / 180;
}

  private angleToCoordinates(rad): {x: number, y: number} {
    return {x: this.radius * Math.cos(rad) + this.center - this.symbolRadius, y: this.radius * Math.sin(rad) + this.center - this.symbolRadius};
  }

setupWithIndex(index: number) {
  const angleRad = this.degToRad(index * 360 / 12);
  const {x, y} = this.angleToCoordinates(angleRad);

  const xKey = `x${index + 1}`;
  const yKey = `y${index + 1}`;
  var obj = {};
  obj[xKey] = x;
  obj[yKey] = y;
  console.log(obj)
  this.setState({... obj})
}

  
  render() {
    return (
      <View style={[this.props.style, { flex: 1, justifyContent:'center', alignItems:'center' }]}>
        <View
      style={{backgroundColor: 'transparent',
        width: this.size,
        height: this.size,
        borderRadius: this.radius,
      }}
    >
       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x1,
          top: this.state.y1}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x2,
          top: this.state.y2}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x3,
          top: this.state.y3}]}
      />

      <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
            left: this.state.x4,
            top: this.state.y4,
            width: this.symbolSize,
            height: this.symbolSize}]}
      />

      <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x5,
          top: this.state.y5}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x6,
          top: this.state.y6}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x7,
          top: this.state.y7}]}
      />

      <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x8,
          top: this.state.y8}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x9,
          top: this.state.y9}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x10,
          top: this.state.y10}]}
      />

        <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x11,
          top: this.state.y11}]}
      />

       <Images.moneyIcon
       width={this.symbolSize}
       height={this.symbolSize}
        style={[styles.icon, {
          left: this.state.x12,
          top: this.state.y12}]}
      />
      
    </View>
      </View>
    );
  }
} 

const styles = StyleSheet.create({
  icon: {
    position:'absolute'
  },
});
