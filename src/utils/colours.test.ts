import { describe, it, expect } from 'vitest';
import { interpolateColors, getStatusColor, type GoalStatus } from './colours';

// `@styles/variables.module.scss` is processed for real in the `unit` project (see the `css.include`
// in vite.config.ts), so `getStatusColor` reads the actual design tokens rather than a mock.

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

  it('interpolates channels independently', () => {
    expect(interpolateColors('#ff0000', '#00ff00', 1)).toEqual(['#ff0000', '#808000', '#00ff00']);
  });

  it('produces evenly spaced steps', () => {
    expect(interpolateColors('#000000', '#ffffff', 3)).toEqual([
      '#000000', '#404040', '#808080', '#bfbfbf', '#ffffff',
    ]);
  });

  it('interpolates downwards when the end colour is darker', () => {
    expect(interpolateColors('#ffffff', '#000000', 1)).toEqual(['#ffffff', '#808080', '#000000']);
  });

  it('returns the same colour repeatedly when both endpoints match', () => {
    expect(interpolateColors('#123456', '#123456', 2)).toEqual(['#123456', '#123456', '#123456', '#123456']);
  });

  it('accepts hex values without a leading #', () => {
    expect(interpolateColors('000000', 'ffffff', 1)).toEqual(['#000000', '#808080', '#ffffff']);
  });

  it('zero-pads single-digit channel values', () => {
    expect(interpolateColors('#000000', '#0f0f0f', 0)).toEqual(['#000000', '#0f0f0f']);
  });

  it('accepts uppercase hex and emits lowercase', () => {
    expect(interpolateColors('#FF0000', '#0000FF', 0)).toEqual(['#ff0000', '#0000ff']);
  });

  // The cases below record current behaviour for malformed input. They are not endorsements:
  // if the function is later hardened, update these to the new contract.
  describe('current behaviour for invalid input', () => {
    it('yields NaN channels for a non-hex colour, contaminating every step (including the endpoints)', () => {
      expect(interpolateColors('zzzzzz', '#ffffff', 1)).toEqual(['#NaNNaNNaN', '#NaNNaNNaN', '#NaNNaNNaN']);
    });

    it('yields NaN channels for an empty string', () => {
      expect(interpolateColors('', '', 1)).toEqual(['#NaNNaNNaN', '#NaNNaNNaN', '#NaNNaNNaN']);
    });

    it('does not expand 3-digit shorthand hex; the missing blue channel becomes NaN', () => {
      expect(interpolateColors('#fff', '#000', 1)).toEqual(['#ff0fNaN', '#8008NaN', '#0000NaN']);
    });

    it('returns a single NaN colour for steps of -1 (0 / 0)', () => {
      expect(interpolateColors('#000000', '#ffffff', -1)).toEqual(['#NaNNaNNaN']);
    });

    it.each([-2, -5])('returns an empty array for steps of %d', (steps) => {
      expect(interpolateColors('#000000', '#ffffff', steps)).toEqual([]);
    });

    it('truncates fractional steps rather than reaching the end colour (steps 0.5)', () => {
      expect(interpolateColors('#000000', '#ffffff', 0.5)).toEqual(['#000000', '#aaaaaa']);
    });

    it('truncates fractional steps rather than reaching the end colour (steps 1.5)', () => {
      expect(interpolateColors('#000000', '#ffffff', 1.5)).toEqual(['#000000', '#666666', '#cccccc']);
    });
  });
});

describe('getStatusColor', () => {
  const statuses: GoalStatus[] = ['stretch', 'success', 'warning', 'danger'];

  it.each(statuses)('returns a valid hex colour for %s', (status) => {
    expect(getStatusColor(status)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns a distinct colour for each status', () => {
    const colours = statuses.map(getStatusColor);

    expect(new Set(colours).size).toBe(statuses.length);
  });

  it('is defined for all four statuses', () => {
    statuses.forEach((status) => {
      expect(getStatusColor(status)).toBeTruthy();
    });
  });
});
