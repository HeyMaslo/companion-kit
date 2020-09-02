import Identify from './Identify';
import { UserProfile, CoachProfile, ClientProfile } from '.';

export type ClientProfileFull = ClientProfile;

type FullUser = Identify<UserProfile> & { empty?: true, coach?: CoachProfile, client?: ClientProfileFull };

export default FullUser;
