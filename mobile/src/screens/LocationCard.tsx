import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Layout from 'src/constants/Layout';
import Locations from 'common/models/Locations';
import Colors from 'src/constants/colors';
import { LocationImages, LocationImagesWhite } from 'src/helpers/Locations';
import TextStyles from 'src/styles/TextStyles';

type CardProps = {
    title: string;
    onPress: () => void;
    active: boolean;
    index: number;
    location: Locations;
};

const small = Layout.isSmallDevice;

export class LocationCardS extends React.Component<CardProps> {
    createStyles = () => {
        const { index } = this.props;
        const top = index < 3;

        const topLayerStyles = {
            bottom: 0,
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
        };
        const bottomLayerStyles = {
            top: 0,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
        };
        const layerStyles: any = top ? topLayerStyles : bottomLayerStyles;
        const borderStyles: any = {
            borderTopWidth: 0,
        };

        if (!top) {
            borderStyles.borderBottomWidth = 0;
        }

        if (index !== 1 && index !== 4) {
            borderStyles.borderLeftWidth = 0;
            borderStyles.borderRightWidth = 0;
        }

        return {
            layerStyles,
            borderStyles,
        };
    };

    render() {
        const { title, onPress, active, location } = this.props;

        const cardStyles = { zIndex: active ? 10 : 1 };
        const style = this.createStyles();

        const Icons = active ? LocationImagesWhite : LocationImages;
        const Icon = Icons[location];

        return (
            <TouchableOpacity
                onPress={onPress}
                style={[styles.card, cardStyles]}>
                {/* BORDERS */}
                <View style={[styles.cardBorder, style.borderStyles]} />

                {/* LAYER */}
                {active && (
                    <View style={[styles.cardLayer, style.layerStyles]} />
                )}

                <View style={styles.cardContent}>
                    <Icon width={28} height={28} />
                    <Text
                        style={[
                            styles.cardTitle,
                            active && {
                                color: Colors.locationCardS.cardTitle.active,
                            },
                        ]}>
                        {title}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export class LocationCardM extends LocationCardS {
    createStyles = () => {
        const { index } = this.props;
        const { width } = Layout.window;
        const left = index % 2 === 0;

        const leftLayerStyles = {
            right: 0,
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
        };
        const rightLayerStyles = {
            left: 0,
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
        };
        const layerStyles = left ? leftLayerStyles : rightLayerStyles;
        const borderStyles: any = {
            borderRightWidth: 0,
        };

        if (left) {
            borderStyles.borderLeftWidth = 0;
        }

        if (index !== 2 && index !== 3) {
            borderStyles.borderTopWidth = 0;
            borderStyles.borderBottomWidth = 0;
        }

        return {
            layerStyles,
            borderStyles,
        };
    };
}

let styles = StyleSheet.create({
    card: {
        height: Layout.getViewWidth(21.875),
        // height: small ? 77 : 95,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexBasis: '33%',
    },
    cardContent: {
        zIndex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        ...TextStyles.labelSmall,
        color: Colors.locationCardS.cardTitle.default,
        textAlign: 'center',
        marginTop: 12,
    },
    cardLayer: {
        width: '101%',
        height: Layout.getViewWidth(24.0625),
        // height: small ? 77 : 95,
        position: 'absolute',
        left: '-0.5%',
        zIndex: 2,
        backgroundColor: Colors.locationCardS.cardLayerBg,
    },
    cardBorder: {
        height: '100%',
        width: '100%',
        borderColor: Colors.borderColor,
        borderWidth: 1,
        position: 'absolute',
        zIndex: 1,
    },
});
