import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, StyleSheet, TouchableOpacity, Button, StyleProp, ViewStyle } from 'react-native';
import Layout from '../../constants/Layout';
import TextStyles from '../../styles/TextStyles';
import Images from '../../constants/images';
import ResourceViewModel, { ResourceType } from '../../viewModels/ResourceViewModel';
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

          {/* Heart and X Icon */}
          <View style={styles.iconGroup}>
            <TouchableOpacity onPress={onHeart}>
              <Images.heartIcon width={23} height={20} fill={isFavorite ? 'white' : 'none'} color={'white'} opacity={0.7} style={{ marginRight: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose}>
              <Images.closeIcon width={20} height={20} color={'white'} opacity={0.7} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Icon and title */}
        <View style={styles.iconGroup}>
          {iconForResourceType(category)}
          <Text style={[styles.titleText, Layout.isSmallDevice ? TextStyles.p3 : TextStyles.p1, { color: theme.colors.background }]}>
            {title}
          </Text>
        </View>

      </View>
    </TouchableOpacity>
  );
};

function iconForResourceType(type: ResourceType, style?: StyleProp<ViewStyle>, color: string = 'black'): JSX.Element {

  switch (type) {

    case ResourceType.APP:
      return <Images.App pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.ARTICLE:
      return <Images.Arcticle pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.BLOG:
      return <Images.Blog pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.OTHER:
      return <Images.Other pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.VIDEO:
      return <Images.Video pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.WEBINAR:
      return <Images.Webinar pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.WORKSHEET:
      return <Images.Webinar pointerEvents={'none'} color={color} style={style} />;
    case ResourceType.YOUTUBECHANNEL:
      return <Images.YoutubeChannel pointerEvents={'none'} color={color} style={style} />;
  }
}

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
