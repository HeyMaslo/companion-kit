import { createLoader } from 'app/utils/ReactLoadable';

const MultiSelectLoader = createLoader({
    moduleLoader: () => import('app/components/MultiSelect'),
});

export default MultiSelectLoader;
