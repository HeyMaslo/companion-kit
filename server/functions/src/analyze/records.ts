import 'server/services/admin';

import { LROperation } from 'google-gax';
import * as GoogleSpeech from '@google-cloud/speech';
import * as GoogleSpeechLib from '@google-cloud/speech/build/protos/protos';
import * as GoogleVision from '@google-cloud/vision';
import { LanguageServiceClient } from '@google-cloud/language';
import * as gax from 'google-gax';
import { createDefaultBackoffSettings } from 'google-gax/build/src/gax';

import { createLogger } from 'common/logger';
import {
    AudioMetadata,
    RecordDataIded,
    SentimentAnalysis,
    RecordData,
    ClientEntryIded,
    ClientJournalEntryIded,
    ClientSessionEntryIded,
    SpeechRecognition,
    JournalRecordDataIded,
    SessionRecordDataIded,
    RecordAnalyzeState,
} from 'common/models';
import { SpeechRecognitionGoogle } from 'common/models/SpeechRecognition';
import { Entity } from 'common/models/EntityReference';
import { bucket } from 'server/services/storage';
import { Repo } from 'server/services/db';
import { createLazy } from 'common/utils/lazy.light';

import { getRMSAsync } from 'server/utils/audio.ffmpeg';
import { prepareAudioAsync, AudioFile } from './checkAudioFormat';
import { MindfulWords, Vowels } from './wordsHelpers';

import { checkTriggerPhrase } from './triggerPhrases';
import { sendText } from 'server/services/sms';
import { addClientEvent } from 'server/clients.events';
import { EventTypes } from 'common/models/Events';
import { VisionRecognition } from 'common/models/VisionRecognition';

import GoogleAudioEncoding = GoogleSpeechLib.google.cloud.speech.v1p1beta1.RecognitionConfig.AudioEncoding;
import GoogleSpeechClient = GoogleSpeech.v1p1beta1.SpeechClient;

type GoogleRecognitionConfig =  GoogleSpeechLib.google.cloud.speech.v1p1beta1.IRecognitionConfig;
type GoogleRecognitionAudio = GoogleSpeechLib.google.cloud.speech.v1p1beta1.IRecognitionAudio;

type RecognizeOperation = LROperation<GoogleSpeechLib.google.cloud.speech.v1p1beta1.ILongRunningRecognizeResponse, GoogleSpeechLib.google.cloud.speech.v1p1beta1.ILongRunningRecognizeMetadata>;

const SpeechClient = createLazy(() => new GoogleSpeechClient());
const LangClient = createLazy(() => new LanguageServiceClient());

const MegaByte = 1024 * 1024;
const Minute = 60 * 1000;
const TriggerPhrasesEventDelay = 0 * Minute;

const logger = createLogger('[Analyze.Record]');

export function processJournalEntry(entry: ClientJournalEntryIded): Promise<JournalRecordDataIded> {
    return (new JournalEntryProcessor(entry)).processRecord();
}

export function processSessionEntry(entry: ClientSessionEntryIded): Promise<SessionRecordDataIded> {
    return (new SessionEntryProcessor(entry)).processRecord();
}

abstract class EntryProcessor<TEntry extends ClientEntryIded, TRecord extends RecordDataIded, TType extends 'journal' | 'session'> {

    record: TRecord;
    protected audioFile: AudioFile;

    private _operation: RecognizeOperation = null;
    private _entryFileType: 'text' | 'audio' | 'image' = null;

    constructor(readonly entry: TEntry) {
    }

    protected createBaseRecord() {
        return {
            entryId: this.entry.id,
            state: RecordAnalyzeState.Initialized,
            type: this.type,
            clientUid: this.entry.clientUid,
            coachUid: this.entry.coachUid,
            clientCardId: this.entry.clientCardId,
            date: Date.now(),
            entities: [],
            transcriptionFull: null as [],
            sentiment: null,
            energyLevel: null,
            mindfulness: 0,
            mentalHealth: 0.5,
            devsData: {
                audioMeta: this.entry.audioMeta,
                imageMeta: this.entry.image?.meta || null,
            },
        };
    }

    protected abstract get type(): TType;
    protected abstract get speakersCount(): 'one' | 'two';

    async processRecord() {
        await this.initialize();
        await this.process();
        return this.record;
    }

    protected async initialize() {
        const existing = await Repo.Records.getByEntryId(this.entry.clientUid, this.entry.coachUid, this.entry.id);
        if (existing && existing.type === this.type) {
            existing.date = new Date().getTime();
            this.record = existing as TRecord;
        } else {
            this.record = (await Repo.Records.create(this.createBaseRecord(), false)) as TRecord;
        }

        this._entryFileType = 'text';
        if (!this.entry.transcription || typeof this.entry.transcription !== 'string') {
            if (this.entry.auidioRef) {
                this._entryFileType = 'audio';
            } else if (this.entry.image) {
                this._entryFileType = 'image';
            }
        }
    }

    protected async process() {
        const currentState = this.record.state || RecordAnalyzeState.Initialized;

        try {
            switch (currentState) {

                case RecordAnalyzeState.Initialized: {
                    await this.prepareEntryFile();
                    break;
                }

                case RecordAnalyzeState.Prepared: {
                    await this.transcribe();
                    break;
                }

                case RecordAnalyzeState.TranscriptionStarted: {
                    await this.finishAudioTranscription();
                    break;
                }

                case RecordAnalyzeState.Transcribed: {
                    await this.analyze();
                    break;
                }

                case RecordAnalyzeState.Analyzed: {
                    await this.checkTriggers();
                    break;
                }

                case RecordAnalyzeState.TriggersChecked: {
                    await this.updateJournalTranscription();
                    break;
                }

                case RecordAnalyzeState.Finished:
                case RecordAnalyzeState.Error: {
                    logger.log('Finishing processing due to record state:', currentState);
                    return;
                }

                default: {
                    throw new Error('unknown state');
                }
            }
        } catch (err) {
            logger.error(`Got error on processing entry state '${currentState}', record id = ${this.record.id}\r\n`, err);
            this.record.devsData.error = {
                message: err.message,
                errorJson: JSON.stringify(err),
                failedOnState: currentState,
            };
            this.record.state = RecordAnalyzeState.Error;
        }

        logger.log(this.record.id, 'Processed state transition from', currentState, 'to', this.record.state);

        // changing state is required to happen after step processing
        if (this.record.state !== currentState) {
            // saving intermediate state to avoid data loss
            await this.saveRecord();
            // swith to the next state:
            await this.process();
        } else {
            logger.error(new Error('ERROR State did not changed'));
        }
    }

    protected async prepareEntryFile() {
        if (this._entryFileType === 'audio') {
            const audioFormat = await prepareAudioAsync(this.entry.auidioRef);
            if (audioFormat && audioFormat.isConverted) {
                this.entry.audioMeta.format = audioFormat.resultFormat.gapiType;
                this.record.convertedAudioRef = audioFormat.isConverted ? audioFormat.resultFile.remotePath : null;
            }

            this.audioFile = audioFormat && audioFormat.resultFile;
            if (!this.audioFile) {
                this.audioFile = new AudioFile(this.entry.auidioRef, false, true);
            }
        }

        this.record.state = RecordAnalyzeState.Prepared;
    }

    protected async transcribe() {
        if (this._entryFileType === 'audio') {
            await this.transcribeAudio();
        } else if (this._entryFileType === 'image') {
            await this.transcribeImage();
        } else {
            this.record.state = RecordAnalyzeState.Transcribed;
        }
    }

    protected async transcribeAudio() {
        if (this._entryFileType !== 'audio' || !this.audioFile) {
            this.record.state = RecordAnalyzeState.Transcribed;
            return;
        }

        const meta = this.entry.audioMeta;
        if (!meta.speakers) {
            meta.speakers = this.speakersCount;
        }

        let encoding: GoogleAudioEncoding;
        switch (meta.format) {
            case 'PCM': {
                encoding = GoogleAudioEncoding.LINEAR16; // 'LINEAR16';
                break;
            }
            case 'MP3': {
                encoding = GoogleAudioEncoding.MP3; // 'MP3';
                break;
            }
            default: {
                encoding = GoogleAudioEncoding.ENCODING_UNSPECIFIED; // 'ENCODING_UNSPECIFIED';
                break;
            }
        }

        const sampleRateHertz = meta.sampleRate || 44100;
        const languageCode = meta.lang || 'en-US';

        const config: GoogleRecognitionConfig = {
            encoding: encoding,
            languageCode: languageCode,
            model: 'default',
            sampleRateHertz: sampleRateHertz,
            maxAlternatives: 1,
        };

        if (meta.speakers === 'two') {
            Object.assign(config, {
                diarizationSpeakerCount: 2,
                enableAutomaticPunctuation: true,
                enableSpeakerDiarization: true,
            });
        }

        const audio: GoogleRecognitionAudio = {
            uri: `gs://${bucket.name}/${this.audioFile.remotePath}`,
        };

        const request = {
            config: config,
            audio: audio,
        };

        logger.log('SpeechToText: started with args = ', config.encoding, config.sampleRateHertz, audio.uri);

        // Detects speech in the audio file
        const [ operation ] = await SpeechClient.value.longRunningRecognize(request);

        this._operation = operation;
        this.record.devsData.longRunningOperationName = operation.name;
        this.record.state = RecordAnalyzeState.TranscriptionStarted;
    }

    protected async finishAudioTranscription() {
        if (!this._operation) {
            // TEMPORARY: restart transcription
            // this.record.state = RecordAnalyzeState.Prepared;
            // return;

            const operationName = this.record.devsData.longRunningOperationName;
            if (!operationName) {
                throw new Error('cannot finish transcrption, no operation name found');
            }

            const getOperationResponse = await SpeechClient.value.operationsClient
                .getOperation(gax.operationsProtos.google.longrunning.GetOperationRequest.create({ name: operationName }), { });
            const operation = new gax.Operation(
                getOperationResponse[0],
                (SpeechClient.value as unknown as any)._descriptors.longrunning.longRunningRecognize,
                createDefaultBackoffSettings(),
                { },
            );
            this._operation = operation as RecognizeOperation;
            logger.log('RESTORED OPERATION', this._operation.name);

            if (!this._operation?.promise) {
                console.error('Failed to get operation', operation);
                throw new Error('Failed to get running operation!');
            }
        }

        // this can fail due to timeout
        const [ response ] = await this._operation.promise();
        const results = response.results || [];

        logger.log('SpeechToText: completed with results length =', results.length);

        this.record.devsData.longRunningOperationName = null;
        this.record.transcriptionFull = results.map(r => SpeechRecognitionGoogle.Result.toLight(r));
        this.record.state = RecordAnalyzeState.Transcribed;
    }

    protected async transcribeImage() {
        const client = new GoogleVision.ImageAnnotatorClient();
        const path = `gs://${bucket.name}/${this.entry.image.storageRef}`;
        const [
            [faceDetection],
            [objectLocalization],
            [landmarkDetection],
            [labelDetection],
        ] = await Promise.all([
            client.faceDetection(path),
            client.objectLocalization(path),
            client.landmarkDetection(path),
            client.labelDetection(path),
        ]);
        this.record.vision = {
            ...objectLocalization,
            ...landmarkDetection,
            ...labelDetection,
            faceDetection: faceDetection.faceAnnotations,
        };
        this.record.state = RecordAnalyzeState.Transcribed;
    }

    protected getFullTranscription() {
        if (this.record.transcriptionFull) {
            return SpeechRecognition.merge(this.record.transcriptionFull);
        }

        if (this.record.vision) {
            return getImageTranscript(this.record.vision);
        }

        return this.entry.transcription;
    }

    protected async analyze() {
        const transcription = this.getFullTranscription();

        if (!transcription) {
            logger.error('Warning! No transcirption!', this.entry, this.record);

            const rms = await getEntryRMS(this.audioFile);
            this.record.audioRms = rms || 0;

            this.record.state = RecordAnalyzeState.Analyzed;
            return;
        }

        const [sentiment, entities, audioRms] = await Promise.all([
            getSentiment(transcription),
            getEntities(transcription),
            getEntryRMS(this.audioFile),
        ]);

        this.record.sentiment = sentiment;
        this.record.entities = entities;

        if (audioRms != null) {
            this.record.audioRms = audioRms;
        }

        const mindfulWords = MindfulWords.getScore(transcription);
        this.record.mindfulness = mindfulWords.score;
        this.record.devsData.mindfulCount = mindfulWords.count;

        updateEnergy(this.entry, this.record);
        // updateMentalHealth(record);

        this.record.state = RecordAnalyzeState.Analyzed;
    }

    protected abstract checkTriggers(): Promise<void>;

    protected abstract updateJournalTranscription(): Promise<void>;

    protected async saveRecord() {
        this.record = await Repo.Records.create(this.record, true) as TRecord;
    }
}

export class JournalEntryProcessor extends EntryProcessor<ClientJournalEntryIded, JournalRecordDataIded, 'journal'> {
    constructor(entry: ClientJournalEntryIded) {
        super(entry);
    }

    protected get type(): 'journal' { return 'journal'; }
    protected get speakersCount(): 'one' { return 'one'; }

    protected async updateJournalTranscription() {
        const t = this.getFullTranscription();
        logger.log(`updating journal transcription. uid => ${this.entry.id} accId => ${this.entry.clientCardId} entryId => ${this.entry.id}`);
        await Repo.Clients.updateJournal(this.entry.clientUid, this.entry.clientCardId, this.record.entryId, { transcription: t });

        this.record.state = RecordAnalyzeState.UpdateJournalTrigger;
    }

    protected async checkTriggers() {
        const t = this.getFullTranscription();
        const phrase = t && checkTriggerPhrase(t);

        if (phrase) {
            this.record.triggeredPhrase = {
                phrase: phrase,
                notification: `You mentioned "${phrase}". Can you tell me more about that?`,
            };

            try {
                await addClientEvent({
                    type: EventTypes.TriggerPhrase,
                    phrase: phrase,
                    text: this.record.triggeredPhrase.notification,
                    timestamp: Date.now() + TriggerPhrasesEventDelay,
                    clientUid: this.entry.clientUid,
                    clientCardId: this.entry.clientCardId,
                    coachUid: this.entry.coachUid,
                });
            } catch (err) {
                if (!this.record.devsData) {
                    this.record.devsData = { };
                }
                logger.warn('Failed on creating client notification event');
                logger.error(err);
                this.record.devsData.error = {
                    message: 'Failed to add client event for push notification trigger phrase',
                    errorJson: JSON.stringify(err),
                    failedOnState: RecordAnalyzeState.TriggersChecked,
                };
            }

            const [coachProfile, clientCard] = await Promise.all([
                Repo.Users.getUserById(this.entry.coachUid),
                Repo.ClientCards.getClient(this.entry.coachUid, this.entry.clientCardId),
            ]);

            if (coachProfile?.phone) {
                const msg = `${clientCard.firstName} ${clientCard.lastName} mentioned "${phrase}" in their journal entry!`;

                try {
                    await sendText(coachProfile.phone, msg);

                    this.record.triggeredPhrase.phoneNumberSentTo = coachProfile.phone;
                    this.record.triggeredPhrase.text = msg;
                } catch (err) {
                    logger.warn('Trigger Phrases: Failed on sending SMS to therapist');
                    logger.error(err);
                    if (!this.record.devsData) {
                        this.record.devsData = { };
                    }
                    this.record.devsData.error = {
                        message: 'Failed to send SMS on trigger phrase',
                        errorJson: JSON.stringify(err),
                        failedOnState: RecordAnalyzeState.TriggersChecked,
                    };
                }
            }
        }

        this.record.state = RecordAnalyzeState.TriggersChecked;
    }
}

export class SessionEntryProcessor extends EntryProcessor<ClientSessionEntryIded, SessionRecordDataIded, 'session'> {
    constructor(entry: ClientSessionEntryIded) {
        super(entry);
    }

    protected get type(): 'session' { return 'session'; }
    protected get speakersCount(): 'two' { return 'two'; }

    protected async checkTriggers() {
        this.record.state = RecordAnalyzeState.TriggersChecked;
    }

    protected async updateJournalTranscription() {
        this.record.state = RecordAnalyzeState.UpdateJournalTrigger;
    }
}

async function getSentiment(content: string): Promise<SentimentAnalysis> {

    const document = {
        content: content,
        type: 'PLAIN_TEXT' as 'PLAIN_TEXT',
    };

    logger.log('getSentiment: begin, text length =', content && content.length);

    const args = {
        document,
        encodingType: 'UTF8' as 'UTF8',
    };

    const [result] = await LangClient.value.analyzeSentiment(args);
    const sentiment = result.documentSentiment;

    logger.log('getSentiment: complete, result =', sentiment);

    return result as SentimentAnalysis;
}

async function getEntities(content: string) {
    logger.log('getEntities: begin, text length =', content.length);

    const [result] = await LangClient.value.analyzeEntitySentiment({
        document: {
            content: content,
            type: 'PLAIN_TEXT',
        },
        encodingType: 'UTF8',
    });

    const entities = result.entities as Entity[];
    logger.log('getEntities: complete, entities length =', entities.length);
    return entities;
}

function updateEnergy(entry: ClientEntryIded, record: RecordData) {
    let energyLevel = 0;

    if (record.audioRms != null && typeof record.audioRms === 'number') {
        energyLevel = record.audioRms;
    } else {
        const transcription = record.transcriptionFull
            ? SpeechRecognition.merge(record.transcriptionFull)
            : entry.transcription;

        const meta = entry.audioMeta || <AudioMetadata>{ };
        const fileSizeMb = (meta.bytesSize || MegaByte) / MegaByte;
        const duration = meta.duration || 60;

        const vowelsCount = Vowels.getCount(transcription);
        record.devsData.vowelsCount = vowelsCount;
        energyLevel = vowelsCount * fileSizeMb / duration;
    }

    record.energyLevel = {
        original: energyLevel,
        // normalized: normalized[normalized.length - 1],
    };
}

function updateMentalHealth(record: RecordData, prevRecords: RecordDataIded[]) {
    if (prevRecords.length === 6) {
        const sum = prevRecords.reduce((res, r) => {
            const s = SentimentAnalysis.getValue(r.sentiment).score;
            return res + s;
        }, SentimentAnalysis.getValue(record.sentiment).score);

        let avg = sum / 7; // -1..1
        // normalize to 0..1
        avg = (avg + 1) / 2;
        record.mentalHealth = avg;
    }
}

async function getEntryRMS(audioFile: AudioFile): Promise<number> {
    if (!audioFile) {
        return null;
    }

    const stream = audioFile.isLocal
        ? audioFile.createReadStream()
        : (audioFile.isRemote
                ? audioFile.createDownloadStream()
                : null
        );

    if (!stream) {
        return 0;
    }

    logger.log('getEntryRMS: begin for ref:', audioFile.remotePath);

    let channels = (audioFile.metadata && audioFile.metadata.channels) as (1 | 2);
    if (!channels || channels !== 1) {
        channels = 2;
    }

    const rms = await getRMSAsync(stream, channels);

    logger.log('getEntryRMS: got RMS result:', rms);

    return rms;
}

function getImageTranscript(vision: VisionRecognition): string {

    // [faceDetection, objectLocalization, landmarkDetection, labelDetection]: Array<IAnnotateImageResponse>
    const faceDetectionResult: string = faceDetectionAnalyze(vision);
    const imagePropertiesResult: string = objectLocalizationAnalyze(vision);
    const landmarkDetectionResult: string = landmarkDetectionAnalyze(vision);
    const labelDetectionResult: string = labelDetectionAnalyze(vision);
    return `${faceDetectionResult}${imagePropertiesResult}${landmarkDetectionResult}${labelDetectionResult}`;
}

function labelDetectionAnalyze(vision: VisionRecognition): string {
    const labels = vision.labelAnnotations;
    let transcript: string = 'there are also ';
    labels.forEach(label => {
        transcript += `${label.description}, `;
    });
    return transcript === 'there are also ' ? '' : transcript;
}

function landmarkDetectionAnalyze(vision: VisionRecognition): string {
    const landmarks = vision.landmarkAnnotations;
    let transcript: string = 'I have been ';
    landmarks.forEach(landmark => {
        transcript += `${landmark}, `;
    });
    return transcript === 'I have been ' ? '' : transcript;
}

function objectLocalizationAnalyze(vision: VisionRecognition): string {
    const objects = vision.localizedObjectAnnotations;
    let transcript: string = 'there are ';
    objects.forEach(object => {
        transcript += `${object.name}, `;
    });
    return transcript === 'there are ' ? '' : transcript;
}

function faceDetectionAnalyze(vision: VisionRecognition): string {
    const faces = vision.faceAnnotations;
    const transcript: string = 'I feel ';
    const transcriptArr = [];
    faces?.forEach(face => {
        if (face.joyLikelihood === 'VERY_LIKELY') {
            transcriptArr.push('Joy');
        }
        if (face.angerLikelihood === 'VERY_LIKELY') {
            transcriptArr.push('Anger');
        }
        if (face.surpriseLikelihood === 'VERY_LIKELY') {
            transcriptArr.push('Surprise');
        }
        if (face.sorrowLikelihood === 'VERY_LIKELY') {
            transcriptArr.push('Sorrow');
        }
    });
    return transcriptArr.length ? `${transcript}${transcriptArr.join(', ')}, ` : '';
}
