export type FontsSet = {
    'Font-Thin': any;
    'Font-Light': any;
    'Font-Medium': any;
};

const FontsLibrary: () => FontsSet = () => ({
    'Font-Thin': require('./app/Quicksand-Light.ttf'),
    'Font-Light': require('./app/Quicksand-Regular.ttf'),
    'Font-Medium': require('./app/Quicksand-Bold.ttf'),
});

export const ProjectFonts = FontsLibrary();
