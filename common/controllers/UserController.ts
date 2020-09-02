import { createLogger } from 'common/logger';
import Firebase from 'common/services/firebase';
import { observable, reaction } from 'mobx';
import { Users as UsersFunctions } from 'common/abstractions/functions';
import { UserRoles, UserProfile, UserPublicProfile } from 'common/models';
import { IUserController } from 'common/abstractions/controlllers/IUserController';
import { IAuthController, AuthUser } from 'common/abstractions/controlllers/IAuthController';
import { transferTruthyFields, transferDefinedFields } from 'common/utils/fields';
import RepoFactory from './RepoFactory';
import FullUser from 'common/models/FullUser';
import Paths from 'common/storage/paths';
import { Unsubscriber, IDisposable } from 'common/utils/unsubscriber';
import { Onboard } from 'common/models/dtos/updateUser';

export const logger = createLogger('[User]');

export abstract class UserController implements IUserController, IDisposable {

    @observable
    private _initializing: boolean = false;

    @observable
    private _user: FullUser = null;

    private readonly _userPublicInfoCache: { [userId: string]: UserPublicProfile } = { };

    protected readonly disposer = new Unsubscriber('UserController');

    constructor(protected readonly auth: IAuthController) {
        this.disposer.add(
            reaction(() => auth.authUser, authUser => this.init(authUser)),
            'AUTH',
        );
    }

    get accountMissing() { return !this._initializing && !this.auth.initializing && ((!this._user && !!this.auth.authUser) || this.roleMismatch); }
    get roleMismatch() { return this._user && !UserRoles.Helper.contains(this._user.roles, this.targetRole); }

    get initializing() { return this._initializing; }
    get user() { return this._user; }

    abstract get targetRole(): UserRoles;

    protected async init(authUser: AuthUser) {
        try {
            this._initializing = true;

            if (!authUser) {
                this._user = null;
                return;
            }

            this.disposer.execute('USER');

            const uid = authUser?.uid;
            const unsub = !!uid && await RepoFactory.Instance.users.getUserById(uid, this.processUser);
            if (unsub) {
                this.disposer.add(unsub, 'USER');
            } else if (authUser) {
                logger.warn('Ignoring auth user:', authUser.email, authUser.displayName, authUser.photoURL);
            }
        } finally {
            this._initializing = false;
        }
    }

    private processUser = async (u: FullUser) => {
        const isUpdating = !!this._user;
        const action: string = isUpdating
            ? 'Updating'
            : 'Initializing';

        let uu = u || null;
        logger.log(action, 'user:', uu?.email, uu?.displayName);

        if (uu) {
            uu = await this.postProcessUser(uu, isUpdating);
        } else {
            logger.log('no user for uid =', this.auth.authUser?.uid);
        }

        this._user = uu;
        await this.onUserChanged(this._user, isUpdating);

        // await this.checkAuthUserAvatar();
    }

    protected async onUserChanged(user: FullUser, isUpdating?: boolean): Promise<void> {
        /* override me */
    }

    protected async postProcessUser(user: FullUser, isUpdating?: boolean): Promise<FullUser> {
        /* override me */
        return user;
    }

    async finishOnBoarding(data: Onboard.Data) {
        try {
            await Firebase.Instance.getFunction(UsersFunctions.Onboard)
                .execute({ role: this.targetRole, ...data });
            // user fields should be observable via database, so no need to update them manually here
        } catch (err) {
            logger.warn('[UserController:finishOnBoarding] Something went wrong:', err);
        }
    }

    async editProfile(profile: Partial<UserProfile>) {
        // manually filter editable fields
        const data: Partial<UserProfile> = { };

        transferTruthyFields(profile, data,
            'displayName',
            'firstName',
            'lastName',
            'photoURL',
            'phone',
        );

        transferDefinedFields(profile, data,
            'bio',
        );

        try {
            if (!this._user) {
                throw Error('Cannot update user, no auth session');
            }

            await Firebase.Instance.getFunction(UsersFunctions.UpdateUser)
                .execute(data);

            // logger.log('Successfully updated user with diff:', effectiveDiff);
        } catch (err) {
            logger.error('Failed to edit user, error', err);
        }
    }

    async saveAvatar(base64urlOrBlob: string | Blob) {

        const path = Paths.getAvatarPath(this.user.id);
        const fileRef = Firebase.Instance.storage.ref(path);

        logger.log('Uploading user avatar by path:', path);

        if (typeof base64urlOrBlob === 'string') {
            await fileRef.putString(base64urlOrBlob, 'data_url');
        } else {
            await fileRef.put(base64urlOrBlob);
        }

        const url = await fileRef.getDownloadURL();

        logger.log('User avatar uploaded, url =', url);
        await Promise.all([
            this.editProfile({ photoURL: url }),
            this.auth.updatePhotoUrl(url),
        ]);
    }

    async getUserPublicInfo(uid: string): Promise<UserPublicProfile> {
        let info = this._userPublicInfoCache[uid];
        if (info) {
            return info;
        }

        info = await RepoFactory.Instance.users.getPublicUserInfo(uid);
        this._userPublicInfoCache[uid] = info;
        return info;
    }

    // private checkAuthUserAvatar() {
    //     if (this._user && this.auth.authUser
    //         && this.auth.authUser.photoURL && this._user.photoURL !== this.auth.authUser.photoURL
    //     ) {
    //         this._user.photoURL = this.auth.authUser.photoURL;
    //     }
    // }

    dispose() {
        this.disposer.dispose(true);
    }
}
