import { Platform } from 'react-native';

export type PlatformTypes = typeof Platform.OS;

export type PlatformData<T> = Record<PlatformTypes, T>;
export type PlatformOverride<T> = Partial<PlatformData<T>>;

export function getPlatformOverride<T>(map: PlatformOverride<T>, fallback: T) {
    if (map[Platform.OS] === undefined) {
        return fallback;
    }
    return map[Platform.OS];
}
