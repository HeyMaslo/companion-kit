import type { CountryCode } from 'common/utils/validation/phoneNumber';

export namespace ClientCardFeatures {

    export const UseTherapistClientInfo = true;
    export const CaretakersEnabled = UseTherapistClientInfo;
    export const UseOccupation = false;
}

export namespace Dashboard {
    export const CoachVerificationRequired = false;

    export const UseWorkEmail = false;

    export const UseSignUpFeaturesList = false;

    export const RequireOrganizationOnSignUp = false;

    export const UseMobileNumber: any = false;

    // if you want to enable mobile phone validatio just uncomment
    // export const UseMobileNumber = {
    //     countries: ['US', 'CA', 'MX', 'UA'] as CountryCode[],
    // };
}

export namespace Mobile {

    export namespace ConfirmAccount {
        export const CollectZipCode = false;

        export const CollectPhoneNumber: { countries: CountryCode[] } = null;
    }

    export namespace CheckIns {

        export const AllowCheckinDelete = false;

        export const AllowCheckinPrivateness = false;

        export const IsNewEntryPrivateByDefault = false;

        export const AskUserAboutPrivateness = false;

        export const AskCheckinLocation = false;
    }

    export namespace SignIn {

        export const Google = false;

        export const Apple = false;
    }
}
