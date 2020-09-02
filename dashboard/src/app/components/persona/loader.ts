
import { createLoader } from 'app/utils/ReactLoadable';

export const PersonaComponentLoader = createLoader({
    moduleLoader: () => import('./PersonaComponent'),
});
