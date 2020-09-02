import React from 'react';
import { View, Text, Tooltip } from 'app/common/components';
import PercentChart from 'app/components/PercentChart';

// const pathes = [
//     // tslint:disable-next-line: max-line-length
//     'M371.797 161V32.1574C206.613 -51.2424 171.558 50.6661 0.000213623 38.8599V161C0.000213623 163.761 2.2388 166 5.00021 166H366.797C369.559 166 371.797 163.761 371.797 161Z',
//     // tslint:disable-next-line: max-line-length
//     'M371.797 181V32.1574C160.613 -51.2424 81.558 50.6661 0.000213623 18.8599V161C0.000213623 163.761 2.2388 166 5.00021 166H366.797C369.559 166 371.797 163.761 371.797 161Z',
//     // tslint:disable-next-line: max-line-length
//     'M371.797 181V32.1574C220.613 -51.2424 111.558 50.6661 0.000213623 28.8599V161C0.000213623 163.761 2.2388 166 5.00021 166H366.797C369.559 166 371.797 163.761 371.797 161Z',
// ];

const pathes = [
    [
        // tslint:disable-next-line: max-line-length
        'M0 195V15.2241C133 -48.6671 154.5 112.542 371.797 60.0648V195C371.797 197.761 369.559 200 366.797 200H5C2.23858 200 0 197.761 0 195Z',
        // tslint:disable-next-line: max-line-length
        'M0 195V34.857C135.5 -24.2906 152.5 -3.23806 371.797 61.037V195C371.797 197.761 369.559 200 366.797 200H5C2.23858 200 0 197.761 0 195Z',
        // tslint:disable-next-line: max-line-length
        'M0 195V52.5767C173.5 -18.2773 193.5 -16.7698 371.797 52.5767V195C371.797 197.761 369.559 200 366.797 200H5C2.23858 200 0 197.761 0 195Z',
        // tslint:disable-next-line: max-line-length
        'M0 195V57.5807C200 32.8951 235.5 -24.5356 371.797 11.6479V195C371.797 197.761 369.559 200 366.797 200H5C2.23858 200 0 197.761 0 195Z',
        // tslint:disable-next-line: max-line-length
        'M0 195V67.378C196.5 67.378 273.5 -40.3919 371.797 16.6628V195C371.797 197.761 369.559 200 366.797 200H5C2.23858 200 0 197.761 0 195Z',
    ],
    [
        // tslint:disable-next-line: max-line-length
        'M371.797 195.796L371.797 81.6299C183.5 45.6266 170.5 -40.5784 -0.000274658 24.2973V195.796C-0.000274658 198.557 2.23828 200.796 4.99973 200.796H366.797C369.558 200.796 371.797 198.557 371.797 195.796Z',
        // tslint:disable-next-line: max-line-length
        'M371.797 195L371.797 71.9831C226.5 32.042 199.5 -40.6714 -0.000274658 28.9696V195C-0.000274658 197.761 2.23828 200 4.99973 200H366.797C369.558 200 371.797 197.761 371.797 195Z',
        // tslint:disable-next-line: max-line-length
        'M371.797 195L371.797 46.5691C202.5 -16.0351 175.5 -15.0088 -0.000274658 46.5691V195C-0.000274658 197.761 2.23828 200 4.99973 200H366.797C369.558 200 371.797 197.761 371.797 195Z',
        // tslint:disable-next-line: max-line-length
        'M371.796 195L371.797 30.4148C191 -39.4752 149 27.3312 -0.00109863 68.9568V195C-0.00109863 197.761 2.23746 200 4.9989 200H366.796C369.557 200 371.796 197.761 371.796 195Z',
        // tslint:disable-next-line: max-line-length
        'M371.797 195L371.797 25.9685C193 -44.9208 171.558 48.1572 -0.000274658 81.9567V195C-0.000274658 197.761 2.23828 200 4.99973 200H366.797C369.558 200 371.797 197.761 371.797 195Z',
    ],
];

export type Props = {
    value: number;
    loop: number;
    color: string;
    label: string;
    tooltipTitle?: string;
    tooltipMessage?: string;
};

export function ResilienceMeter(props: Props) {
    return (
        <View className="percent-wrap">
            <PercentChart value={props.value} loopDuration={props.loop} color={props.color} pathes={pathes} />
            <View className="label-wrap">
                <Text className="label-tag type1">{props.label}</Text>
                { props.tooltipMessage &&
                    <Tooltip direction="left" title={props.tooltipTitle} message={props.tooltipMessage} />
                }
            </View>
        </View>
    );
}