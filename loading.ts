import { StateCreator, StoreMutatorIdentifier } from 'zustand';

/** Sets "loading" flag to "true" on every function start and "false" on function end. Doesn't do this for function with name "setLoading"
 * @param {string[]} params.whitelist if specified, it will only add set({ loading }) to functions inside array. Every other store function will not get wrapped in "loading" setter
 * @default []
 * @example ['myFunc1', 'myFunc2']
 * @param {string[]} params.blacklist if specified, it will not add set({ loading }) to functions inside array. ex: ['someFunc', 'anotherFunc'] (ignored if whitelist is present)
 * @default ['setLoading']
 */
export const loading: <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [...Mps], Mcs>,
  params?: { blacklist?: string[]; whitelist?: string[] },
) => StateCreator<T, Mps, [...Mcs]> = (config, params) => (set, get, api) => {
  const { blacklist, whitelist = [] } = params || {};
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
        : !innerBlackList.includes(key))
    ) {
      store[key] = async (...args: any[]) => {
        try {
          set({ loading: true } as any);
          return await value(...args);
        } finally {
          set({ loading: false } as any);
        }
      };
    }
  });

  return store;
};
