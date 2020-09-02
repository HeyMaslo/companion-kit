import { UserProfile, UserRoles, CoachProfile } from 'common/models';
import { ClientRewardInfo } from 'common/models/ClientProfile';

export namespace EditProfile {
    export type Request = Partial<UserProfile>;
    export type Respsonse = Partial<UserProfile>;
}

export namespace Onboard {
    export type Data = {
        displayName?: string,
        zipcode?: string,
        phone?: string,
    };

    export type Request = Data & {
        role: UserRoles,
    };
    export type Response = { ok: boolean };
}

export namespace EditCoachProfile {
    type Diff = Partial<Pick<CoachProfile, 'officeNumber'>>;

    export type Request = Diff;
    export type Response = Diff;
}

export namespace ConsentAccept {
    export type Request = { option: string };
    export type Response = { ok: boolean };
}

export namespace ShareReward {
    export type Request = { accountId: string, info: ClientRewardInfo };
    export type Response = { };
}

type EditProfileRequest = { profile: EditProfile.Request };
type EditCoachProfileRequest = { coach: EditCoachProfile.Request; };
type OnboardRequest = { onboard: Onboard.Request };
type ConsentAcceptRequest = { consent: ConsentAccept.Request };
type ShareRewardRequest = { reward: ShareReward.Request };

export type RequestDto = EditProfileRequest | EditCoachProfileRequest | OnboardRequest | ConsentAcceptRequest | ShareRewardRequest;

export namespace RequestDto {
    export function isEditProfile(dto: RequestDto): dto is EditProfileRequest {
        return dto && (dto as EditProfileRequest).profile != null;
    }

    export function isEditCoachProfile(dto: RequestDto): dto is EditCoachProfileRequest {
        return dto && (dto as EditCoachProfileRequest).coach != null;
    }

    export function isOnboard(dto: RequestDto): dto is OnboardRequest {
        return dto && (dto as OnboardRequest).onboard != null;
    }

    export function isConsentAccept(dto: RequestDto): dto is ConsentAcceptRequest {
        return dto && (dto as ConsentAcceptRequest).consent != null;
    }

    export function isShareReward(dto: RequestDto): dto is ShareRewardRequest {
        return dto && (dto as ShareRewardRequest).reward != null;
    }
}

export type ResponseDto = EditProfile.Respsonse | EditCoachProfile.Response | Onboard.Response | ConsentAccept.Response | ShareReward.Response;
