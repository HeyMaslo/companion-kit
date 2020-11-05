import StorageAsync from 'src/services/StorageAsync';

export class PersonaViewModel {
    get storage() { return StorageAsync; }

    async getSoundState(): Promise<boolean> {
        const localSoundEffect = await this.storage.getValue('soundEffect');
        if (localSoundEffect === null) {
           return false;
        }
        if (localSoundEffect === 'true') {
            return true;
        }
        if (localSoundEffect === 'false') {
            return false;
        }
    }
}