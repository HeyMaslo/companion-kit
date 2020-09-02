import { inject } from 'mobx-react';
import { AppViewModel } from '.';

type KeyOfAVM = AppViewModel[keyof AppViewModel];

export type ViewModelInjector = (viewModel: AppViewModel) => KeyOfAVM;
export type ViewModelInjectorMulti = (viewModel: AppViewModel) => { [key: string]: KeyOfAVM };

export type ViewModelPartial<T extends KeyOfAVM> = { model?: T };

const getViewModel = (inner: ViewModelInjector) => {
    return (store: { viewModel: AppViewModel }) => ({
        model: store && store.viewModel && inner(store.viewModel),
    });
};

const getViewModelMulti = (inner: ViewModelInjectorMulti) => {
    return (store: { viewModel: AppViewModel }) => ({
        ...(store && store.viewModel && inner(store.viewModel)),
    });
};

export function injectViewModel(inner: ViewModelInjector) {
    return inject(getViewModel(inner));
}

export function injectViewModelsMulti(inner: ViewModelInjectorMulti) {
    return inject(getViewModelMulti(inner));
}
