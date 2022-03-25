import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, StyleSheet, TouchableOpacity, Button, StyleProp, ViewStyle } from 'react-native';
import Layout from '../../constants/Layout';
import TextStyles from '../../styles/TextStyles';
import Images from '../../constants/images';
import ResourceViewModel from '../../viewModels/ResourceViewModel';
import { Theme } from '../../constants/theme/PStheme'
import { Resource, ResourceType } from 'src/constants/Resource';

type Props = {
  item: Resource,
  backgroundColor: string,
  isFavorite: boolean,
  onPress: () => void,
  onHeart: () => void,
  onClose: () => void,
  theme: Theme,
};

const CardHeight = Layout.isSmallDevice ? 174 * 0.9 : 208 * 0.9; // 174 and 208 are constants set by Maslo and used in home.tsx and placeholder.tsx

const ResourceCard = (props: Props) => {
  const { item, backgroundColor, isFavorite, onPress, onHeart, onClose, theme } = props;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.card, { backgroundColor: backgroundColor }]}>
        {/* Top Group */}
        <View style={styles.topGroup}>
          {/* Type Label */}
          <Text style={[styles.categoryText, TextStyles.labelMedium, { color: theme.colors.background }]}>
            {item.type}
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
          {iconForResourceType(item.type, { alignSelf: 'center' })}
          <Text style={[Layout.isSmallDevice ? TextStyles.p3 : TextStyles.p1, { paddingLeft: 10, flexWrap: 'wrap', flex: 1, color: theme.colors.background }]}>
            {item.title}
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
    borderRadius: 5,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginBottom: 15,
    width: '100%',
    // height: CardHeight,
    marginRight: 10,
  },
  topGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconGroup: {
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  categoryText: {
    display: 'flex',
  },
});

export default observer(ResourceCard);
