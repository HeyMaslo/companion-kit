import { DisplayStrategyIded } from '../../../mobile/src/constants/Strategy';
import React from 'react';
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Images from 'src/constants/images';
import TextStyles from 'src/styles/TextStyles';
import Colors from '../constants/colors/Colors';

const { width } = Dimensions.get('window');

interface IStrategyCardProps {
    item: DisplayStrategyIded;
    onLearnMorePress: (strategyId: string) => void;
    onSelectStrategy?: (strategyId: string) => void;
    hideCheckbox?: boolean;
}

export default class StrategyCard extends React.Component<IStrategyCardProps> {
    constructor(props) {
        super(props);
    }

    private iconForDomain(d: string): JSX.Element {
        switch (d.toLowerCase()) {
            case 'sleep':
                return (
                    <View key={d} style={styles.icon}>
                        <Images.sleepIcon width={20} height={20} />
                    </View>
                );
            case 'physical':
                return (
                    <View key={d} style={styles.icon}>
                        <Images.physicalIcon width={20} height={20} />
                    </View>
                );
            case 'mood':
                return (
                    <View key={d} style={styles.icon}>
                        <Images.selfEsteemIcon width={20} height={20} />
                    </View>
                );
            case 'cognition':
                return (
                    <View key={d} style={styles.icon}>
                        <Images.leisureIcon width={20} height={20} />
                    </View>
                );
        }
    }

    render() {
        return (
            <Pressable
                onPress={() => this.props.onSelectStrategy(this.props.item.id)}
                disabled={this.props.hideCheckbox}>
                <View style={styles.listItem}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <Text
                            style={[
                                TextStyles.p1,
                                {
                                    display: 'flex',
                                    maxWidth: width - size - 70,
                                },
                            ]}>
                            {this.props.item.title}
                        </Text>
                        {!this.props.hideCheckbox && (
                            <View
                                style={[
                                    styles.checkbox,
                                    this.props.item.isChecked &&
                                        styles.checkboxChecked,
                                    { display: 'flex' },
                                ]}>
                                {this.props.item.isChecked && (
                                    <Images.radioChecked width={8} height={6} />
                                )}
                            </View>
                        )}
                    </View>
                    <Text
                        style={[
                            TextStyles.p2,
                            { paddingLeft: 7, paddingTop: 7 },
                        ]}>
                        {this.props.item.details}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10,
                        }}>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                            }}>
                            {this.props.item.associatedDomainNames.map(
                                (slug) => {
                                    return this.iconForDomain(slug);
                                },
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() =>
                                this.props.onLearnMorePress(this.props.item.id)
                            }>
                            <Text
                                style={{
                                    display: 'flex',
                                    paddingRight: 7,
                                    textAlign: 'right',
                                }}>
                                {'LEARN MORE >'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        );
    }
}

const size = 24;

const styles = StyleSheet.create({
    listItem: {
        borderWidth: 1,
        borderRadius: 7,
        borderColor: '#CBC8CD',
        padding: 10,
        marginBottom: 30,
    },
    checkbox: {
        height: size,
        width: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        flexShrink: 0,
    },
    checkboxChecked: {
        backgroundColor: Colors.radioButton.checkedBg,
        borderWidth: 0,
    },
    icon: {
        display: 'flex',
        marginRight: 5,
        height: 20,
        width: 20,
    },
});
