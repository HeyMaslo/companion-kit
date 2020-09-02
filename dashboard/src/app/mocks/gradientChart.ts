import { ChartData } from 'common/viewModels/charts/GradientChartViewModel';
import Moods from 'common/models/Moods';

const gradientBgEmpty = 'rgba(65, 54, 124, 0)';

const defaultTitle = Moods.getTitle(Moods.VeryPositive);

export const noData: ChartData = [
    { value: 1, color: gradientBgEmpty, date: 'SUN', extra: false, title: defaultTitle },
    { value: 1, color: gradientBgEmpty, date: 'MON', extra: false, title: defaultTitle },
    { value: 1, color: gradientBgEmpty, date: 'TUE', extra: false, title: defaultTitle },
    { value: 1, color: gradientBgEmpty, date: 'WED', extra: false, title: defaultTitle },
    { value: 1, color: gradientBgEmpty, date: 'THU', extra: false, title: defaultTitle },
    { value: 1, color: gradientBgEmpty, date: 'FRI', extra: false, title: defaultTitle },
    { value: 1, color: gradientBgEmpty, date: 'SAT', extra: false, title: defaultTitle },
];
