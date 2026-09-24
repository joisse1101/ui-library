import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useField } from './useField';
import { useForm, type FormRules } from './useForm';
import { FormProvider } from '../providers/FormProvider';

interface Values {
  name: string;
  email: string;
}

const defaultValues: Values = { name: 'Sam', email: '' };
const rules: FormRules<Values> = { email: { required: 'Email is required' } };

// Renders `useField` under a FormProvider and exposes the form alongside it, so tests
// can assert both directions: the field reads form state and writes through to it.
function renderWithForm(fieldName?: string, standaloneValue?: string) {
  // Two hooks that must share one render tree: build the form in an outer hook, then
  // render the field hook inside a FormProvider wrapper fed by that form's latest value.
  const formHook = renderHook(() => useForm<Values>({ defaultValues, rules }));

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <FormProvider form={formHook.result.current}>{children}</FormProvider>
  );
  const fieldHook = renderHook(
    () => useField<string>({ name: fieldName, value: standaloneValue }),
    { wrapper: Wrapper },
  );

  // Re-render the field so it picks up the form's latest state after each form update.
  const refresh = () => fieldHook.rerender();
  return { formHook, fieldHook, refresh };
}

describe('useField', () => {
  describe('form-bound mode (name + FormProvider)', () => {
    it("reads the field's value from the form", () => {
      const { fieldHook } = renderWithForm('name');

      expect(fieldHook.result.current.value).toBe('Sam');
    });

    it("reads the field's error from the form", () => {
      const { formHook, fieldHook, refresh } = renderWithForm('email');
      expect(fieldHook.result.current.error).toBeUndefined();

      act(() => { formHook.result.current.validate(); });
      refresh();

      expect(fieldHook.result.current.error).toBe('Email is required');
    });

    it('setValue writes through to the form and clears that field error', () => {
      const { formHook, fieldHook, refresh } = renderWithForm('email');
      act(() => { formHook.result.current.validate(); });
      refresh();
      expect(fieldHook.result.current.error).toBe('Email is required');

      act(() => { fieldHook.result.current.setValue('a@b.co'); });
      refresh();

      expect(formHook.result.current.values.email).toBe('a@b.co');
      expect(fieldHook.result.current.value).toBe('a@b.co');
      expect(fieldHook.result.current.error).toBeUndefined();
    });

    it('ignores the standalone `value` option when bound', () => {
      const { fieldHook } = renderWithForm('name', 'ignored');

      expect(fieldHook.result.current.value).toBe('Sam');
    });
  });

  describe('standalone passthrough', () => {
    it('returns the given value when there is no `name`, even inside a provider', () => {
      const { fieldHook } = renderWithForm(undefined, 'own value');

      expect(fieldHook.result.current.value).toBe('own value');
      expect(fieldHook.result.current.error).toBeUndefined();
    });

    it('does not touch the form when there is no `name`', () => {
      const { formHook, fieldHook, refresh } = renderWithForm(undefined, 'own value');

      act(() => { fieldHook.result.current.setValue('changed'); });
      refresh();

      expect(formHook.result.current.values).toEqual(defaultValues);
    });

    it('returns the given value when there is a `name` but no provider', () => {
      const { result } = renderHook(() => useField<string>({ name: 'name', value: 'own value' }));

      expect(result.current.value).toBe('own value');
      expect(result.current.error).toBeUndefined();
    });

    it('setValue is a no-op when standalone', () => {
      const { result } = renderHook(() => useField<string>({ value: 'own value' }));

      expect(() => act(() => { result.current.setValue('changed'); })).not.toThrow();
      expect(result.current.value).toBe('own value');
    });
  });
});
