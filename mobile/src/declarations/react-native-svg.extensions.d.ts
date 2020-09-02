import * as SVG from 'react-native-svg';

declare module 'react-native-svg' {
    export interface ClipPathProps {
        clipRule: string;
    }
}
