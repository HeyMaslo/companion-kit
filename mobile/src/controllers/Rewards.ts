import { computed } from 'mobx';
import { ClientRewardInfo } from 'common/models';
import Firebase from 'common/services/firebase';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import { findIndexLeast, clamp, clamp01 } from 'common/utils/mathx';
import { getDaysStreak } from 'common/utils/dateHelpers';
import type { ProgressData } from 'src/helpers/progressData';

const EmptyArr: number[] = [];

const checkinsToLevel = [
    1,
    5,
    10,
    20,
    30,
    40,
    55,
    70,
    85,
    100,
    120,
    140,
    160,
    180,
    200,
];

const GRADE_LEVELS_COUNT = 5;

export class RewardsController {
    constructor(
        private readonly _historyGetter: () => number[],
        private readonly _activeAccountGetter: () => string,
    ) {}

    private get history() {
        return this._historyGetter() || EmptyArr;
    }

    get currentCheckInsCount() {
        return this.history?.length || 0;
    }

    @computed
    get level() {
        const index = findIndexLeast(
            this.currentCheckInsCount,
            checkinsToLevel,
        );
        const levelExist = index >= 0;
        return levelExist ? index + 1 : checkinsToLevel.length + 1;
    }

    @computed
    get streak() {
        return getDaysStreak(this.history, true);
    }

    get nextLevelCount() {
        const lvl = this.level - 1; // -1 because it already has +1
        return checkinsToLevel[lvl];
    }

    get grade() {
        const levelIndex = this.level - 1;
        return Math.floor(levelIndex / GRADE_LEVELS_COUNT);
    }

    @computed
    get progress() {
        const pp = this.calculateProgresses();
        // console.log(pp);
        return pp;
    }

    private calculateProgresses() {
        const grade = this.grade;
        const levelOffset = grade * GRADE_LEVELS_COUNT;
        const totalCheckIns = this.currentCheckInsCount;

        const result: Readonly<ProgressData>[] = [];

        for (let i = 0; i < GRADE_LEVELS_COUNT; i++) {
            const index = levelOffset + i;
            const currentMax = checkinsToLevel[index] || 1;
            const prevMax = checkinsToLevel[index - 1] || 0;

            const start = prevMax;
            const end = currentMax;
            const count = end - start;
            const newGradeJustAchieved =
                totalCheckIns === start && index === levelOffset;

            // console.log('totalCheckIns', totalCheckIns, '\n start', '\n end', end, start, '\n index', index, '\n levelOffset', levelOffset, '\n count', count);

            let current: number;

            if (newGradeJustAchieved && totalCheckIns > 0) {
                current = count;

                for (let k = 0; k < GRADE_LEVELS_COUNT; k++) {
                    result.push({
                        current: current,
                        max: count,
                        progress: clamp01(current / count),
                    });
                }

                break;
            }

            if (i > 0 && result[i - 1].progress < 1) {
                // current progress should be 0 if previous level is not completed
                current = 0;
            } else {
                current = clamp(totalCheckIns - start, 0, count);
            }

            result.push({
                current: current,
                max: count,
                progress: clamp01(current / count),
            });
        }

        return result;
    }

    public shareRewardWithCoach = async () => {
        const info: ClientRewardInfo = {
            checkInsCount: this.currentCheckInsCount,
            streakLength: this.streak,
        };

        await Firebase.Instance.getFunction(
            UsersFunctions.ShareRewardWithTherapist,
        ).execute({ accountId: this._activeAccountGetter(), info });
    };
}
