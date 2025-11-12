import { StateCreator, StoreMutatorIdentifier } from 'zustand/vanilla';

interface LoadingOptions {
  /**
   * If specified, it will only add set({ loading }) to functions inside array.
   * Every other store function will not get wrapped in "loading" setter.
   * @default []
   * @example ['myFunc1', 'myFunc2']
   */
  whitelist?: string[];

  /**
   * (NOTE: ignored if whitelist is present)
   * Specify functions that you don't want to get wrapped in loading setter.
   * @default ['setLoading']
   * @example ['someFunc', 'anotherFunc']
   */
  blacklist?: string[];

  /**
   * Change what boolean variable will be set to true/false on function start/end.
   * @default "loading"
   * @example 'isLoading'
   */
  loadingVarName?: string;

  /**
   * Apply middleware only to async functions (uses simple check, not guaranteed to work)
   * @default "false"
   * @platform web
   */
  onlyAsyncWebExperimental?: boolean;
}

/**
 * Sets "loading" flag to "true" on every function start and "false" on function end.
 * Doesn't do this for function with name "setLoading"
 */
export const loading: <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [...Mps], Mcs>,
  options?: LoadingOptions,
) => StateCreator<T, Mps, [...Mcs]> = (config, options) => (set, get, api) => {
  const {
    blacklist,
    whitelist = [],
    loadingVarName,
    onlyAsyncWebExperimental,
  } = options || {};
  const store: any = config(set, get, api);

  const innerBlackList = blacklist
    ? [...blacklist, 'setLoading'] // adding 'setLoading' by default (name can be different) because if your function has a call "setLoading(true)" at the start - it will set "loading" back to "false" instantly and whole middleware will not work
    : ['setLoading'];

  Object.keys(store).forEach((key) => {
    const value = store[key];

    if (
      typeof value === 'function' &&
      (whitelist?.length
        ? whitelist.includes(key)
        : !innerBlackList.includes(key)) &&
        onlyAsyncWebExperimental ? value.constructor.name === 'AsyncFunction' : true
    ) {
      store[key] = async (...args: any[]) => {
        try {
          set({ [loadingVarName || 'loading']: true } as any);
          return await value(...args);
        } finally {
          set({ [loadingVarName || 'loading']: false } as any);
        }
      };
    }
  });

  return store;
};
