import { computed, toJS } from 'mobx';
import { DateViewModel, ValidatableViewModel } from 'common/viewModels';
import * as Validations from 'common/utils/validation';
import Localization from 'app/services/localization';
import { ClientModel, ResilienceMetrics } from 'app/controllers/ClientModel';
import { calculateAge, startOf, endOf, formatDate, formatToDateTime } from 'common/utils/dateHelpers';
import AppController from 'app/controllers';
import { getMoodData } from 'app/components/InfographicCard';
import LocationStrings from 'common/localization/LocationStrings';
import {
    Moods,
    InterventionTipsStatuses,
    WordReference,
    TipsLabels,
    SpeechRecognition,
    AssessmentType,
    IntakeForms,
    EntityWithStatus,
    IntakeFormTypes,
    GoalStatus,
    InterventionTip,
    StatusWithDate,
} from 'common/models';
import * as ResilienceMetricsHelper from 'common/helpers/metrics';
import Categories, { CATEGORIES } from 'app/constants/categories';
import NamesHelper from 'common/utils/nameHelper';

const ProjectTexts = Localization.Current.DashboardProject;

const DAY_MS = 1000 * 3600 * 24; // ms

const DISABLE_RESILIENCE = true;

export enum ReportPeriod {
    Yesterday = DAY_MS,
    Last7 = 7 * DAY_MS,
    Last14 = 14 * DAY_MS,
    Last30 = 30 * DAY_MS,
    Last60 = 60 * DAY_MS,
}

function createFilter(startDate: number, endDate: number) {
    return (item: { date?: number }) => item.date >= startDate && item.date <= endDate;
}

export class ReportViewModel {

    public readonly dateStart: DateViewModel = new DateViewModel({
        validation: {
            validator: Validations.Validators.notFutureDate,
            errors: Localization.ValidationErrors,
        },
        default: new Date(),
        constraits: {
            max: () => this.dateEnd.value,
        },
    });

    public readonly dateEnd: DateViewModel = new DateViewModel({
        validation: {
            validator: Validations.Validators.notFutureDate,
            errors: Localization.ValidationErrors,
        },
        default: new Date(),
        constraits: {
            min: () => this.dateStart.value,
        },
    });

    constructor(private readonly _clientGetter: () => ClientModel) {
    }

    get model() { return this._clientGetter(); }

    @computed
    get journalCount() {
        return this.model.journal.entries.filter(this.currentFilter)
            .length;
    }

    private get clientName() {
        return NamesHelper.join(this.model.card).displayName;
    }

    // private get clientAge() {
    //     const birthday = this.model.card.birthday;
    //     return birthday ? calculateAge(birthday) : '? y.o.';
    // }

    private async getInterventionsData() {
        if (!AppController.Instance.User.prompts) {
            return null;
        }

        await AppController.Instance.User.prompts.ensureData();

        const library = AppController.Instance.User.prompts.library?.tips;
        const clientPrompts = AppController.Instance.User.prompts?.getClientState(this.model.card.clientId);

        await clientPrompts.ensureData();
        await this.model.journal.ensureData();

        const resultsMap: Record<string, { text: string, statuses: StatusWithDate[] }> = { };

        const addStatus = (tip: InterventionTip, statuses: StatusWithDate[]) => {
            let e = resultsMap[tip.id];
            if (!e) {
                e = {
                    text: tip.text,
                    statuses: [...statuses],
                };
                resultsMap[tip.id] = e;
            } else {
                e.statuses.push(...statuses);
            }
        };

        clientPrompts?.state?.tipsData?.forEach(tip => {
            const intervention = library.find(item => item.id === tip.tipId);
            if (!intervention) {
                return;
            }

            const fullHistory = EntityWithStatus.getFullHistory(tip)
                .filter(this.currentFilter)
                .sort((h1, h2) => h1.date - h2.date);

            if (!fullHistory.length) {
                return;
            }

            addStatus(intervention, fullHistory);
        });

        this.model.journal.entries
            .filter(this.currentFilter)
            .forEach(j => {
                const tips = AppController.Instance.User.prompts.filterInterventions(j.feelings);
                if (!tips?.length) {
                    return;
                }

                tips.forEach(t => {
                    if (resultsMap[t.id]) {
                        // already has some responses – skip it
                        return;
                    }

                    addStatus(t, [{
                        date: j.date,
                        status: null,
                    }]);
                });
            });

        return Object.values(resultsMap);
    }

    private async getCheckInsData() {
        await this.model.journal.ensureData();
        const journals = this.model.journal.entries.filter(this.currentFilter);

        return journals.map(journal => {
            const record = this.model.records.items.find(r => r.entryId === journal.id);
            const sentiment = record?.sentiment?.documentSentiment;
            const words = record ? WordReference.fromEntities(record.entities) : [];
            return {
                question: journal.question,
                location: journal.location,
                date: journal.date,
                mood: Moods.findNearest(journal.mood),
                analyzedMood: sentiment && Moods.fromSentiment(sentiment.score),
                feelings: journal.feelings?.map( feel => TipsLabels.Strings[feel]),
                audioTranscription: record?.transcriptionFull ? SpeechRecognition.merge(record.transcriptionFull) : null,
                transcription: journal.transcription,
                thingsWords: words.filter(word => CATEGORIES[Categories.OTHER].some(tc => word.categories.includes(tc))),
                personWords: words.filter(word => CATEGORIES[Categories.PERSON].some(tc => word.categories.includes(tc))),
                locationWords: words.filter(word => CATEGORIES[Categories.LOCATION].some(tc => word.categories.includes(tc))),
                interventions: toJS(AppController.Instance.User.prompts.filterInterventions(journal.feelings)),
            };
        });
    }

    private async getResilienceMeters() {
        if (DISABLE_RESILIENCE) {
            return null;
        }

        await this.model.journal.ensureData();
        await this.model.records.ensureData();

        const data: ResilienceMetricsHelper.MetricsSourceData = {
            journals: this.model.journal.entries,
            records: this.model.records.items,
            forms: {
                [AssessmentType.phq9]: this.model.assessments?.forms?.PHQ9?.entries,
            },
        };

        const { start, end } = this.currentRange;

        return ResilienceMetricsHelper.getResilienceMeters(data, ResilienceMetrics, start, end);
    }

    private async getAssessments() {
        if (!this.model.assessments) {
            return null;
        }

        await this.model.assessments.ensureData();

        const result: {
            type: AssessmentType,
            date: number,
            score: number,
            recommendation: IntakeFormTypes.Recommendation,
        }[] = [];

        AssessmentType.EnabledTypes.value.forEach(type => {
            this.model.assessments.forms[type]?.entries?.forEach(e => {
                if (!this.currentFilter(e)) {
                    return;
                }

                const formData = IntakeForms[type];
                if (!formData) {
                    return;
                }

                const score = formData.calculateScores(e.answers);
                result.push({
                    type,
                    date: e.date,
                    score,
                    recommendation: formData.scoreToRecommendation(score),
                });
            });
        });

        return result;
    }

    private async getTimeTracking() {
        if (!this.model.timeTracking) {
            return null;
        }

        await this.model.timeTracking.ensureData();

        return this.model.timeTracking.entries
            .filter(this.currentFilter)
            .map(e => ({
                date: e.date,
                duration: e.minutes,
                notes: e.notes,
            }));
    }

    private async getGoals() {
        if (!AppController.Instance.User.prompts ) {
            return null;
        }

        await AppController.Instance.User.prompts.ensureData();

        const library = AppController.Instance.User.prompts.library?.goals;
        const clientPrompts = AppController.Instance.User.prompts.getClientState(this.model.card.clientId);
        await clientPrompts.ensureData();

        return clientPrompts?.state?.goals?.map(goal => {
            const goalType = library.find(item => item.id === goal.goalId)?.text;
            if (!goalType) {
                return null;
            }

            const lastCompleted = EntityWithStatus.getFullHistory(goal)
                .filter(this.currentFilter)
                .sort((h1, h2) => h2.date - h1.date)
                .find(gs => gs.status === GoalStatus.Completed);

            if (!lastCompleted) {
                return null;
            }

            return {
                goal: goalType,
                dateCompleted: lastCompleted.date,
            };
        }).filter(i => i);
    }

    @computed
    private get currentRange() {
        const start = startOf(this.dateStart.value, 'day', true).getTime();
        const end = endOf(this.dateEnd.value, 'day', true).getTime();
        return { start, end };
    }

    @computed
    private get currentFilter() {
        const range = this.currentRange;
        return createFilter(range.start, range.end);
    }

    private async getReportData() {
        if (await ValidatableViewModel.IsSomeInvalid([this.dateStart, this.dateEnd])) {
            return null;
        }

        if (!this.currentRange) {
            return null;
        }

        await this.model.ensureData();

        const [resilience, checkIns, interventions, assessments, timeTracking, goals] = await Promise.all([
            this.getResilienceMeters(),
            this.getCheckInsData(),
            this.getInterventionsData(),
            this.getAssessments(),
            this.getTimeTracking(),
            this.getGoals(),
        ]);

        return {
            resilience,
            checkIns,
            interventions,
            assessments,
            timeTracking,
            goals,
            clientName: this.clientName,
            // clientAge: this.clientAge,
            start: this.currentRange.start,
            end: this.currentRange.end,
        };
    }

    public async getReportDataString(): Promise<string> {
        const src = await this.getReportData();
        if (!src) {
            return null;
        }

        const res: string[] = [
            // header
            src.clientName,
            `${new Date(src.start).toLocaleDateString()} - ${new Date(src.end).toLocaleDateString()}`,
            '',
        ];

        if (src.resilience) {
            res.push(
                '— — — — — — — — — — — — — — — —',
                '',
                'How\'s the client?',
                '',
            );

            if (src.resilience.length) {
                src.resilience.map(resilience => {
                    res.push(`-${resilience.type}: ${getMoodData(resilience.type, resilience.value).text}`);
                });
            } else {
                res.push('Not enough data');
            }
        }

        // CHECK-INS
        res.push(
            '',
            '— — — — — — — — — — — — — — — —',
            '',
            'CHECK-INS',
            '',
        );

        if (src.checkIns?.length) {
            src.checkIns.map((checkIn, i) => {
                const location = checkIn.location && LocationStrings[checkIn.location];
                res.push(
                    `${checkIn.question}`,
                    `${location ? `from ${location} ` : ''}on ${formatToDateTime(checkIn.date)}`,
                    '',
                );
                if (checkIn.mood || checkIn.analyzedMood) {
                    res.push('Mood:');
                }
                if (checkIn.analyzedMood) {
                    res.push(`-${Moods.getTitle(checkIn.analyzedMood)} (analyzed by ${ProjectTexts.projectName})`);
                }
                if (checkIn.mood) {
                    res.push(`-${Moods.getTitle(checkIn.mood)} (selected by client)`);
                }
                if (checkIn.feelings?.length) {
                    res.push(
                        '',
                        'Mood Adjectives:',
                    );
                    checkIn.feelings.forEach(f => {
                        res.push(`- ${f}`);
                    });
                }
                if (checkIn.audioTranscription) {
                    res.push(
                        '',
                        'Audio Transcription:',
                        `${checkIn.audioTranscription}`,
                    );
                }
                if (checkIn.transcription) {
                    res.push(
                        '',
                        'Text:',
                        `${checkIn.transcription}`,
                    );
                }
                if (checkIn.thingsWords?.length) {
                    res.push(
                        '',
                        `Things ${src.clientName} is talking about:`,
                    );
                    checkIn.thingsWords.forEach(thing => {
                        res.push(`- ${thing.value} (${thing.count} times)`);
                    });
                }
                if (checkIn.personWords?.length) {
                    res.push(
                        '',
                        `People ${src.clientName} is talking about:`,
                    );
                    checkIn.personWords.forEach(person => {
                        res.push(`- ${person.value} (${person.count} times)`);
                    });
                }
                if (checkIn.locationWords?.length) {
                    res.push(
                        '',
                        `Places ${src.clientName} is talking about:`,
                    );
                    checkIn.locationWords.forEach(lw => {
                        res.push(`- ${lw.value} (${lw.count} times)`);
                    });
                }
                if (checkIn.interventions?.length) {
                    res.push(
                        '',
                        'Interventions:',
                    );
                    checkIn.interventions.forEach(intervention => {
                        res.push(`- ${intervention.text}`);
                    });
                }

                if (src.checkIns.length - 1 !== i) {
                    res.push(
                        '',
                        '— —',
                        '',
                    );
                }
            });
        } else {
            res.push('No check-ins :(');
        }

        // INTERVENTIONS
        res.push(
            '',
            '— — — — — — — — — — — — — — — —',
            '',
            'INTERVENTIONS',
            '',
        );

        if (src.interventions?.length) {
            src.interventions.map((intervention, i) => {
                res.push(
                    `- Intervention: ${intervention.text}`,
                );

                intervention.statuses.forEach(s => {
                    res.push(
                        '',
                        `- Response: ${InterventionTipsStatuses.Statuses.find(status => status.id === s.status).name}`,
                        `- Time: ${formatToDateTime(s.date)}`,
                    );
                });

                if (src.interventions.length - 1 !== i) {
                    res.push(
                        '',
                        '— —',
                        '',
                        );
                }
            });
        } else {
            res.push('Your client has not yet opened interventions');
        }

        // ASSESSMENTS
        if (src.assessments?.length) {
            res.push(
                '', '— — — — — — — — — — — — — — — —', '',
                'ASSESSMENTS',
                '',
            );

            src.assessments.forEach(a => {
                res.push(
                    `${a.type} on ${formatDate(a.date)}`,
                    `${a.recommendation.title} (Score: ${a.score})`,
                    a.recommendation.action,
                    '',
                );

            });
        }

        // TIME TRACKING
        if (src.timeTracking?.length) {
            res.push(
                '', '— — — — — — — — — — — — — — — —', '',
                'TIME TRACKING',
                '',
            );

            src.timeTracking.forEach(tt => {
                res.push(
                    `${formatDate(tt.date)}, ${tt.duration} mins - ${tt.notes || '<no note>'}`,
                );
            });
        }

        if (src.goals?.length) {
            res.push(
                '', '— — — — — — — — — — — — — — — —', '',
                'GOALS COMPLETED',
                '',
            );

            src.goals.forEach(g => {
                res.push(
                    `${formatDate(g.dateCompleted)} - ${g.goal}`,
                );
            });
        }

        return res.join('\r\n');
    }

    public setPeriod = (period: ReportPeriod) => {
        const now = Date.now();
        const getDate = (p: number) => {
            return new Date(now - p);
        };
        let dateStart: Date = null;

        switch (period) {
            case ReportPeriod.Yesterday:
                dateStart = getDate(ReportPeriod.Yesterday);
                break;
            case ReportPeriod.Last7:
                dateStart = getDate(ReportPeriod.Last7);
                break;
            case ReportPeriod.Last14:
                dateStart = getDate(ReportPeriod.Last14);
                break;
            case ReportPeriod.Last30:
                dateStart = getDate(ReportPeriod.Last30);
                break;
            case ReportPeriod.Last60:
                dateStart = getDate(ReportPeriod.Last60);
                break;
            default:
                break;
        }

        this.dateStart.value = dateStart;
        this.dateEnd.value = new Date(now);
    }

    public reset = () => {
        this.dateStart.reset();
        this.dateEnd.reset();
    }
}
