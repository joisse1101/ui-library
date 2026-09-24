import { useSyncExternalStore } from 'react';

const subscribe = (minWidth: number) => (callback: () => void) => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth + 1}px)`);
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = (minWidth: number) => () =>
    window.matchMedia(`(min-width: ${minWidth + 1}px)`).matches;

const getServerSnapshot = () => false;

export const useMediaQuery = (minWidth: number): boolean =>
    useSyncExternalStore(subscribe(minWidth), getSnapshot(minWidth), getServerSnapshot);
