import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './display';

type Listener = () => void;

interface StubbedQuery {
  query: string;
  matches: boolean;
  listeners: Set<Listener>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

// jsdom has no `matchMedia`. This stub keeps one record per query string and lets a test
// flip `matches` and fire the registered `change` listeners, like a viewport resize would.
let queries: Map<string, StubbedQuery>;
let viewportMatches: boolean;

const stubMatchMedia = () => {
  queries = new Map();
  vi.stubGlobal('matchMedia', (query: string) => {
    let entry = queries.get(query);
    if (!entry) {
      const listeners = new Set<Listener>();
      entry = {
        query,
        listeners,
        get matches() { return viewportMatches; },
        addEventListener: vi.fn((_type: string, cb: Listener) => { listeners.add(cb); }),
        removeEventListener: vi.fn((_type: string, cb: Listener) => { listeners.delete(cb); }),
      } as StubbedQuery;
      queries.set(query, entry);
    }
    return entry;
  });
};

const setViewport = (matches: boolean) => {
  viewportMatches = matches;
  queries.forEach((q) => q.listeners.forEach((cb) => cb()));
};

describe('useMediaQuery', () => {
  beforeEach(() => {
    viewportMatches = false;
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('queries min-width one pixel above the given breakpoint', () => {
    renderHook(() => useMediaQuery(768));

    expect([...queries.keys()]).toContain('(min-width: 769px)');
  });

  it('returns true initially when the query matches', () => {
    viewportMatches = true;

    const { result } = renderHook(() => useMediaQuery(768));

    expect(result.current).toBe(true);
  });

  it('returns false initially when the query does not match', () => {
    const { result } = renderHook(() => useMediaQuery(768));

    expect(result.current).toBe(false);
  });

  it('updates when a change event fires', () => {
    const { result } = renderHook(() => useMediaQuery(768));
    expect(result.current).toBe(false);

    act(() => { setViewport(true); });
    expect(result.current).toBe(true);

    act(() => { setViewport(false); });
    expect(result.current).toBe(false);
  });

  it('subscribes to change events on mount', () => {
    renderHook(() => useMediaQuery(768));

    const entry = queries.get('(min-width: 769px)')!;
    expect(entry.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(entry.listeners.size).toBe(1);
  });

  it('removes its listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery(768));
    const entry = queries.get('(min-width: 769px)')!;
    expect(entry.listeners.size).toBe(1);

    unmount();

    expect(entry.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(entry.listeners.size).toBe(0);
  });
});
