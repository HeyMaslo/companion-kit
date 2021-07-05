declare module window {
    export const navigator: { sendBeacon?: any } = null;

    export const addEventListener = null;
    export const removeEventListener = null;
}

declare function alert(message: string);
