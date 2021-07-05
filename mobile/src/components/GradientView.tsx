import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from 'src/constants/colors';

interface IGradientViewProps {
    color1?: string;
    color2?: string;
    color3?: string;
    children?: any;
    style?: any;
}

export default class GradientView extends React.Component<IGradientViewProps> {
    render() {
        const { color1, color2, color3, children, style } = this.props;

        const colors =
            color1 && color2
                ? [color1, color2]
                : Colors.gradientView.fallbackColor;

        if (color3) {
            colors.push(color3);
        }

        return (
            <LinearGradient colors={colors} style={style}>
                {children}
            </LinearGradient>
        );
    }
}
