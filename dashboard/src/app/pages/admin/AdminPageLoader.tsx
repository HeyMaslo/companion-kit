import { createLoader } from 'app/utils/ReactLoadable';

const AdminPageLoader = createLoader({
    moduleLoader: () => import('./AdminPage'),
});

export { AdminPageLoader };
