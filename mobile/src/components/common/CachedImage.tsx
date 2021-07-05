// based on https://github.com/lane-c-wagner/react-native-expo-cached-image

import React, { PropsWithChildren } from 'react';
import {
    Image,
    ImageBackground,
    ImageProps,
    ImageURISource,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export type CachedImageProps = PropsWithChildren<
    ImageProps & {
        isBackground?: boolean;
    }
>;

async function getImageFilesystemKey(this: void, remoteURI: string) {
    const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        remoteURI,
    );

    return `${FileSystem.cacheDirectory}${hashed}`;
}

export function CachedImage(this: void, props: CachedImageProps) {
    const [imgURI, setImgURI] = React.useState('');
    const state = React.useMemo(() => ({ loading: false, mounted: false }), []);

    const safeCall = React.useCallback(
        (cb: () => any) => {
            if (state.mounted) {
                cb();
            }
        },
        [state],
    );

    const loadImage = async (filesystemURI: string, remoteURI: string) => {
        try {
            // Use the cached image if it exists
            const metadata = await FileSystem.getInfoAsync(filesystemURI);
            if (metadata.exists) {
                safeCall(() => setImgURI(filesystemURI));
                return;
            }

            // otherwise download to cache
            const imageObject = await FileSystem.downloadAsync(
                remoteURI,
                filesystemURI,
            );
            safeCall(() => setImgURI(imageObject.uri));
        } catch (err) {
            console.log('Image loading error:', err);
            safeCall(() => setImgURI(remoteURI));
        }
    };

    React.useEffect(() => {
        state.mounted = true;

        (async () => {
            const uri = (props.source as ImageURISource).uri;
            if (uri) {
                const filesystemURI = await getImageFilesystemKey(uri);
                if (imgURI !== uri && imgURI !== filesystemURI) {
                    await loadImage(filesystemURI, uri);
                }
            }
        })();

        return () => {
            state.mounted = false;
        };
    }, [(props.source as ImageURISource).uri]);

    let source: ImageProps['source'] = imgURI ? { uri: imgURI } : null;
    if (!source && props.source) {
        source = props.source;
    }

    if (props.isBackground) {
        return (
            <ImageBackground {...props} source={source}>
                {props.children}
            </ImageBackground>
        );
    } else {
        return <Image {...props} source={source} />;
    }
}
