import { describe, it, expect } from 'vitest';
import * as library from './index';

// Explicit on purpose: adding a public export means updating this list, and a
// component silently dropped from the hand-maintained barrel fails loudly.
// Type-only exports (PaletteItem, TabItem, UseFormOptions, ...) are erased at
// runtime and can't be asserted here.
const EXPECTED_EXPORTS = [
  // Components
  'Button',
  'ButtonSelector',
  'Card',
  'CardCarousel',
  'ColourPalettePicker',
  'DateInput',
  'Footer',
  'Header',
  'InlineSelect',
  'Modal',
  'NumberInput',
  'RadioSelector',
  'Switch',
  'Tabs',
  'TextArea',
  'TextInput',
  'WeekSelector',
  // Layouts
  'MainLayout',
  // Hooks
  'useArraySelection',
  'useCanSideScroll',
  'useField',
  'useForm',
  'useMediaQuery',
  // Providers
  'FormProvider',
  'ThemeProvider',
  'useFormContext',
  'useTheme',
  // Utils
  'getStatusColor',
  'interpolateColors',
];

describe('public entry point', () => {
  it('exports exactly the intended public API', () => {
    expect(Object.keys(library).sort()).toEqual([...EXPECTED_EXPORTS].sort());
  });

  it.each(EXPECTED_EXPORTS)('%s is defined', (name) => {
    expect(library).toHaveProperty(name);
    expect((library as Record<string, unknown>)[name]).toBeDefined();
  });
});
