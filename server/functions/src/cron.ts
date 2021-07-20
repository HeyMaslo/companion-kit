import * as functions from 'firebase-functions';
import { FeatureSettings } from './services/config';
import { triggerEvents } from 'server/cronTasks/scheduledEvents';
import { exportDB, importToBQ, exportData } from 'server/cronTasks';

// every 5 minutes
export const ScheduledFunctionCrontab = FeatureSettings.ScheduleEvents && functions.pubsub.schedule('*/5 * * * *')
    .onRun(async (context) => {
        await triggerEvents();
    });

// every day at midnight
export const BQExportFunctionCrontab = FeatureSettings.ExportToBQ && functions.pubsub.schedule('0 0 * * *')
    .onRun(async (context) => {
        await exportDB();
    });

// every day at 00:30
export const ImportFunctionCrontab = FeatureSettings.ExportToBQ && functions.pubsub.schedule('30 0 * * *')
    .onRun(async (context) => {
        await importToBQ();
    });

// every 10 minutes
export const ExportFunctionCrontab = FeatureSettings.ExportToDataServices && functions.pubsub.schedule('*/10 * * * *')
    .onRun(async (context) => {
        await exportData();
    });
