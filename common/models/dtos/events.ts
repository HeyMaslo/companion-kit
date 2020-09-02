import { EventIded } from 'common/models/Events';
import { BaseUpdateDto } from './updateDto';

export type EventsRequestDto = BaseUpdateDto<EventIded> & {
    clientId: string,
    accountId: string,
};

export type EventsResponseDto = EventIded[];
