import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, type ThemeProviderProps } from './ThemeProvider';
import { useTheme, type Theme } from './ThemeContext';

const renderTheme = (props: Omit<ThemeProviderProps, 'children'> = {}) =>
  renderHook(() => useTheme(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider {...props}>{children}</ThemeProvider>
    ),
  });

const dataTheme = () => document.documentElement.getAttribute('data-theme');

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  describe('uncontrolled', () => {
    it('defaults to dark', () => {
      const { result } = renderTheme();

      expect(result.current.theme).toBe('dark');
      expect(dataTheme()).toBe('dark');
    });

    it('honours defaultTheme', () => {
      const { result } = renderTheme({ defaultTheme: 'light' });

      expect(result.current.theme).toBe('light');
      expect(dataTheme()).toBe('light');
    });

    it('setTheme updates the theme and data-theme', () => {
      const { result } = renderTheme();

      act(() => { result.current.setTheme('light'); });

      expect(result.current.theme).toBe('light');
      expect(dataTheme()).toBe('light');
    });
  });

  describe('controlled', () => {
    it('uses the theme prop over defaultTheme', () => {
      const { result } = renderTheme({ theme: 'light', defaultTheme: 'dark' });

      expect(result.current.theme).toBe('light');
      expect(dataTheme()).toBe('light');
    });

    it('setTheme calls onThemeChange without changing the theme itself', () => {
      const onThemeChange = vi.fn();
      const { result } = renderTheme({ theme: 'dark', onThemeChange });

      act(() => { result.current.setTheme('light'); });

      expect(onThemeChange).toHaveBeenCalledExactlyOnceWith('light');
      expect(result.current.theme).toBe('dark');
      expect(dataTheme()).toBe('dark');
    });

    it('does not throw when setTheme is called without onThemeChange', () => {
      const { result } = renderTheme({ theme: 'dark' });

      expect(() => act(() => { result.current.setTheme('light'); })).not.toThrow();
      expect(result.current.theme).toBe('dark');
    });

    it('follows the theme prop when the parent changes it', () => {
      let theme: Theme = 'dark';
      const { result, rerender } = renderHook(() => useTheme(), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        ),
      });
      expect(dataTheme()).toBe('dark');

      theme = 'light';
      rerender();

      expect(result.current.theme).toBe('light');
      expect(dataTheme()).toBe('light');
    });
  });
});

describe('useTheme', () => {
  it('throws outside a ThemeProvider', () => {
    // React logs the thrown render error to console.error; silence it for a clean run.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');

    spy.mockRestore();
  });
});
