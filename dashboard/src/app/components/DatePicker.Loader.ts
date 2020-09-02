import { createLoader } from 'app/utils/ReactLoadable';

export const DatePicker = createLoader({
    moduleLoader: async () => (await import('./DatePicker')).DatePicker,
});

export const DatePickerObservable = createLoader({
    moduleLoader: async () => (await import('./DatePicker')).DatePickerObservable,
});
