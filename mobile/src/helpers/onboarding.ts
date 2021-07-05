import { isSame, splitDatesByDay } from 'common/utils/dateHelpers';
import { Presets, Step } from 'src/services/Onboading';

export function getOnboardingStep(index: number): Step {
    if (index == null) {
        return null;
    }

    return Presets[index];
}

export const StepsCount = Presets.length;

export function getDayIndex(journalsHistory: number[]): number {
    if (!journalsHistory || journalsHistory.length === 0) {
        return 0;
    }

    const split = splitDatesByDay(journalsHistory);
    const now = new Date().getTime();

    // If split has array with current day return null, beacuse user has created record today
    for (let i = 0; i < split.length; i++) {
        const splittedArr = split[i];
        const date = splittedArr && splittedArr[0];

        if (date && isSame(date, now, 'day', true)) {
            // user has entry for today – onboarding is disabled
            return null;
        }
    }

    return split.length;
}
