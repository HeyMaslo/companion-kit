import Moods from 'common/models/Moods';
import ProjectImages from 'app/helpers/images';

import DepressedIcon from 'assets/img/depressed.svg';
import SadIcon from 'assets/img/sad.svg';
import CalmIcon from 'assets/img/neutral.svg';
import HappyIcon from 'assets/img/happy.svg';
import ExcitedIcon from 'assets/img/excited.svg';

export const MoodImages: { [mood: number]: string } = {
    [Moods.Rough]: ProjectImages.depressedIcon,
    [Moods.Difficult]: ProjectImages.sadIcon,
    [Moods.Mixed]: ProjectImages.neutralIcon,
    [Moods.Positive]: ProjectImages.happyIcon,
    [Moods.VeryPositive]: ProjectImages.excitedIcon,
};