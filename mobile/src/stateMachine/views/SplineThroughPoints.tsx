import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';
import { ViewStyle } from 'react-native';
import { View } from 'react-native-animatable';

export type cartesianCoordinate = [number, number]

export type SplineThroughPointsProps = {
  style: ViewStyle[];
  viewBox: string;
  controlPoints: cartesianCoordinate[];
  strokeColor: string;
  strokeWidth: number,
}

export default class SplineThroughPoints extends React.Component<SplineThroughPointsProps> {

  private vertices: cartesianCoordinate[] = [];
  private pathDetails: string[] = [];

  render() {
    this.vertices = this.props.controlPoints;
    this.updateSplines();

    return (
      <View style={this.props.style}>
        <Svg
          viewBox={this.props.viewBox}
          style={[{ backgroundColor: 'transparent' }]}>
          {this.pathDetails.map((str) => {
            return <Path d={str} fill={'none'} stroke={this.props.strokeColor} strokeWidth={this.props.strokeWidth} />
          })}
        </Svg>
      </View>
    );
  }

  // Adapted from: 
  /* bezier-spline.js
   *
   * computes cubic bezier coefficients to generate a smooth
   * line through specified points. couples with SVG graphics 
   * for interactive processing.
   *
   * For more info see:
   * http://www.particleincell.com/2012/bezier-splines/ 
   *
   * Lubos Brieda, Particle In Cell Consulting LLC, 2012
   * you may freely use this algorithm in your codes however where feasible
   * please include a link/reference to the source article
   */

  private updateSplines() {
    /*grab (x,y) coordinates of the control points*/
    let x: number[] = [];
    let y: number[] = [];

    for (let i = 0; i < this.vertices.length; i++) {
      x[i] = this.vertices[i][0];
      y[i] = this.vertices[i][1];
    }

    /*computes control points p1 and p2 for x and y direction*/
    let px = this.computeControlPoints(x);
    let py = this.computeControlPoints(y);

    /*updates path settings*/
    for (let j = 0; j < this.vertices.length - 1; j++) {
      this.pathDetails[j] = this.path(x[j], y[j], px.p1[j], py.p1[j], px.p2[j], py.p2[j], x[j + 1], y[j + 1]);
    }
    console.log(this.pathDetails)
  }

  /*creates formated path string for SVG cubic path element*/
  private path(x1: number, y1: number, px1: number, py1: number, px2: number, py2: number, x2: number, y2: number): string {
    return 'M ' + x1 + ' ' + y1 + ' C ' + px1 + ' ' + py1 + ' ' + px2 + ' ' + py2 + ' ' + x2 + ' ' + y2;
  }

  /*computes control points given knots, this is the brain of the operation*/
  private computeControlPoints(knots: number[]): { p1: number[], p2: number[] } {
    let p1: number[] = [];
    let p2: number[] = [];
    let n = knots.length - 1;

    /*rhs vector*/
    let a: number[] = [];
    let b: number[] = [];
    let c: number[] = [];
    let r: number[] = [];

    /*left most segment*/
    a[0] = 0;
    b[0] = 2;
    c[0] = 1;
    r[0] = knots[0] + 2 * knots[1];

    /*internal segments*/
    for (let i = 1; i < n - 1; i++) {
      a[i] = 1;
      b[i] = 4;
      c[i] = 1;
      r[i] = 4 * knots[i] + 2 * knots[i + 1];
    }

    /*right segment*/
    a[n - 1] = 2;
    b[n - 1] = 7;
    c[n - 1] = 0;
    r[n - 1] = 8 * knots[n - 1] + knots[n];

    /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
    for (let i = 1; i < n; i++) {
      let m = a[i] / b[i - 1];
      b[i] = b[i] - m * c[i - 1];
      r[i] = r[i] - m * r[i - 1];
    }

    p1[n - 1] = r[n - 1] / b[n - 1];
    for (let i = n - 2; i >= 0; --i)
      p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];

    /*we have p1, now compute p2*/
    for (let i = 0; i < n - 1; i++)
      p2[i] = 2 * knots[i + 1] - p1[i + 1];

    p2[n - 1] = 0.5 * (knots[n] + p1[n - 1]);

    return { p1: p1, p2: p2 };
  }

  /*creates and adds an SVG circle to represent knots*/
  // private createKnot(x,y)
  // {
  // 	var C=<Circle r={22} cx={x} cy={y} fill={'gold'} stroke={this.props.strokeColor} strokeWidth={6}/>
  // 	this.svg.push(C);
  // 	return C
  // }

}