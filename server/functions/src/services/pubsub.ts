import * as functions from 'firebase-functions';
import { PubSub as CloudPubsSub } from '@google-cloud/pubsub';
import { ILogger, createLogger } from 'common/logger';
import { AI as AIFunctions } from 'common/abstractions/functions';
import { ProjectId } from './admin';
import { MemoryOptions } from './config';

export namespace PubSub {
    const Instance = new CloudPubsSub({ projectId: ProjectId });

    class TopicDefinition<TData extends Object> {

        logger: ILogger;

        readonly EmptyData: TData = null;

        constructor(readonly name: string, readonly Timeout = 60, readonly Memory: MemoryOptions = '256MB') {
            this.logger = createLogger(`[PubSub:${name}]`);
        }

        async publish(data: TData) {
            const t = Instance.topic(this.name);

            try {
                await t.publishJSON(data);
            } catch (err) {
                this.logger.error('Failed to publish, error:', err);
            }
        }

        get triggerName() { return `pubsub_${this.name}`; }

        createTrigger(handler: (d: TData) => (void | Promise<void>)) {
            const builder = functions.runWith({ timeoutSeconds: this.Timeout, memory: this.Memory });

            return builder.pubsub.topic(this.name).onPublish(async (message, context) => {
                const data = message.json as TData;
                try {
                    await handler(data);
                } catch (err) {
                    this.logger.error('Failed to exectue trigger, error:', err);
                }
            });
        }
    }

    export namespace Topics {
        export const AudioEntryUploaded = new TopicDefinition<AIFunctions.ProcessArgs>('new_entry', 540, '512MB');
    }
}