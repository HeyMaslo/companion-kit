import Twilio from 'twilio';
import { createLazy } from 'common/utils/lazy.light';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER_FROM } from 'server/services/config';
import { createLogger } from 'common/logger';

const logger = createLogger('[SMS:Twilio]');

const TwilioClient = createLazy(() => {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER_FROM) {
        logger.warn('Twilio API hasn\'t been setup properly.');
        return null;
    }

    return Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
});

export async function sendText(phoneNumber: string, text: string) {
    if (!TwilioClient.value) {
        logger.warn('Ignoring sending Twilio text:', { phoneNumber, text });
        return;
    }

    try {
        logger.log('Sending text to', phoneNumber, ':', text );
        await TwilioClient.value.messages.create({
            body: text,
            to: phoneNumber,
            from: TWILIO_PHONE_NUMBER_FROM,
        });
    } catch (err) {
        logger.error(err);
    }
}
