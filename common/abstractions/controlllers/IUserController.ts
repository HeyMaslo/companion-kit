
import FullUser from 'common/models/FullUser';
import { UserProfile, UserPublicProfile } from 'common/models';
import { Onboard } from 'common/models/dtos/updateUser';

export interface IUserController {
    readonly initializing: boolean;
    readonly user: FullUser;

    readonly accountMissing: boolean;
    readonly roleMismatch: boolean;

    finishOnBoarding(data?: Onboard.Data): Promise<void>;

    editProfile(profile: Partial<UserProfile>): Promise<void>;

    saveAvatar(base64url: string): Promise<void>;
    saveAvatar(blob: Blob): Promise<void>;

    getUserPublicInfo(uid: string): Promise<UserPublicProfile>;
}
