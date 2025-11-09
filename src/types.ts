import { StateCreator, StoreMutatorIdentifier } from 'zustand';

/** Parameters accepted by the loading middleware */
export type LoadingParams = {
  /** If provided, only functions listed here will be wrapped with loading setter */
  whitelist?: string[];
  /** If provided, functions listed here will NOT be wrapped (ignored when whitelist is present) */
  blacklist?: string[];
  /** Name of the boolean property that will be set to true/false (defaults to "loading") */
  loadingVarName?: string;
};

export type LoadingMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, [...Mps], Mcs>,
  params?: LoadingParams,
) => StateCreator<T, Mps, [...Mcs]>;

/** Helper type that represents a store extended with a loading boolean property.
 * Default property name is "loading" but can be overridden with the K generic.
 */
export type WithLoading<T, K extends string = 'loading'> = T & Record<K, boolean>;

export default LoadingMiddleware;
