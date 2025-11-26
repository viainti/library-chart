import { useSyncExternalStore } from 'react';

type PartialState<T> = Partial<T> | ((state: T) => Partial<T>);
type StateCreator<T> = (
  set: (partial: PartialState<T>) => void,
  get: () => T
) => T;

export function createStore<T>(creator: StateCreator<T>) {
  let state: T;
  const listeners = new Set<() => void>();

  const setState = (partial: PartialState<T>) => {
    const partialState = typeof partial === 'function' ? (partial as (state: T) => Partial<T>)(state) : partial;
    state = { ...state, ...partialState };
    listeners.forEach((listener) => listener());
  };

  const getState = () => state;

  state = creator(setState, getState);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const useStore = () => useSyncExternalStore(subscribe, getState, getState);

  (useStore as any).getState = getState;
  (useStore as any).setState = setState;

  return useStore as (() => T) & {
    getState: () => T;
    setState: (partial: PartialState<T>) => void;
  };
}
