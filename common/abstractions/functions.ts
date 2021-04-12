import {
    RecordDataIded,
    SignUpData,
    ICoachSignUpData,
    UserRoles,
    SignUpClientResult,
    SignUpCoachResult,
    SignUpResult, ClientAccountIded,
    ClientCard,
    CoachClientActions,
} from 'common/models';
import { Plans, PlansCategories } from 'common/models/Plans';
import { Stats } from './functions.stats';
import { FunctionDefinition } from './functions.definition';
import * as AuthDtos from 'common/models/dtos/auth';
import * as UpdateUserDtos from 'common/models/dtos/updateUser';
import * as JournalDtos from 'common/models/dtos/journals';
import * as DocumentDtos from 'common/models/dtos/documents';
import * as TimeTrackingDtos from 'common/models/dtos/timeTracking';
import * as IntakeFormsDtos from 'common/models/dtos/intakeForms';
import * as SessionsDtos from 'common/models/dtos/sessions';
import * as ClientsDtos from 'common/models/dtos/clients';
import * as PromptsDtos from 'common/models/dtos/prompts';
import * as EventsDtos from 'common/models/dtos/events';
import * as QoLDtos from 'common/models/dtos/qol';

export { Stats };

export namespace Users {
    export const Namespace = 'users';

    export const AuthEndpoint = new FunctionDefinition<AuthDtos.AuthRequest, AuthDtos.AuthResponse>('auth', Namespace);

    export const SendVerificationCodeEmail = AuthEndpoint.specify<AuthDtos.SendVerificationCodeEmailRequest, { result: boolean, verificationCode?: string } | 'noInvitation'>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.SendVerificationCodeEmail }),
    );

    export const ResetPassword = AuthEndpoint.specify<AuthDtos.ResetPasswordRequest, { result: boolean }>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.ResetPassword }),
    );

    export const GenerateToken = AuthEndpoint.specify<AuthDtos.GenerateTokenRequest, { result: boolean, token?: string }>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.GenerateToken }),
    );

    export const HasAccount = AuthEndpoint.specify<AuthDtos.HasAccountRequest, { result: boolean }>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.HasAccount }),
    );

    export const ValidateCode = AuthEndpoint.specify<AuthDtos.ValidateCodeRequest, { result: boolean }>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.ValidateCode }),
    );

    export const MagicLink = AuthEndpoint.specify<AuthDtos.MagicLinkRequest, AuthDtos.BaseResponse>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.MagicLinkSignIn }),
    );
    export const GenerateMagicLink = AuthEndpoint.specify<AuthDtos.MagicLinkRequest, { result: boolean, magicLink?: string }>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.GenerateMagicLink }),
    );
    export const CheckRole = AuthEndpoint.specify<AuthDtos.CheckRoleRequest, AuthDtos.BaseResponse>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.CheckRole }),
    );
    export const CheckInvite = AuthEndpoint.specify<AuthDtos.CheckInviteRequest, { result: boolean, token?: string }>(
        a => ({ ...a, type: AuthDtos.AuthActionTypes.CheckInvite }),
    );
    export const SendLinktoDesktop = AuthEndpoint.specify<void, AuthDtos.BaseResponse>(_ => ({ type: AuthDtos.AuthActionTypes.SendLinkToDesktop }));

    export const ForceLogin = AuthEndpoint.specify<AuthDtos.ForceLoginRequest, { token: string }>(a => ({ ...a, type: AuthDtos.AuthActionTypes.ForceLogin }));

    export const CreateUser = new FunctionDefinition<SignUpData, SignUpResult>('create', Namespace);
    export const CreateCoachUser = CreateUser.specify<ICoachSignUpData, SignUpCoachResult>(cd => ({ ...cd, role: UserRoles.Coach }));
    // can be called on each sign in to check whethere there's an active invite
    export const TryCreateClientUser = CreateUser.specify<void, SignUpClientResult>(() => ({ role: UserRoles.Client }));

    export const UpdateUserEndpoint = new FunctionDefinition<UpdateUserDtos.RequestDto, UpdateUserDtos.ResponseDto>('update', Namespace);
    export const UpdateUser = UpdateUserEndpoint.specify<UpdateUserDtos.EditProfile.Request, UpdateUserDtos.EditProfile.Respsonse>(a => ({ profile: a }));
    export const UpdateCoachProfile = UpdateUserEndpoint.specify<UpdateUserDtos.EditCoachProfile.Request, UpdateUserDtos.EditCoachProfile.Response>(a => ({ coach: a }));

    export const Onboard = UpdateUserEndpoint.specify<UpdateUserDtos.Onboard.Request, UpdateUserDtos.Onboard.Response>(a => ({ onboard: a }));
    export const AcceptConsent = UpdateUserEndpoint.specify<UpdateUserDtos.ConsentAccept.Request, UpdateUserDtos.ConsentAccept.Response>(a => ({ consent: a }));
    export const ShareRewardWithTherapist = UpdateUserEndpoint.specify<UpdateUserDtos.ShareReward.Request, UpdateUserDtos.ShareReward.Response>(a => ({ reward: a }));
}

export namespace Clients {
    export const Namespace = 'clients';

    export const JournalEndpoint = new FunctionDefinition<JournalDtos.JournalRequest, JournalDtos.JournalResponse>('journal', Namespace);
    export const EditJournalPrivacy = JournalEndpoint.specify<JournalDtos.JournalEditDto>();
    export const UploadJournal = JournalEndpoint.specify<JournalDtos.JournalUploadDto>();

    export const IntakeFormsEndpoint =
        new FunctionDefinition<IntakeFormsDtos.IntakeFormsRequest, IntakeFormsDtos.IntakeFormsResponse>('intakeforms', Namespace);
    export const AddIntakeFormResponse = IntakeFormsEndpoint.specify<IntakeFormsDtos.SubmitFormDto, { account: ClientAccountIded, entry: IntakeFormsDtos.IntakeFormsResponse }>();

    export const EventsEndpoint = new FunctionDefinition<EventsDtos.EventsRequestDto, EventsDtos.EventsResponseDto>('events', Namespace);
}

export namespace Coaches {
    export const Namespace = 'coaches';

    export const ClientAction = new FunctionDefinition<ClientsDtos.ClientsRequest, ClientsDtos.ClientsResponse>(
        'clientAction',
        Namespace,
    );
    export const AddClient = ClientAction.specify<Partial<ClientCard>, ClientsDtos.ClientsMainResponse>(a => ({ clientCardId: null, action: CoachClientActions.Add, data: a }));
    export const EditAssessments = ClientAction.specify<ClientsDtos.ClientsEditAssessmentDto, ClientsDtos.ClientsEditAssessmentResponse>(
        args => ({ clientCardId: args.clientCardId, action: CoachClientActions.EditAssessments, assessment: args.assessment }),
    );

    export const SessionsEndpoint = new FunctionDefinition<SessionsDtos.SessionsRequest, SessionsDtos.SessionsResponse>('sessions', Namespace, 540);
    export const CreateSession = SessionsEndpoint.specify<SessionsDtos.SessionsCreateDto, SessionsDtos.SessionsCreationResponse>();
    export const EditSession = SessionsEndpoint.specify<SessionsDtos.SessionsEditDto, SessionsDtos.SessionsEditResponse>();

    export const DocumentsEndpoint = new FunctionDefinition<DocumentDtos.DocumentRequest, DocumentDtos.DocumentResponse>('documents', Namespace);
    export const EditDocumentName = DocumentsEndpoint.specify<DocumentDtos.DocumentEditDto>();
    export const CreateDocument = DocumentsEndpoint.specify<DocumentDtos.DocumentCreateDto>();
    export const ShareDocumentLink = DocumentsEndpoint.specify<DocumentDtos.DocumentLinks.ChangeStatusRequest>();
    // called by a client
    export const MarkDocumentLinkAsSeen = DocumentsEndpoint.specify<DocumentDtos.DocumentLinks.MarkAsSeen>();

    export const TimeTrackingEndpoint = new FunctionDefinition<TimeTrackingDtos.TimeTrackingRequest, TimeTrackingDtos.TimeTrackingResponse>('timeTracking', Namespace);

    export const PromptsGeneralEndpoint = new FunctionDefinition<PromptsDtos.RequestDto, PromptsDtos.ResponseDto>('prompts', Namespace);
    export const EnsurePromptsLibrary = PromptsGeneralEndpoint.specify<PromptsDtos.EnsureLibraryRequest, { ok: boolean }>(
        _ => <PromptsDtos.EnsureLibraryRequestTyped>({ type: 'library' }),
    );

    export const UpdatePrompts = PromptsGeneralEndpoint.specify<PromptsDtos.PromptsRequest, PromptsDtos.PromptsResponse>(
        a => <PromptsDtos.PromptsRequestTyped>({ ...a, type: 'prompts' }),
    );
    export const UpdateInterventionTips = PromptsGeneralEndpoint.specify<PromptsDtos.TipsRequest, PromptsDtos.TipsResponse>(
        a => <PromptsDtos.TipsRequestTyped>({ ...a, type: 'tips' }),
    );
    export const UpdateGoals = PromptsGeneralEndpoint.specify<PromptsDtos.GoalsRequest, PromptsDtos.GoalsResponse>(
        a => <PromptsDtos.GoalsRequestTyped>({ ...a, type: 'goals' }),
    );
}

export namespace AI {
    export const Namespace = 'ai';

    export type ProcessArgs = {
        type: 'session' | 'journal',
        clientUid: string,
        accountId: string,
        entryId: string,
        force?: boolean,
    };

    export const ProcessAudioEntry = new FunctionDefinition<ProcessArgs, RecordDataIded>(
        'processEntry',
        Namespace,
        540,
        '512MB',
    );
}

export namespace Billing {
    export const Namespace = 'billing';
    export const UpdateBilling = new FunctionDefinition<{ token: string, plan: Plans, category?: PlansCategories }, { ok: boolean, error?: string }>
        ('update', Namespace);
}

export namespace QoL {
    export const Namespace = 'qol';
    export const QoLEndpoint = new FunctionDefinition<QoLDtos.QoLRequest, QoLDtos.QoLResponse>('admin', Namespace);
}
