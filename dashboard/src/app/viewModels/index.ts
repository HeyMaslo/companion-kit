// import SignInViewModel from './SignInViewModel';
// import SignUpViewModel from './SignUpViewModel';
// import ClientsPageViewModel from './ClientsPageViewModel';
// import ProfileViewModel from './ProfileViewModel';

export interface AppViewModel {
    // readonly signIn: SignInViewModel;
    // readonly signUp: SignUpViewModel;
    // readonly profile: ProfileViewModel;
    // readonly clients: ClientsPageViewModel;
}

const instance: AppViewModel = {
    // signIn: new SignInViewModel(),
    // signUp: new SignUpViewModel(),
    // clients: new ClientsPageViewModel(),
    // profile: new ProfileViewModel(),
};

export default {
    get Instance() { return instance; },
};
