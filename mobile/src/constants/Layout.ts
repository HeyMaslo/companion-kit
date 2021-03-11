import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

function getViewWidth(size: number): number {
    return size * (width / 100);
}

function getViewHeight(size: number): number {
    return size * (height / 100);
}

export default {
    window: {
        width,
        height,
    },
    getViewWidth,
    getViewHeight,
    isSmallDevice: width < 340 || height < 650,

    /**
     * Gets two thirds screen height.
     */
    twoThirdsHeight: width / 1.5,

    /**
     * Gets half screen height.
     */
    halfHeight: width / 2,
};
