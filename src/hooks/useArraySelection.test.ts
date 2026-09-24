import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArraySelection } from './useArraySelection';

describe('useArraySelection', () => {
  it('starts empty by default', () => {
    const { result } = renderHook(() => useArraySelection<string>());

    expect(result.current.selectedOptions).toEqual([]);
  });

  it('starts with the initial state when given', () => {
    const { result } = renderHook(() => useArraySelection(['a', 'b']));

    expect(result.current.selectedOptions).toEqual(['a', 'b']);
  });

  describe('toggleOption', () => {
    it('adds an option that is not selected, preserving order', () => {
      const { result } = renderHook(() => useArraySelection(['a']));

      act(() => { result.current.toggleOption('b'); });

      expect(result.current.selectedOptions).toEqual(['a', 'b']);
    });

    it('removes an option that is already selected', () => {
      const { result } = renderHook(() => useArraySelection(['a', 'b', 'c']));

      act(() => { result.current.toggleOption('b'); });

      expect(result.current.selectedOptions).toEqual(['a', 'c']);
    });

    it('toggling twice returns to the original selection', () => {
      const { result } = renderHook(() => useArraySelection(['a']));

      act(() => { result.current.toggleOption('b'); });
      act(() => { result.current.toggleOption('b'); });

      expect(result.current.selectedOptions).toEqual(['a']);
    });

    it('works with non-string values', () => {
      const { result } = renderHook(() => useArraySelection<number>([1]));

      act(() => { result.current.toggleOption(2); });
      act(() => { result.current.toggleOption(1); });

      expect(result.current.selectedOptions).toEqual([2]);
    });

    it('does not mutate the previous array', () => {
      const initial = ['a'];
      const { result } = renderHook(() => useArraySelection(initial));

      act(() => { result.current.toggleOption('b'); });

      expect(initial).toEqual(['a']);
    });
  });

  describe('clearSelection', () => {
    it('empties the selection', () => {
      const { result } = renderHook(() => useArraySelection(['a', 'b']));

      act(() => { result.current.clearSelection(); });

      expect(result.current.selectedOptions).toEqual([]);
    });
  });

  describe('setSelectedOptions', () => {
    it('replaces the selection wholesale', () => {
      const { result } = renderHook(() => useArraySelection(['a']));

      act(() => { result.current.setSelectedOptions(['x', 'y']); });

      expect(result.current.selectedOptions).toEqual(['x', 'y']);
    });
  });

  it('keeps stable callback identities across renders', () => {
    const { result } = renderHook(() => useArraySelection<string>());
    const { toggleOption, clearSelection } = result.current;

    act(() => { result.current.toggleOption('a'); });

    expect(result.current.toggleOption).toBe(toggleOption);
    expect(result.current.clearSelection).toBe(clearSelection);
  });
});
