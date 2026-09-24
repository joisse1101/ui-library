import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm, type FormRules } from './useForm';

interface Values {
  name: string;
  email: string;
  age: number;
  tags: string[];
}

const defaultValues: Values = { name: '', email: '', age: 0, tags: [] };

// Rules are hoisted so their identity is stable across renders, like a consumer's module-level config.
const setup = (rules: FormRules<Values> = {}, defaults: Values = defaultValues) =>
  renderHook(() => useForm<Values>({ defaultValues: defaults, rules }));

describe('useForm', () => {
  describe('initial state', () => {
    it('starts with the default values and no errors', () => {
      const { result } = setup();

      expect(result.current.values).toEqual(defaultValues);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('required', () => {
    const rules: FormRules<Values> = {
      name: { required: 'Name is required' },
      tags: { required: 'Pick at least one tag' },
      age: { required: 'Age is required' },
    };

    it.each([
      ['an empty string', ''],
      ['a whitespace-only string', '   '],
    ])('errors when a string field is %s', (_label, value) => {
      const { result } = setup(rules, { ...defaultValues, name: value, tags: ['a'], age: 1 });

      let valid = true;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(false);
      expect(result.current.errors).toEqual({ name: 'Name is required' });
    });

    it('errors when an array field is empty', () => {
      const { result } = setup(rules, { ...defaultValues, name: 'x', age: 1, tags: [] });

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual({ tags: 'Pick at least one tag' });
    });

    it('errors when a number field is NaN', () => {
      const { result } = setup(rules, { ...defaultValues, name: 'x', tags: ['a'], age: NaN });

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual({ age: 'Age is required' });
    });

    it('treats 0 as a filled-in number', () => {
      const { result } = setup(rules, { ...defaultValues, name: 'x', tags: ['a'], age: 0 });

      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  describe('pattern', () => {
    const rules: FormRules<Values> = {
      email: { pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } },
    };

    it('errors when the value does not match', () => {
      const { result } = setup(rules, { ...defaultValues, email: 'nope' });

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual({ email: 'Invalid email' });
    });

    it('passes when the value matches', () => {
      const { result } = setup(rules, { ...defaultValues, email: 'a@b.co' });

      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
    });
  });

  describe('min / max', () => {
    const rules: FormRules<Values> = {
      age: {
        min: { value: 18, message: 'Too young' },
        max: { value: 65, message: 'Too old' },
      },
    };

    it.each([
      [10, { age: 'Too young' }],
      [70, { age: 'Too old' }],
    ])('errors for age %d', (age, expected) => {
      const { result } = setup(rules, { ...defaultValues, age });

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual(expected);
    });

    it.each([18, 30, 65])('accepts age %d (bounds are inclusive)', (age) => {
      const { result } = setup(rules, { ...defaultValues, age });

      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
    });
  });

  describe('custom validate', () => {
    it('returns the custom error message', () => {
      const rules: FormRules<Values> = {
        name: { validate: (value) => (value === 'admin' ? 'Reserved name' : undefined) },
      };
      const { result } = setup(rules, { ...defaultValues, name: 'admin' });

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual({ name: 'Reserved name' });
    });

    it('receives the whole form values for cross-field checks', () => {
      const validate = vi.fn((value: string, values: Record<string, unknown>) =>
        value === values.name ? 'Email must differ from name' : undefined);
      const initial = { ...defaultValues, name: 'sam', email: 'sam' };
      const { result } = setup({ email: { validate } }, initial);

      act(() => { result.current.validate(); });

      expect(validate).toHaveBeenCalledWith('sam', initial);
      expect(result.current.errors).toEqual({ email: 'Email must differ from name' });
    });

    it('runs even when the value is empty (unlike pattern/min/max)', () => {
      const validate = vi.fn(() => 'always');
      const { result } = setup({ name: { validate } }, defaultValues);

      act(() => { result.current.validate(); });

      expect(validate).toHaveBeenCalled();
      expect(result.current.errors).toEqual({ name: 'always' });
    });
  });

  describe('skipping non-required rules on empty values', () => {
    it('does not apply pattern to an empty optional field', () => {
      const rules: FormRules<Values> = {
        email: { pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } },
      };
      const { result } = setup(rules, { ...defaultValues, email: '' });

      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('does not apply min/max to a NaN optional number', () => {
      const rules: FormRules<Values> = {
        age: { min: { value: 18, message: 'Too young' }, max: { value: 65, message: 'Too old' } },
      };
      const { result } = setup(rules, { ...defaultValues, age: NaN });

      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
    });
  });

  describe('rule precedence', () => {
    it('reports required before pattern', () => {
      const rules: FormRules<Values> = {
        email: {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+$/, message: 'Invalid email' },
        },
      };
      const { result } = setup(rules);

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual({ email: 'Email is required' });
    });
  });

  describe('validate()', () => {
    it('collects errors for every failing field', () => {
      const rules: FormRules<Values> = {
        name: { required: 'Name is required' },
        email: { required: 'Email is required' },
      };
      const { result } = setup(rules);

      act(() => { result.current.validate(); });

      expect(result.current.errors).toEqual({
        name: 'Name is required',
        email: 'Email is required',
      });
    });

    it('clears previous errors once everything passes', () => {
      const rules: FormRules<Values> = { name: { required: 'Name is required' } };
      const { result } = setup(rules);

      act(() => { result.current.validate(); });
      expect(result.current.errors).toEqual({ name: 'Name is required' });

      act(() => { result.current.setValue('name', 'Sam'); });
      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('ignores fields that have no rules', () => {
      const { result } = setup({ name: { required: 'Name is required' } }, { ...defaultValues, name: 'x' });

      let valid = false;
      act(() => { valid = result.current.validate(); });

      expect(valid).toBe(true);
    });
  });

  describe('setValue / getValue', () => {
    it('updates the value and exposes it via getValue', () => {
      const { result } = setup();

      act(() => { result.current.setValue('name', 'Sam'); });

      expect(result.current.values.name).toBe('Sam');
      expect(result.current.getValue('name')).toBe('Sam');
    });

    it("clears only that field's error", () => {
      const rules: FormRules<Values> = {
        name: { required: 'Name is required' },
        email: { required: 'Email is required' },
      };
      const { result } = setup(rules);

      act(() => { result.current.validate(); });
      expect(Object.keys(result.current.errors).sort()).toEqual(['email', 'name']);

      act(() => { result.current.setValue('name', 'Sam'); });

      expect(result.current.errors).toEqual({ email: 'Email is required' });
    });

    it('does not re-validate on change (the error is cleared, not recomputed)', () => {
      const rules: FormRules<Values> = { email: { pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } } };
      const { result } = setup(rules, { ...defaultValues, email: 'bad' });

      act(() => { result.current.validate(); });
      act(() => { result.current.setValue('email', 'still bad'); });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('reset', () => {
    it('restores the default values and clears errors', () => {
      const rules: FormRules<Values> = { email: { required: 'Email is required' } };
      const { result } = setup(rules);

      act(() => { result.current.setValue('name', 'Sam'); });
      act(() => { result.current.validate(); });
      expect(result.current.errors).not.toEqual({});

      act(() => { result.current.reset(); });

      expect(result.current.values).toEqual(defaultValues);
      expect(result.current.errors).toEqual({});
    });

    it('applies explicit values when given', () => {
      const { result } = setup();
      const next: Values = { name: 'Alex', email: 'a@b.co', age: 40, tags: ['x'] };

      act(() => { result.current.reset(next); });

      expect(result.current.values).toEqual(next);
    });
  });

  describe('handleSubmit', () => {
    it('calls preventDefault and onValid with the values when valid', () => {
      const onValid = vi.fn();
      const preventDefault = vi.fn();
      const { result } = setup({ name: { required: 'Name is required' } }, { ...defaultValues, name: 'Sam' });

      act(() => { result.current.handleSubmit(onValid)({ preventDefault }); });

      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(onValid).toHaveBeenCalledTimes(1);
      expect(onValid).toHaveBeenCalledWith({ ...defaultValues, name: 'Sam' });
    });

    it('calls preventDefault but not onValid when invalid, and surfaces the errors', () => {
      const onValid = vi.fn();
      const preventDefault = vi.fn();
      const { result } = setup({ name: { required: 'Name is required' } });

      act(() => { result.current.handleSubmit(onValid)({ preventDefault }); });

      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(onValid).not.toHaveBeenCalled();
      expect(result.current.errors).toEqual({ name: 'Name is required' });
    });

    it('works without an event', () => {
      const onValid = vi.fn();
      const { result } = setup();

      act(() => { result.current.handleSubmit(onValid)(); });

      expect(onValid).toHaveBeenCalledWith(defaultValues);
    });
  });
});
