import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Linking, Platform } from 'react-native';
import Layout from '../../constants/Layout';
import TextStyles from '../../styles/TextStyles';
import Images from '../../constants/images';
import { Theme } from '../../constants/theme/PStheme'
import { Resource, ResourceType } from 'src/constants/Resource';
import { Button } from 'src/components';
import { shade } from 'src/helpers/ColorHelper';

type Props = {
  item: Resource,
  backgroundColor: string,
  isFavorite: boolean,
  onHeart: (slug: string) => void,
  onX: (slug: string) => void,
  theme: Theme,
};

const CardHeight = Layout.isSmallDevice ? 174 * 0.9 : 208 * 0.9; // 174 and 208 are constants set by Maslo and used in home.tsx and placeholder.tsx

const ResourceCard = (props: Props) => {

  const [isExpaneded, setIsExpaneded] = useState(false);

  const { item, backgroundColor, isFavorite, onHeart, onX, theme } = props;

  const url = !item.link ? (Platform.OS == 'ios' ? item.iosLink : item.androidLink) : item.link;

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: backgroundColor }]} onPress={() => setIsExpaneded(!isExpaneded)}>
      <View style={[styles.inner]}>
        {/* Top Group */}
        <View style={styles.topGroup}>
          {/* Type Label */}
          <Text style={[styles.categoryText, TextStyles.labelMedium, { color: theme.colors.background }]}>
            {item.type}
          </Text>
          {/* Heart and X Icon */}
          <View style={[styles.iconGroup, { width: 85 }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => onHeart(item.slug)}>
              <Images.heartIcon width={24} height={20} fill={isFavorite ? 'white' : 'none'} color={'white'} opacity={0.7} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => onX(item.slug)}>
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

      {/* Expanded */}
      {isExpaneded &&
        <View style={{ backgroundColor: 'white' }}>
          <View style={[styles.inner, styles.expanded, { backgroundColor: backgroundColor + '4D', borderColor: backgroundColor, }]}>
            {/* Content Warning */}
            {item.warningText != '' &&
              <View style={{ width: '100%', padding: 5, borderColor: theme.colors.foreground, borderRadius: 5, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', flex: 1, marginBottom: 15 }}>
                <Images.WarningTriangle style={{ flex: 0.1 }} />
                <Text style={{ ...TextStyles.labelMedium, color: theme.colors.foreground, flex: 0.82 }}>THIS RESOURCE MAY CONTAIN A CONTENT WARNING OF CONTENT</Text>
              </View>
            }
            {/* Summary */}
            <Text style={{ width: '100%', marginBottom: 15 }}>{item.summary}</Text>
            {/* View Resource Button */}
            <Button title={'View this resource'} onPress={() => Linking.openURL(url)} underlayColor={shade(backgroundColor, 20)} style={{ backgroundColor: backgroundColor, width: '75%', height: 40, }} titleStyles={{ color: 'white' }} theme={theme} />
          </View>
        </View>
      }
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
    default:
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
    marginBottom: 15,
    width: '100%',
    // height: CardHeight,
    marginRight: 10,
  },
  inner: {
    paddingHorizontal: 22,
    paddingVertical: 18
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
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryText: {
    display: 'flex',
  },
  expanded: {
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderWidth: 1
  }
});

export default observer(ResourceCard);
