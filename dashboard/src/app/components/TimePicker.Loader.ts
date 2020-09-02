import { createLoader } from 'app/utils/ReactLoadable';

const TimePickerLoader = createLoader({
    moduleLoader: () => import('app/components/TimePicker'),
});

export default TimePickerLoader;
