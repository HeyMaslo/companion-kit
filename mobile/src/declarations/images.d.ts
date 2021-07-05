declare module '*.svg' {
    import { SvgProps } from 'react-native-svg';
    const content: React.ComponentClass<SvgProps, any>;
    export = content;
}

declare module '*.png' {
    const img: ImageSourcePropType;
    export = img;
}

declare module '*.ttf' {
    const data: any;
    export = data;
}
