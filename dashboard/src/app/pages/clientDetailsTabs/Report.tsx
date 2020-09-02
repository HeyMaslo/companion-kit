
import React from 'react';
import { observer } from 'mobx-react';
import { Text, Image, Button, View, Page, TextArea } from 'app/common/components';
import ProjectImages from 'app/helpers/images';
import { ReportViewModel } from 'app/viewModels/ReportViewModel';
import { DatePickerObservable } from 'app/components/DatePicker';
import { ReportPeriod } from 'app/viewModels/ReportViewModel';
import { PushToast } from 'app/viewModels/ToasterViewModel';
import logger from 'common/logger';
import { TextAreaProps } from 'app/common/components/TextArea';

type ReportProps = {
    formModel: ReportViewModel,
};

type State = {
    inProgress: boolean,
    result: string,
};

function markupPrintPage(report: string) {
    return (
        `<html>
            <head>
                <title>Window Print</title>
                <style> body { white-space: pre-line; line-height: normal; color: #170F2E; font-family:Helvetica-Neue, Helvetica, Arial, sans-serif; font-size:16px; font-weight: 300; margin: 40px 60px; } </style>
            </head>
            <body>
                ${report}
            </body>
        </html>`
    );
}

class Report extends React.Component<ReportProps, State> {

    state: State = {
        inProgress: false,
        result: null,
    };

    updateReport = async (period?: ReportPeriod) => {
        const  reportForm  = this.props.formModel;
        this.setState({ inProgress: true });
        if (period) {
            reportForm.setPeriod(period);
        }
        const res = await reportForm.getReportDataString();
        this.setState({ result: res, inProgress: false });
    }

    componentDidMount() {
        this.updateReport();
    }

    private _onChanged = () => {
        this.updateReport();
    }

    copyReport () {
        navigator.clipboard.writeText(this.state.result).then(() => PushToast({ text: 'Copied to clipboard' }));
    }

    printReport () {
        const windowPrint = window.open('', 'Print Page');
        windowPrint.document.write( markupPrintPage(this.state.result));
        windowPrint.document.close(); // necessary for IE >= 10
        windowPrint.focus(); // necessary for IE >= 10
        windowPrint.print();
        windowPrint.close();
    }

    render() {
        const form: ReportViewModel = this.props.formModel;

        return (
            <Page inProgress={this.state.inProgress} className="report-page">
                <View className="filters-block">
                    <View className="row">
                        <DatePickerObservable
                            model={form.dateStart}
                            label="Date from"
                            className="datepicker"
                            required
                            onChange={this._onChanged}
                        />
                        <DatePickerObservable
                            model={form.dateEnd}
                            label="Date to"
                            className="datepicker"
                            required
                            onChange={this._onChanged}
                        />
                    </View>
                    <View className="row buttons-row">
                        <Button
                            className="btn-type2"
                            titleClassName="label-btn2 type4"
                            onClick={() => this.updateReport(ReportPeriod.Yesterday)}>
                                Yesterday
                        </Button>
                        <Button
                            className="btn-type2"
                            titleClassName="label-btn2 type4"
                            onClick={() => this.updateReport(ReportPeriod.Last7)}>
                                Last 7 days
                        </Button>
                        <Button
                            className="btn-type2"
                            titleClassName="label-btn2 type4"
                            onClick={() => this.updateReport(ReportPeriod.Last14)}>
                                Last 14 days
                        </Button>
                        <Button
                            className="btn-type2"
                            titleClassName="label-btn2 type4"
                            onClick={() => this.updateReport(ReportPeriod.Last30)}>
                                Last 30 days
                        </Button>
                        <Button
                            className="btn-type2"
                            titleClassName="label-btn2 type4"
                            onClick={() => this.updateReport(ReportPeriod.Last60)}>
                                Last 60 days
                        </Button>
                    </View>
                    <View className="row">
                        <Text className="desc-5 type1">There are <Text className="desc-5">{`${form.journalCount || 0} check-in${form.journalCount !== 1 ? 's' : ''}`}</Text> in the selected time range.</Text>
                    </View>
                </View>
                <View className="report-block">
                {
                        this.state.result ?
                            <View className="report-wrap">
                                <TextArea
                                    value={this.state.result}
                                    onChange={v => this.setState({ result: v })}
                                    className="report-input"
                                />
                                <View className="btn-wrap">
                                    <View onClick={() => this.copyReport()} className="copy-btn btn btn-type3">
                                        <Image src={ProjectImages.copyIcon}/>
                                        <Text className="label-draganddrop">Copy</Text>
                                    </View>
                                    <View onClick={() => this.printReport()} className="print-btn btn btn-type3">
                                        <Image src={ProjectImages.printIcon}/>
                                        <Text className="label-draganddrop">Print</Text>
                                    </View>
                                </View>
                                {/* <Text className="report-text label-client-item input-placeholder">
                                    {this.state.result}
                                </Text> */}
                            </View>
                        :
                            <View className="empty-data-message">
                                <Image className="empty-data-icon" src={ProjectImages.emptyDataGradientChart} />
                                <Text className="desc-3 type1">No dates selected</Text>
                                <Text className="label-btn2 type1">Select any dates to see the report</Text>
                            </View>
                    }
                </View>
            </Page>
        );
    }
}

export default observer(Report);
