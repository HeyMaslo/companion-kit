import React from 'react';
import { createLogger } from 'common/logger';
import { Stats as StatsFunctions, AI as AIFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';
import { Page, Container, View } from 'app/common/components';
import TabsComponent from 'app/components/Tabs';
import TabsViewModel from 'app/viewModels/components/TabsViewModel';

import { RawQueryFetcher } from './RawQueryFetcher';
import { Analytics as AnalyticsTab } from './Analytics';

import StatsTypes = StatsFunctions.StatsTypes;
import { ClientEntryIded, RecordAnalyzeState } from 'common/models';

const logger = createLogger('[StatsPlayground]');

type State = {
    type: StatsTypes,
    progress: number,
    total: number,
    errors: number,
    entries: StatsFunctions.StatsTypes.FailedRecords.Result | StatsFunctions.StatsTypes.UpdateEntriesIds.Result,
    rawResult: any,
    filesMeta: StatsFunctions.StatsTypes.FilesMetadata.Result,
};

const formatDate = (d: number) => d ? new Date(d).toUTCString() : '???';

export default class AdminPage extends React.Component<{}, State> {

    state: State = {
        type: StatsTypes.UpdateEntriesIds,
        entries: null,
        progress: null,
        total: null,
        errors: 0,
        rawResult: null,
        filesMeta: null,
    };

    private _tabs = new TabsViewModel();

    private async loadPayinCoaches() {
        const results = await Firebase.Instance.getFunction(StatsFunctions.GetPayingCoaches)
            .execute({ type: StatsTypes.PayingCoaches });

        logger.log('loadPayinCoaches', results);
    }

    private async updateFilesMetadata() {
        this.setState({
            filesMeta: {
                type: StatsTypes.FilesMetadata,
                sessions: [],
            },
        });

        logger.log('updateFilesMetadata before');

        const results = await Firebase.Instance.getFunction(StatsFunctions.UpdateFilesMetadata)
            .execute({
                type: StatsTypes.FilesMetadata,
            });

        logger.log('updateFilesMetadata', results);

        this.setState({
            filesMeta: results,
        });
    }

    private async upgradeEntriesIds() {

        const periodLength = 7;
        const backDays = 0;

        this.setState({
            entries: {
                type: StatsTypes.UpdateEntriesIds,
                journals: [],
                sessions: [],
            },
            progress: 5,
            total: 10,
        });

        const results = await Firebase.Instance.getFunction(StatsFunctions.UpdgradeEntriesIds)
            .execute({
                type: StatsTypes.UpdateEntriesIds,
                back: backDays,
                periodDays: periodLength,
            });

        logger.log('upgradeEntriesIds', results);

        // results.journals = results.journals.filter(j => !j.audioMeta || j.audioMeta.duration < 900);
        // results.sessions = [];

        this.setState({
            entries: results,
            progress: null,
            total: null,
        });
    }

    private async loadFailedEntries(deleteRecords = false) {
        this.setState({
            progress: 5,
            total: 10,
        });

        const periodLength = 21;
        const backDays = 49;

        const start = new Date();
        start.setUTCDate(start.getUTCDate() - backDays - periodLength);

        const end = new Date();
        end.setUTCDate(end.getUTCDate() - backDays);

        const results = await Firebase.Instance.getFunction(StatsFunctions.GetFailedEntries)
            .execute({
                type: StatsTypes.FailedRecords,
                startMs: start.getTime(),
                endMs: end.getTime(),
                deleteRecords: deleteRecords,
            });

        logger.log('loadFailedEntries', results);

        const filterLong = (e: ClientEntryIded) => !e.audioMeta || !e.audioMeta.duration || e.audioMeta.duration < 1000;

        results.journals = results.journals.filter(j => filterLong(j));
        results.sessions = results.sessions.filter(s => filterLong(s));
        // results.sessions = [];

        this.setState({
            entries: results,
            progress: null,
            total: null,
        });
    }

    private async processFailedEntries() {
        if (!this.state.entries) {
            return;
        }

        const process = Firebase.Instance.getFunction(AIFunctions.ProcessAudioEntry);

        this.setState({
            total: this.state.entries.journals.length + this.state.entries.sessions.length,
            progress: 0,
            errors: 0,
        });

        const processEntry = (e: ClientEntryIded, type: 'journal' | 'session') => process.execute({ type, entryId: e.id, accountId: e.clientCardId, clientUid: e.clientUid })
            .then(r => {
                if (r.state === RecordAnalyzeState.Finished) {
                    this.setState({ progress: this.state.progress + 1 });
                } else {
                    throw new Error('not success');
                }
                return r;
            })
            .catch(() => this.setState({ errors: this.state.errors + 1 }));

        await Promise.all([
            ...this.state.entries.journals.map(j => processEntry(j, 'journal')),
            ...this.state.entries.sessions.map(s => processEntry(s, 'session')),
        ]);
    }

    setPassword = (value: string) => {
        this.setState({ });
    }

    render(): any {
        return (
            <Page className="admin-page">
                <Container>

                    {this.state.progress != null && this.state.total && (
                        <View>
                            Progress {this.state.progress} / {this.state.total} === { Math.round(100 * this.state.progress / this.state.total)}%
                        </View>
                    )}
                    { !!this.state.errors && (
                        <View className="statsOutput">
                            Errors: {this.state.errors}
                        </View>
                    )}

                    <TabsComponent
                        model={this._tabs}
                        links={[
                            {
                                title: 'SQL QUERY',
                                callback: (() => this._tabs.selectedIndex = 0),
                            },
                            {
                                title: 'ANALYTICS',
                                callback: (() => this._tabs.selectedIndex = 1),
                            },
                        ]}
                        tabs={[
                            <RawQueryFetcher />,
                            <AnalyticsTab />,
                        ]}
                    />

                    {this.renderFailedJournals(this.state.entries && this.state.entries.journals, 'JOURNALS')}
                    {this.renderFailedJournals(this.state.entries && this.state.entries.sessions, 'SESSIONS')}

                </Container>
            </Page>
        );
    }

    renderFailedJournals(entries: ClientEntryIded[], label: string) {
        if (!entries || !entries.length) {
            return null;
        }

        return (
            <View>
                <h5 style={{ fontSize: 35 }}> Missing records for {label}: {entries.length} </h5>
                <table style={{ fontSize: 25 }}>
                    <thead>
                        <tr>
                            <td>#</td>
                            <td>Date</td>
                            <td>ID</td>
                            <td>Client UID</td>
                            <td>Coach UID</td>
                            <td>Client Card ID</td>
                            <td>Audio Meta</td>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((j, i) => (<tr key={j.id}>
                            <td> {i + 1} </td>
                            <td> {formatDate(j.date)} </td>
                            <td> {j.id} </td>
                            <td> {j.clientUid || '?'} </td>
                            <td> {j.coachUid || '?'} </td>
                            <td> {j.clientCardId || '?'} </td>
                            <td> {(j.audioMeta && JSON.stringify(j.audioMeta)) || '?'} </td>
                        </tr>))}
                    </tbody>
                </table>
            </View>
        );
    }
}
