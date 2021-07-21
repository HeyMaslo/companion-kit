import React from 'react';
import { Svg, Path } from 'react-native-svg';
import { ViewStyle } from 'react-native';

export type coord = [number, number]

export type CubicBezierCurveProps = {
  style: ViewStyle[];
  viewBox: string;
  startPoint: coord;
  controlPointFirst: coord;
  controlPointSecond: coord;
  endPoint: coord;
  strokeColor: string;
}

export default class CubicBezierCurve extends React.Component<CubicBezierCurveProps> {

render() {
  return (
    <>
  <Svg
    viewBox={this.props.viewBox}
    style={this.props.style}
  >
    <Path
    d={`
      M ${this.props.startPoint}
      C ${this.props.controlPointFirst} ${this.props.controlPointSecond} ${this.props.endPoint}
    `}
    fill='none'
    stroke={this.props.strokeColor}
    strokeWidth={5}
  />
  </Svg>
  </>
);
}

}