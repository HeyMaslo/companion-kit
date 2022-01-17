import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import Layout from '../../constants/Layout';
import TextStyles from '../../styles/TextStyles';
import Images from '../../constants/images';
import ResourceViewModel from '../../viewModels/ResourceViewModel';
import { Theme } from '../../constants/theme/PStheme'

type Props = {
  model: ResourceViewModel,
  active: boolean,
  onPress: () => void,
  onHeart: () => void,
  onClose: () => void,
  theme: Theme,
};

const CardHeight = Layout.isSmallDevice ? 174 * 0.9 : 208 * 0.9; // 174 and 208 are constants set by Maslo and used in home.tsx and placeholder.tsx

const ResourceCard = (props: Props) => {
  const { theme, onPress, onHeart, onClose } = props;
  const { title, category, backgroundColor, isFavorite } = props.model;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.card, { backgroundColor: backgroundColor }]}>
        <View style={styles.topGroup}>
          <Text style={[styles.categoryText, TextStyles.labelMedium, { color: theme.colors.background }]}>
            {category}
          </Text>
          <View>
            <View style={styles.iconGroup}>
              <TouchableOpacity onPress={onHeart}>
                <Images.heartIcon width={23} height={20} fill={isFavorite ? 'white' : 'none'} color={'white'} opacity={0.7} style={{ marginRight: 20 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Images.closeIcon width={20} height={20} color={'white'} opacity={0.7} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={[styles.titleText, Layout.isSmallDevice ? TextStyles.p3 : TextStyles.p1, { color: theme.colors.background }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    borderRadius: 5,
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: Layout.window.width - 60,
    height: CardHeight,
    marginRight: 10,
  },
  topGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    marginTop: 20,
  },
  categoryText: {
    display: 'flex',
  },
});

export default observer(ResourceCard);
