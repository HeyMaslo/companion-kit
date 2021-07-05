import { SvgProps } from 'react-native-svg';

import Moods from 'common/models/Moods';
import Images from 'src/constants/images';

export const MoodImages: { [mood: number]: React.ComponentClass<SvgProps> } = {
    [Moods.Rough]: Images.roughIcon,
    [Moods.Difficult]: Images.difficultIcon,
    [Moods.Mixed]: Images.mixedIcon,
    [Moods.Positive]: Images.positiveIcon,
    [Moods.VeryPositive]: Images.veryPositiveIcon,
};
