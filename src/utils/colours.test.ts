import { describe, it, expect, vi } from 'vitest';
import { interpolateColors, getStatusColor } from './colours';

// Vitest doesn't process SCSS, so the design-token module resolves to `{}`.
// Mock it with known values to assert the status -> token mapping.
vi.mock('@styles/variables.module.scss', () => ({
  default: {
    colorStretch: '#stretch',
    colorSuccess: '#success',
    colorWarning: '#warning',
    colorDanger: '#danger',
  },
}));

describe('interpolateColors', () => {
  it('returns steps + 2 colours including both endpoints', () => {
    const result = interpolateColors('#000000', '#ffffff', 3);

    expect(result).toHaveLength(5);
    expect(result[0]).toBe('#000000');
    expect(result[4]).toBe('#ffffff');
  });

  it('returns only the endpoints when steps is 0', () => {
    expect(interpolateColors('#102030', '#405060', 0)).toEqual(['#102030', '#405060']);
  });

  it('interpolates linearly per channel', () => {
    expect(interpolateColors('#000000', '#ffffff', 1)).toEqual(['#000000', '#808080', '#ffffff']);
    expect(interpolateColors('#ff0000', '#0000ff', 1)).toEqual(['#ff0000', '#800080', '#0000ff']);
  });

  it('accepts hex values without a leading #', () => {
    expect(interpolateColors('000000', 'ffffff', 1)).toEqual(['#000000', '#808080', '#ffffff']);
  });
});

describe('getStatusColor', () => {
  it.each([
    ['stretch', '#stretch'],
    ['success', '#success'],
    ['warning', '#warning'],
    ['danger', '#danger'],
  ] as const)('maps %s to its design token', (status, expected) => {
    expect(getStatusColor(status)).toBe(expected);
  });
});
