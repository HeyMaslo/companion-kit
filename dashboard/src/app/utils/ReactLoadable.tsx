import React from 'react';

type LibrariesLoaders<T extends { [k: string]: any }> = {
    [P in keyof T]: () => Promise<T[P]>
};

type LoadingResult<T, TLibs> = TLibs & {
    module: React.ComponentType<T>,
};

type ModuleResult<T> = React.ComponentType<T> | { default: React.ComponentType<T> };
namespace ModuleResult {
    export function isDefault<T>(m: ModuleResult<T>): m is { default: React.ComponentType<T> } {
        return !!(m as { default: React.ComponentType<T>}).default;
    }
}

type LoaderConfig<T, TLibs = {}> = {
    moduleLoader: () => Promise<ModuleResult<T>>,
    loading?: React.ComponentType,

    libraries?: LibrariesLoaders<TLibs>,

    onLoadedAll?: (loaded: LoadingResult<T, TLibs>) => any,

    render?: (loaded: LoadingResult<T, TLibs>) => JSX.Element;
};

// const logger = createLogger('[Loadable]');

export function createLoader<TProps = {}, TLibs extends { [k: string]: any } = { }>(config: LoaderConfig<TProps, TLibs>) {

    const loadAll: () => Promise<LoadingResult<TProps, TLibs>> = async () => {
        const [ mm, libs ] = await Promise.all([
            config.moduleLoader(),

            (async () => {
                if (!config.libraries) {
                    return { } as TLibs;
                }

                const libLoaded = await Promise.all(Object.keys(config.libraries || []).map(async (key: keyof LibrariesLoaders<TLibs>) => {
                    return ({
                        key,
                        value: await config.libraries[key](),
                    });
                }));

                return libLoaded.reduce((res, l) => {
                    res[l.key] = l.value;
                    return res;
                }, { } as TLibs);
            })(),
        ]);

        const result = {
            ...libs,
            module: ModuleResult.isDefault(mm) ? mm.default : mm,
        };

        if (config.onLoadedAll) {
            config.onLoadedAll(result);
        }

        return result;
    };

    return function LoaderWrapper(this: never, props: TProps) {

        const [state, setState] = React.useState(() => ({ result: null as LoadingResult<TProps, TLibs> }));

        React.useEffect(() => {
            let mounted = true;
            loadAll().then(m => {
                if (mounted) {
                    setState({ result: m });
                }
            });

            return () => {
                mounted = false;
            };
        }, []);

        if (!state.result) {
            const Loading = config.loading;
            if (Loading) {
                return <Loading />;
            }

            return null;
        }

        if (config.render) {
            return config.render(state.result);
        }

        const Module = state.result.module;
        if (Module) {
            return <Module {...props} />;
        }
    };
}
