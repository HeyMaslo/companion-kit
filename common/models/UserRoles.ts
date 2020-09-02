import { EnumBitwiseHelper } from 'common/utils/enumHelper';

export enum UserRoles {
    Undefined = 0,
    Ghost = 1, // 1 << 0, // 1, reserved
    Coach = 2, // 1 << 1, // 2
    Client = 4, // 1 << 2, // 4
    CoachAndClient = 6, //  UserRoles.Coach | UserRoles.Client, // 6
}

export namespace UserRoles {
    export const Helper = new EnumBitwiseHelper<UserRoles>(UserRoles);
}

export default UserRoles;
