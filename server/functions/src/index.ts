import './utils/fixTsPaths';
import * as Util from 'util';
import * as FunctionDefinitions from 'common/abstractions/functions';

import * as users from './users';
import * as clients from './clients';
import * as coaches from './coaches';
import * as ai from './ai';
import * as billing from './billing';
import * as qol from './qol';
import { ScheduledFunctionCrontab, ExportFunctionCrontab, ImportFunctionCrontab } from './cron';

import { StatsCallFunctions } from './adminStats';

Util.inspect.defaultOptions.depth = 5;
Util.inspect.defaultOptions.colors = true;

const exp: any = {
    [FunctionDefinitions.Users.Namespace]: users.Functions,
    [FunctionDefinitions.Clients.Namespace]: clients.Functions,
    [FunctionDefinitions.Coaches.Namespace]: coaches.Functions,
    [FunctionDefinitions.AI.Namespace]: ai.Functions,
    [FunctionDefinitions.Billing.Namespace]: billing.Functions,
    [FunctionDefinitions.QoL.Namespace]: qol.Functions,
    events: {},
};

exp[FunctionDefinitions.Stats.Namespace] = StatsCallFunctions;

if (ScheduledFunctionCrontab) {
    exp.events.schedule = ScheduledFunctionCrontab;
}

if (ExportFunctionCrontab) {
    exp.events.export = ExportFunctionCrontab;
    exp.events.import = ImportFunctionCrontab;
}

module.exports = exp;
