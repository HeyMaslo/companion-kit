import './utils/fixTsPaths';
import * as Util from 'util';
import * as FunctionDefinitions from 'common/abstractions/functions';

import * as users from './users';
import * as clients from './clients';
import * as coaches from './coaches';
import * as ai from './ai';
import * as billing from './billing';
import {
    ScheduledFunctionCrontab,
    ExportFunctionCrontab,
    BQExportFunctionCrontab,
    ImportFunctionCrontab } from './cron';
import { ExportFunctions } from './export';

import { StatsCallFunctions } from './adminStats';

Util.inspect.defaultOptions.depth = 5;
Util.inspect.defaultOptions.colors = true;

const exp: any = {
    [FunctionDefinitions.Users.Namespace]: users.Functions,
    [FunctionDefinitions.Clients.Namespace]: clients.Functions,
    [FunctionDefinitions.Coaches.Namespace]: coaches.Functions,
    [FunctionDefinitions.AI.Namespace]: ai.Functions,
    [FunctionDefinitions.Billing.Namespace]: billing.Functions,
    events: {},
};

exp[FunctionDefinitions.Stats.Namespace] = StatsCallFunctions;

if (ScheduledFunctionCrontab) {
    exp.events.schedule = ScheduledFunctionCrontab;
}

if (ExportFunctionCrontab) {
    // exp.events.export = ExportFunctionCrontab; // CRON export
    exp.events.bqExport = BQExportFunctionCrontab;
    exp.events.import = ImportFunctionCrontab;
}

if (ExportFunctions) {
    exp.events.export = ExportFunctions;        // DB event export
}

module.exports = exp;
