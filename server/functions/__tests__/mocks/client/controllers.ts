import AuthControllerBase from '../../../../../common/controllers/AuthController';
import StorageMock from './storage';

export class ClientAuthController extends AuthControllerBase {

    get targetRole(): any {
        throw new Error('Method not implemented.');
    }
    get locationUrl(): string {
        throw new Error('Method not implemented.');
    }
    protected get Storage(): any {
        return StorageMock;
    }
    signInWithEmailLink(email: string, reason: any): Promise<void> {
        throw new Error('Method not implemented.');
    }
    protected googleSignOut(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected async servicesSignOut() {
        return;
    }
}
