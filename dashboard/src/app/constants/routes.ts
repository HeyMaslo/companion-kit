
export const Home = '/';
export const About = '/about';
export const Topics = '/topics';
export const AddNewClient = '/clients/add';
export const AddNewClientSuccess = '/clients/add/success';
export const Clients = '/clients';
export const Error = '/error';
export const Profile = '/profile';
export const Privacy = '/privacy-policy';
export const Terms = '/terms';
export const SignUp = '/signup';
export const SignIn = '/signin';

export const HelpLink = 'https://maslo.kb.help/';

export * from './clientRoutes';

export const SignUpComplete = '/welcome';
export const ToDesktop = '/to-desktop';
export const Pricing = '/pricing';

export function combine(...paths: string[]) {
    return paths.map(p => {
        let s = p.startsWith('/') ? 1 : 0;
        let e = p.endsWith('/') ? p.length - 1 : p.length;
        return p.substring(s, e);
    }).join('/');
}

export const Admin = '/admin';

export enum CheckEmailTypes {
    SignUp = 'sign-up',
    ResetPassword = 'reset-password',
}

const getCheckEmailRoute = (type: CheckEmailTypes | string) => `/check-email/${type}`;

export const CheckYourEmail = getCheckEmailRoute(CheckEmailTypes.SignUp);
export const CheckYourEmail_PasswordReset = getCheckEmailRoute(CheckEmailTypes.ResetPassword);
export const CheckYourEmailBase =  getCheckEmailRoute(':type');
