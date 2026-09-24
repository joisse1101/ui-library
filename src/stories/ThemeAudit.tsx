import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@components/Button';
import { ButtonSelector } from '@components/ButtonSelector';
import { Card } from '@components/Card';
import { CardCarousel } from '@components/CardCarousel';
import { ColourPalettePicker } from '@components/ColourPalettePicker';
import { DateInput } from '@components/DateInput';
import { Footer } from '@components/Footer';
import { Header } from '@components/Header';
import { InlineSelect } from '@components/InlineSelect';
import { Modal } from '@components/Modal';
import { NumberInput } from '@components/NumberInput';
import { RadioSelector } from '@components/RadioSelector';
import { Switch } from '@components/Switch';
import { Tabs } from '@components/Tabs';
import { TextArea } from '@components/TextArea';
import { TextInput } from '@components/TextInput';
import modalStyles from '../components/Modal/Modal.module.scss';
import { useTheme } from '../providers/ThemeContext';

/**
 * Internal Storybook helper (not exported from the library) that renders every themeable
 * surface in one place so the light/dark palettes can be tuned against real components.
 *
 * Each panel scopes `data-theme` on its own wrapper, so light and dark can be shown side by
 * side regardless of the toolbar's global theme.
 */

export type AuditTheme = 'global' | 'light' | 'dark' | 'side-by-side';

// ==========================================================================
// Colour maths
// ==========================================================================

interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

/** Resolves any CSS colour expression (incl. `var()` and `rgb(var(--x-rgb) / a)`) inside `scope`. */
function resolveColour(scope: HTMLElement, expr: string): RGBA | null {
    const probe = document.createElement('span');
    probe.style.color = expr;
    scope.appendChild(probe);
    const computed = getComputedStyle(probe).color;
    scope.removeChild(probe);

    const match = computed.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const [r, g, b, a] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a: a ?? 1 };
}

function composite(top: RGBA, base: RGBA): RGBA {
    const a = top.a + base.a * (1 - top.a);
    const mix = (t: number, b: number) => (t * top.a + b * base.a * (1 - top.a)) / (a || 1);
    return { r: mix(top.r, base.r), g: mix(top.g, base.g), b: mix(top.b, base.b), a };
}

function luminance({ r, g, b }: RGBA): number {
    const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg: RGBA, bg: RGBA): number {
    const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

function toHex(c: RGBA): string {
    const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    const base = `#${h(c.r)}${h(c.g)}${h(c.b)}`;
    return c.a < 1 ? `${base}${h(c.a * 255)}` : base;
}

// ==========================================================================
// Token catalogue
// ==========================================================================

interface TokenDef {
    name: string;
    used: string;
    /** Nothing in this repo reads this token via `var()` — may still be used downstream. */
    unused?: boolean;
}

interface TokenGroup {
    title: string;
    tokens: TokenDef[];
}

const COLOUR_GROUPS: TokenGroup[] = [
    {
        title: 'Backgrounds',
        tokens: [
            { name: '--bg-main', used: 'Page floor, output-log card, hex chips, scrollbar track, modal backdrop, carousel fade' },
            { name: '--bg-surface', used: 'Cards, modal, header/footer, active tab, code blocks, accordion' },
            { name: '--bg-surface-hover', used: 'Secondary/option/tab hover, selected option, palette row hover' },
            { name: '--bg-overlay', used: 'Inline code, mobile nav dropdown, tab badge' },
            { name: '--bg-glass', used: 'Glass panels', unused: true },
        ],
    },
    {
        title: 'Text',
        tokens: [
            { name: '--text-main', used: 'Body, headings, inputs, secondary/ghost hover labels' },
            { name: '--text-muted', used: 'Paragraphs, labels, nav links, ghost button, card copy' },
            { name: '--text-dim', used: 'Placeholders, code comments, hints, switch thumb, scrollbar hover' },
            { name: '--text-on-accent', used: 'Primary button label (on --brand-accent/hover/active fills)' },
        ],
    },
    {
        title: 'Brand',
        tokens: [
            { name: '--brand-accent', used: 'Primary button fill, radio/switch on, input icons, header/footer rule, rose card border' },
            { name: '--brand-hover', used: 'Primary button hover fill' },
            { name: '--brand-active', used: 'Primary button pressed' },
            { name: '--brand-text', used: 'Accent as text: links, selected radio label, inline code, picker summary' },
            { name: '--brand-text-hover', used: 'Link/nav/picker hover text' },
            { name: '--brand-border-strong', used: 'Primary button border' },
            { name: '--brand-border-muted', used: 'Textarea <kbd> border' },
            { name: '--accent-pink-soft', used: 'Syntax highlight functions/built-ins (.nf, .nb) - text, not a fill' },
            { name: '--syntax-keyword', used: 'Syntax highlight keywords (.k, .kd, .kn)' },
            { name: '--syntax-string', used: 'Syntax highlight strings (.s1, .s2, .si)' },
            { name: '--brand-surface-subtle', used: 'Soft container / badge fill', unused: true },
            { name: '--brand-text-dark', used: 'Text on soft pink fills', unused: true },
            { name: '--brand-disabled', used: 'Disabled input icon stroke' },
        ],
    },
    {
        title: 'Feedback',
        tokens: [
            { name: '--color-success', used: 'Success button text/tint, toast icon' },
            { name: '--color-danger', used: 'Danger buttons, error messages, picker delete' },
            { name: '--color-warning', used: 'Warning states', unused: true },
            { name: '--color-info', used: 'Info states', unused: true },
            { name: '--color-stretch', used: 'Stretch accent', unused: true },
            { name: '--disabled-bg', used: 'Disabled button/input/switch/radio fill' },
            { name: '--disabled-text', used: 'Disabled button/tab/label text' },
        ],
    },
    {
        title: 'Borders',
        tokens: [
            { name: '--border-subtle', used: 'Card/header/footer/tabs/modal dividers, secondary button' },
            { name: '--border-color', used: 'Form card, modal, hovered card, scrollbar thumb, picker preview' },
            { name: '--border-focus', used: 'Focus rings/borders on buttons, input-card, picker rows' },
            { name: '--border-hover', used: 'Hover borders', unused: true },
            { name: '--border-active', used: 'Pressed borders', unused: true },
        ],
    },
    {
        title: 'Inputs',
        tokens: [
            { name: '--input-bg', used: 'Text/number/date/select fields, radio, switch track' },
            { name: '--input-border', used: 'Field outline, radio, switch track' },
            { name: '--input-focus-border', used: 'Field focus border' },
            { name: '--input-focus-ring', used: 'Field/radio/switch focus ring (translucent)' },
        ],
    },
    {
        title: 'Toast icon tints',
        tokens: [
            { name: '--toast-success-icon', used: 'Sonner success icon' },
            { name: '--toast-warning-icon', used: 'Sonner warning icon' },
            { name: '--toast-danger-icon', used: 'Sonner error icon' },
            { name: '--toast-info-icon', used: 'Sonner info icon' },
        ],
    },
];

/** Theme-invariant chips: declared once on `:root`, identical in both themes. */
const INVARIANT_TOKENS: TokenDef[] = [
    { name: '--color-success-bg', used: 'Toast success fill' },
    { name: '--color-success-text', used: 'Toast success text/border' },
    { name: '--color-warning-bg', used: 'Toast warning fill' },
    { name: '--color-warning-text', used: 'Toast warning text/border' },
    { name: '--color-danger-bg', used: 'Toast error fill' },
    { name: '--color-danger-text', used: 'Toast error text/border' },
    { name: '--color-info-bg', used: 'Toast info fill' },
    { name: '--color-info-text', used: 'Toast info text/border' },
];

/** `-rgb` triplets are hand-copied from their hex twin; if the two drift, alpha-tinted surfaces silently mismatch. */
const RGB_PAIRS: { rgb: string; hex: string; used: string }[] = [
    { rgb: '--bg-main-rgb', hex: '--bg-main', used: 'Modal backdrop, carousel fade' },
    { rgb: '--bg-surface-hover-rgb', hex: '--bg-surface-hover', used: 'Ghost button hover' },
    { rgb: '--bg-glass-rgb', hex: '--bg-glass', used: '(rgb only; hex carries alpha)' },
    { rgb: '--border-subtle-rgb', hex: '--border-subtle', used: 'Ghost button border' },
    { rgb: '--brand-accent-rgb', hex: '--brand-accent', used: 'Rose card fill' },
    { rgb: '--brand-border-strong-rgb', hex: '--brand-border-strong', used: 'Primary hover border' },
    { rgb: '--color-success-rgb', hex: '--color-success', used: 'Success button tints' },
    { rgb: '--color-danger-rgb', hex: '--color-danger', used: 'Danger button tints, picker delete' },
];

const SHADOW_TOKENS: TokenDef[] = [
    { name: '--shadow-sm', used: 'Base card, switch thumb, picker rows' },
    { name: '--shadow-md', used: 'Global .card' },
    { name: '--shadow-lg', used: 'Modal, mobile nav dropdown' },
    { name: '--shadow-glow-md', used: 'Tab hover' },
    { name: '--shadow-glow', used: 'Card hover, primary hover, rose card' },
    { name: '--shadow-focus-ring', used: 'Button/tab focus' },
    { name: '--shadow-hover-glow', used: 'Colour input hover' },
    { name: '--shadow-text-sm', used: 'Button label' },
    { name: '--shadow-text', used: 'Heavier text shadow', unused: true },
];

// ==========================================================================
// Contrast checks — foreground/background pairs as the components actually use them
// ==========================================================================

interface ContrastPair {
    label: string;
    used: string;
    fg: string;
    bg: string;
    /** Backdrop for translucent `bg` values. */
    over?: string;
    /** `ui` = non-text (3:1); default is normal text (4.5:1). */
    kind?: 'ui';
}

const CONTRAST_PAIRS: ContrastPair[] = [
    { label: 'Body text', used: '.layout', fg: 'var(--text-main)', bg: 'var(--bg-main)' },
    { label: 'Card text', used: '.card, modal title, active tab', fg: 'var(--text-main)', bg: 'var(--bg-surface)' },
    { label: 'Main on hover fill', used: 'secondary/option/tab hover', fg: 'var(--text-main)', bg: 'var(--bg-surface-hover)' },
    { label: 'Paragraph', used: 'p on page', fg: 'var(--text-muted)', bg: 'var(--bg-main)' },
    { label: 'Muted on surface', used: 'labels, card copy, modal body, nav', fg: 'var(--text-muted)', bg: 'var(--bg-surface)' },
    { label: 'Muted on hover fill', used: 'ghost/tab/picker hover', fg: 'var(--text-muted)', bg: 'var(--bg-surface-hover)' },
    { label: 'Muted on overlay', used: 'nav dropdown, tab badge', fg: 'var(--text-muted)', bg: 'var(--bg-overlay)' },
    { label: 'Dim on page', used: 'carousel description', fg: 'var(--text-dim)', bg: 'var(--bg-main)' },
    { label: 'Dim on surface', used: 'code comments, textarea hint', fg: 'var(--text-dim)', bg: 'var(--bg-surface)' },
    { label: 'Dim on hover fill', used: 'hint text in hovered rows', fg: 'var(--text-dim)', bg: 'var(--bg-surface-hover)' },
    { label: 'Dim on overlay', used: 'any --text-dim inside popovers', fg: 'var(--text-dim)', bg: 'var(--bg-overlay)' },
    { label: 'Placeholder', used: 'input::placeholder', fg: 'var(--text-dim)', bg: 'var(--input-bg)' },
    { label: 'Link', used: 'a on page', fg: 'var(--brand-text)', bg: 'var(--bg-main)' },
    { label: 'Link on surface', used: 'a inside cards', fg: 'var(--brand-text)', bg: 'var(--bg-surface)' },
    { label: 'Selected radio label', used: '.radio-option.selected', fg: 'var(--brand-text)', bg: 'var(--bg-surface)' },
    { label: 'Nav / footer hover', used: '.page-link:hover', fg: 'var(--brand-text-hover)', bg: 'var(--bg-surface)' },
    { label: 'Link hover on page', used: 'a:hover', fg: 'var(--brand-text-hover)', bg: 'var(--bg-main)' },
    { label: 'Inline code', used: ':not(pre) > code', fg: 'var(--brand-text)', bg: 'var(--bg-overlay)' },
    { label: 'Primary button', used: '.btn / .btn-primary', fg: 'var(--text-on-accent)', bg: 'var(--brand-accent)' },
    { label: 'Primary hover', used: '.btn-primary:hover', fg: 'var(--text-on-accent)', bg: 'var(--brand-hover)' },
    { label: 'Primary pressed', used: '.btn-primary:active', fg: 'var(--text-on-accent)', bg: 'var(--brand-active)' },
    { label: 'Success button', used: '.btn-success', fg: 'var(--color-success)', bg: 'rgb(var(--color-success-rgb) / 0.08)', over: 'var(--bg-surface)' },
    { label: 'Success hover', used: '.btn-success:hover', fg: 'var(--color-success)', bg: 'rgb(var(--color-success-rgb) / 0.14)', over: 'var(--bg-surface)' },
    { label: 'Success pressed', used: '.btn-success:active', fg: 'var(--color-success)', bg: 'rgb(var(--color-success-rgb) / 0.2)', over: 'var(--bg-surface)' },
    { label: 'Danger button', used: '.btn-danger', fg: 'var(--color-danger)', bg: 'rgb(var(--color-danger-rgb) / 0.08)', over: 'var(--bg-surface)' },
    { label: 'Danger hover', used: '.btn-danger:hover', fg: 'var(--color-danger)', bg: 'rgb(var(--color-danger-rgb) / 0.14)', over: 'var(--bg-surface)' },
    { label: 'Danger pressed', used: '.btn-danger:active', fg: 'var(--color-danger)', bg: 'rgb(var(--color-danger-rgb) / 0.2)', over: 'var(--bg-surface)' },
    { label: 'Danger outline pressed', used: '.btn-danger-outline:active', fg: 'var(--color-danger)', bg: 'rgb(var(--color-danger-rgb) / 0.18)', over: 'var(--bg-surface)' },
    { label: 'Error message', used: '.error-message', fg: 'var(--color-danger)', bg: 'var(--bg-surface)' },
    { label: 'Error on page', used: '.error-message outside a card', fg: 'var(--color-danger)', bg: 'var(--bg-main)' },
    { label: 'Picker delete hover', used: '.color-row .btn-danger:hover', fg: 'var(--bg-main)', bg: 'var(--color-danger)' },
    { label: 'Syntax: keyword', used: '.highlight .k', fg: 'var(--syntax-keyword)', bg: 'var(--bg-surface)' },
    { label: 'Syntax: string', used: '.highlight .s1', fg: 'var(--syntax-string)', bg: 'var(--bg-surface)' },
    { label: 'Syntax: function', used: '.highlight .nf', fg: 'var(--accent-pink-soft)', bg: 'var(--bg-surface)' },
    { label: 'Field outline', used: 'input border, radio, switch track', fg: 'var(--input-border)', bg: 'var(--input-bg)', kind: 'ui' },
    { label: 'Field outline on page', used: 'input border where the field sits on the page', fg: 'var(--input-border)', bg: 'var(--bg-main)', kind: 'ui' },
    { label: 'Field focus', used: 'input:focus border', fg: 'var(--input-focus-border)', bg: 'var(--input-bg)', kind: 'ui' },
    { label: 'Switch / radio on', used: 'brand-accent vs surface', fg: 'var(--brand-accent)', bg: 'var(--bg-surface)', kind: 'ui' },
    { label: 'Switch thumb off', used: 'text-dim thumb on the track', fg: 'var(--text-dim)', bg: 'var(--input-bg)', kind: 'ui' },
];

/**
 * Deliberately not checked (WCAG exempts them), so they do not read as failures:
 * - Disabled controls (--disabled-text on --disabled-bg, plus 50% opacity): inactive components are exempt from 1.4.3.
 * - Decorative dividers and card borders (--border-subtle, --border-color): the content next to them identifies the region.
 */

function grade(ratio: number, kind?: 'ui'): { label: string; tone: 'good' | 'warn' | 'bad' } {
    if (kind === 'ui') return ratio >= 3 ? { label: 'Pass', tone: 'good' } : { label: 'Fail', tone: 'bad' };
    if (ratio >= 7) return { label: 'AAA', tone: 'good' };
    if (ratio >= 4.5) return { label: 'AA', tone: 'good' };
    if (ratio >= 3) return { label: 'Large only', tone: 'warn' };
    return { label: 'Fail', tone: 'bad' };
}

// ==========================================================================
// Styles for the audit chrome itself
// ==========================================================================

const AUDIT_CSS = `
.ta-panel { color-scheme: var(--color-scheme); background: var(--bg-main); color: var(--text-main); font-family: var(--font-family-body); font-size: var(--font-base); line-height: 1.6; padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 2rem; min-width: 0; }
.ta-theme-toggle { position: fixed; top: 1rem; right: 1rem; z-index: 1000; box-shadow: var(--shadow-md); }
.ta-panel-title { display: flex; align-items: baseline; gap: .75rem; margin: 0; }
.ta-panel-title small { font-family: var(--font-family-mono); font-size: var(--font-sm); color: var(--text-muted); font-weight: 400; letter-spacing: 0; }
.ta-block { display: flex; flex-direction: column; gap: .875rem; min-width: 0; }
.ta-block > h3 { margin: 0; padding-bottom: .375rem; border-bottom: 1px solid var(--border-subtle); font-size: var(--font-sm); text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); }
.ta-note { margin: 0; font-size: var(--font-sm); color: var(--text-muted); }
.ta-note p { margin: 0; }
.ta-legend { list-style: none; margin: .5rem 0 0; padding: 0; display: flex; flex-direction: column; gap: .25rem; }
.ta-legend li { display: flex; gap: .5rem; align-items: baseline; }
.ta-legend .ta-badge { flex: 0 0 5.5rem; text-align: center; }
.ta-sub { margin: .25rem 0 0; font-size: var(--font-xs); text-transform: uppercase; letter-spacing: .08em; color: var(--text-dim); }
.ta-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: .75rem; }
.ta-swatch { display: flex; flex-direction: column; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-surface); }
.ta-swatch-chip { height: 3rem; background-image: conic-gradient(#8884 25%, transparent 0 50%, #8884 0 75%, transparent 0); background-size: 12px 12px; }
.ta-swatch-chip > div { height: 100%; }
.ta-swatch-meta { padding: .5rem .625rem; display: flex; flex-direction: column; gap: .125rem; font-size: var(--font-xs); }
.ta-swatch-name { font-family: var(--font-family-mono); color: var(--text-main); word-break: break-all; }
.ta-swatch-value { font-family: var(--font-family-mono); color: var(--brand-accent); }
.ta-swatch-used { color: var(--text-muted); }
.ta-tag { align-self: flex-start; margin-top: .25rem; padding: 0 .375rem; border: 1px dashed var(--border-color); border-radius: var(--radius-full); color: var(--text-dim); font-size: var(--font-xs); }
.ta-table { width: 100%; border-collapse: collapse; font-size: var(--font-sm); }
.ta-table th { text-align: left; font-size: var(--font-xs); text-transform: uppercase; letter-spacing: .06em; color: var(--text-dim); font-weight: 600; padding: .25rem .5rem; border-bottom: 1px solid var(--border-subtle); }
.ta-table td { padding: .375rem .5rem; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
.ta-table code { font-size: var(--font-xs); }
.ta-sample { display: inline-block; min-width: 3rem; text-align: center; padding: .125rem .5rem; border-radius: var(--radius-sm); font-weight: 600; }
.ta-badge { display: inline-block; padding: 0 .5rem; border-radius: var(--radius-full); font-size: var(--font-xs); font-weight: 600; border: 1px solid transparent; }
.ta-badge[data-tone='good'] { color: var(--color-success); border-color: rgb(var(--color-success-rgb) / .35); }
.ta-badge[data-tone='warn'] { color: var(--text-main); border-color: var(--border-color); }
.ta-badge[data-tone='bad'] { color: var(--color-danger); border-color: rgb(var(--color-danger-rgb) / .35); }
.ta-shadows { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1.25rem; }
.ta-shadow { display: flex; flex-direction: column; gap: .5rem; }
.ta-shadow-box { height: 3.5rem; border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border-subtle); display: grid; place-items: center; font-weight: 600; }
.ta-row { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; }
.ta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; align-items: start; }
.ta-inline-modal { position: static !important; margin: 0 !important; }
.ta-toasts { display: flex; flex-direction: column; gap: .5rem; max-width: 26rem; }
.ta-toasts [data-sonner-toast] { display: flex; align-items: center; gap: .625rem; padding: .875rem 1rem; }
.ta-simulated-focus { border-color: var(--input-focus-border) !important; box-shadow: 0 0 0 3px var(--input-focus-ring) !important; }
`;

// ==========================================================================
// Building blocks
// ==========================================================================

const Block: React.FC<{ title: string; note?: React.ReactNode; children: React.ReactNode }> = ({ title, note, children }) => (
    <div className="ta-block">
        <h3>{title}</h3>
        {note && <div className="ta-note">{note}</div>}
        {children}
    </div>
);

const ContrastLegend: React.FC = () => (
    <>
        <p>
            Pairs are the foreground/background combinations the components actually render (translucent fills are
            composited over their backdrop). The ratio runs from 1:1 (invisible) to 21:1 (black on white).
        </p>
        <ul className="ta-legend">
            <li><span className="ta-badge" data-tone="good">AAA</span>7:1 or more. Comfortable for normal text.</li>
            <li><span className="ta-badge" data-tone="good">AA</span>4.5:1 to 7:1. Meets the standard for normal-sized text. This is the target.</li>
            <li><span className="ta-badge" data-tone="warn">Large only</span>3:1 to 4.5:1. Too faint for normal text; only OK for large text (about 24px, or 18.5px bold). Darken or lighten a colour to fix.</li>
            <li><span className="ta-badge" data-tone="bad">Fail</span>Under 3:1 for text, or under 3:1 for a UI element. Hard to see for many people.</li>
            <li><span className="ta-badge" data-tone="good">Pass</span>Non-text pairs (borders, focus outlines, switch on-state): 3:1 or more.</li>
        </ul>
    </>
);

interface Probe {
    colour: (expr: string) => RGBA | null;
    raw: (name: string) => string;
}

const Swatch: React.FC<{ token: TokenDef; probe: Probe | null }> = ({ token, probe }) => {
    const resolved = probe?.colour(`var(${token.name})`);
    return (
        <div className="ta-swatch">
            <div className="ta-swatch-chip">
                <div style={{ background: `var(${token.name})` }} />
            </div>
            <div className="ta-swatch-meta">
                <span className="ta-swatch-name">{token.name}</span>
                <span className="ta-swatch-value">{resolved ? toHex(resolved) : '…'}</span>
                <span className="ta-swatch-used">{token.used}</span>
                {token.unused && <span className="ta-tag">unused in repo</span>}
            </div>
        </div>
    );
};

const SwatchGrid: React.FC<{ tokens: TokenDef[]; probe: Probe | null }> = ({ tokens, probe }) => (
    <div className="ta-swatches">
        {tokens.map((t) => <Swatch key={t.name} token={t} probe={probe} />)}
    </div>
);

// ==========================================================================
// One themed panel
// ==========================================================================

const FRUIT_OPTIONS = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
];

const CAROUSEL_ITEMS = [
    { id: 1, title: 'Granny square', description: 'A classic motif worked in the round, one colour at a time.' },
    { id: 2, title: 'Stitch marker', description: 'Small, bright and easy to lose. Keep a few spare.' },
    { id: 3, title: 'Blanket', description: 'Joined squares in a warm rose palette.' },
];

const CODE_SAMPLE = (
    <div className="highlight">
        <pre>
            <code>
                <span className="c1">{'// syntax highlight tokens'}</span>{'\n'}
                <span className="k">const</span> <span className="n">greeting</span> <span className="p">=</span>{' '}
                <span className="nf">format</span><span className="p">(</span><span className="s1">'hello'</span><span className="p">);</span>
            </code>
        </pre>
    </div>
);

const ThemePanel: React.FC<{ mode: 'global' | 'light' | 'dark'; onToggleTheme?: () => void }> = ({ mode, onToggleTheme }) => {
    const { theme: globalTheme } = useTheme();
    const activeTheme = mode === 'global' ? globalTheme : mode;
    const scopeRef = useRef<HTMLDivElement>(null);
    const [probe, setProbe] = useState<Probe | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [radio, setRadio] = useState<string | number>('banana');
    const [selected, setSelected] = useState<(string | number)[]>(['apple']);

    // A fresh probe object invalidates every resolved value below. Refresh it on theme change and
    // whenever Vite HMR swaps a stylesheet in <head>.
    useEffect(() => {
        const scope = scopeRef.current;
        if (!scope) return;

        const refresh = () => setProbe({
            colour: (expr) => resolveColour(scope, expr),
            raw: (name) => getComputedStyle(scope).getPropertyValue(name).trim(),
        });
        refresh();

        let timer: ReturnType<typeof setTimeout> | undefined;
        const observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(refresh, 100);
        });
        observer.observe(document.head, { childList: true, subtree: true, characterData: true });
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [activeTheme]);

    const contrastRows = useMemo(() => {
        if (!probe) return [];
        return CONTRAST_PAIRS.map((pair) => {
            const fg = probe.colour(pair.fg);
            let bg = probe.colour(pair.bg);
            const over = probe.colour(pair.over ?? 'var(--bg-surface)');
            if (bg && bg.a < 1 && over) bg = composite(bg, over);
            if (!fg || !bg) return { pair, ratio: null, fg, bg };
            return { pair, ratio: contrastRatio(fg.a < 1 ? composite(fg, bg) : fg, bg), fg, bg };
        });
    }, [probe]);

    const rgbRows = useMemo(() => {
        if (!probe) return [];
        return RGB_PAIRS.map((p) => {
            const triplet = probe.raw(p.rgb);
            const [r, g, b] = triplet.split(/[\s,]+/).map(Number);
            const hex = probe.colour(`var(${p.hex})`);
            const inSync = !!hex && hex.r === r && hex.g === g && hex.b === b;
            return { ...p, triplet, hex, inSync };
        });
    }, [probe]);

    return (
        <div className="ta-panel" data-theme={mode === 'global' ? undefined : mode} ref={scopeRef}>
            <h2 className="ta-panel-title">
                {activeTheme === 'light' ? 'Light' : 'Dark'} theme
                <small>{mode === 'global' ? 'following the toolbar' : `data-theme="${mode}"`}</small>
            </h2>

            {onToggleTheme && (
                <Button
                    className="ta-theme-toggle"
                    variant="secondary"
                    size="sm"
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${activeTheme === 'light' ? 'dark' : 'light'} theme`}
                    style={{ top: `10px`, right: `10px` }}
                >
                    {activeTheme === 'light' ? '☀️ Light' : '🌙 Dark'}
                </Button>
            )}

            {/* ------------------------------------------------------------ Tokens */}
            <Block title="Colour tokens" note="Values are read live from the computed stylesheet, so they update as you edit _variables.scss.">
                {COLOUR_GROUPS.map((group) => (
                    <div key={group.title}>
                        <p className="ta-sub">{group.title}</p>
                        <SwatchGrid tokens={group.tokens} probe={probe} />
                    </div>
                ))}
                <div>
                    <p className="ta-sub">Theme-invariant (declared once on :root — not affected by data-theme)</p>
                    <SwatchGrid tokens={INVARIANT_TOKENS} probe={probe} />
                </div>
            </Block>

            <Block
                title="RGB triplet sync"
                note="Alpha-tinted surfaces read rgb(var(--x-rgb) / a). The triplet is copied by hand from the hex token; a mismatch means tints drift from the base colour."
            >
                <table className="ta-table">
                    <thead>
                        <tr><th>Token</th><th>Triplet</th><th>Hex twin</th><th>In sync</th><th>Used by</th></tr>
                    </thead>
                    <tbody>
                        {rgbRows.map((row) => (
                            <tr key={row.rgb}>
                                <td><code>{row.rgb}</code></td>
                                <td><code>{row.triplet}</code></td>
                                <td><code>{row.hex ? toHex({ ...row.hex, a: 1 }) : '…'}</code></td>
                                <td><span className="ta-badge" data-tone={row.inSync ? 'good' : 'bad'}>{row.inSync ? 'Yes' : 'Drifted'}</span></td>
                                <td>{row.used}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Block>

            <Block title="Shadows" note="Shadow tokens are full per-theme literals. Two are hard to see on a light page — check the glows.">
                <div className="ta-shadows">
                    {SHADOW_TOKENS.map((t) => (
                        <div className="ta-shadow" key={t.name}>
                            <div
                                className="ta-shadow-box"
                                style={t.name === '--shadow-text' || t.name === '--shadow-text-sm'
                                    ? { textShadow: `var(${t.name})`, boxShadow: 'none' }
                                    : { boxShadow: `var(${t.name})` }}
                            >
                                Aa
                            </div>
                            <div className="ta-swatch-meta" style={{ padding: 0 }}>
                                <span className="ta-swatch-name">{t.name}</span>
                                <span className="ta-swatch-used">{t.used}</span>
                                {t.unused && <span className="ta-tag">unused in repo</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </Block>

            <Block title="Contrast" note={<ContrastLegend />}>
                <table className="ta-table">
                    <thead>
                        <tr><th>Pair</th><th>Sample</th><th>Ratio</th><th>Result</th><th>Where</th></tr>
                    </thead>
                    <tbody>
                        {contrastRows.map(({ pair, ratio }) => {
                            const g = ratio === null ? null : grade(ratio, pair.kind);
                            return (
                                <tr key={pair.label}>
                                    <td>{pair.label}</td>
                                    <td>
                                        <span style={{ display: 'inline-block', background: pair.over ?? 'transparent', borderRadius: 'var(--radius-sm)' }}>
                                            <span
                                                className="ta-sample"
                                                style={pair.kind === 'ui'
                                                    ? { background: pair.bg, border: `2px solid ${pair.fg}` }
                                                    : { color: pair.fg, background: pair.bg }}
                                            >
                                                Aa
                                            </span>
                                        </span>
                                    </td>
                                    <td><code>{ratio === null ? '…' : `${ratio.toFixed(2)}:1`}</code></td>
                                    <td>{g && <span className="ta-badge" data-tone={g.tone}>{g.label}</span>}</td>
                                    <td>{pair.used}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Block>

            {/* ------------------------------------------------------------ Components */}
            <Block title="Typography & bare elements">
                <div>
                    <h1>Heading one</h1>
                    <h2>Heading two</h2>
                    <h3>Heading three</h3>
                    <p>
                        Paragraph text uses <code>--text-muted</code>. Here is a <a href="#audit">link</a>, some{' '}
                        <code>inline code</code>, and a form <label htmlFor="audit-label-demo">label</label>.
                    </p>
                </div>
                {CODE_SAMPLE}
            </Block>

            <Block title="Buttons" note="Hover and press a few — hover/active states pull from different tokens than the resting state.">
                <div className="ta-row">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="danger-outline">Danger outline</Button>
                    <Button variant="invisible">Invisible</Button>
                    <Button variant="primary" icon>✕</Button>
                </div>
                <div className="ta-row">
                    <Button variant="primary" disabled>Primary</Button>
                    <Button variant="secondary" disabled>Secondary</Button>
                    <Button variant="ghost" disabled>Ghost</Button>
                    <Button variant="success" disabled>Success</Button>
                    <Button variant="danger" disabled>Danger</Button>
                    <Button variant="invisible" disabled>Invisible</Button>
                </div>
                <div className="ta-row">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                </div>
            </Block>

            <Block title="Form controls">
                <div className="ta-grid">
                    <TextInput id={`${mode}-text`} label="Text input" placeholder="Placeholder text" />
                    <TextInput id={`${mode}-text-value`} label="With value" value="Some value" onChange={() => { }} />
                    <TextInput id={`${mode}-text-disabled`} label="Disabled" value="Can't edit" onChange={() => { }} disabled />
                    <div className="form-group">
                        <label htmlFor={`${mode}-text-error`}>With error</label>
                        <input id={`${mode}-text-error`} type="text" defaultValue="bad@" />
                        <span className="error-message">Enter a valid email address</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor={`${mode}-text-focus`}>Focus (simulated)</label>
                        <input id={`${mode}-text-focus`} type="text" className="ta-simulated-focus" defaultValue="Focused field" readOnly />
                    </div>
                    <NumberInput id={`${mode}-number`} label="Number with suffix" value={12} suffix="km" noSpinner={false} onChange={() => { }} />
                    <DateInput id={`${mode}-date`} label="Date" value="2026-09-24" onChange={() => { }} />
                    <InlineSelect label="Inline select" options={FRUIT_OPTIONS} value="banana" />
                    <div className="form-group">
                        <label>Colour input</label>
                        <div className="input-card">
                            <input type="color" defaultValue="#8a4a5e" aria-label="Colour input" />
                            <span>Input card (focus-within ring)</span>
                        </div>
                    </div>
                </div>
                <TextArea onSubmit={() => { }} placeholder="Textarea — type to reveal the Ctrl+Enter hint" />
                <div className="ta-row">
                    <Switch label="Switch off" />
                    <Switch label="Switch on" defaultChecked />
                    <Switch label="Disabled" disabled />
                    <Switch label="Disabled on" disabled defaultChecked />
                    <Switch label="Small" size="sm" defaultChecked />
                </div>
                <RadioSelector label="Radio selector" options={FRUIT_OPTIONS} selectedOptions={radio} onSelect={setRadio} />
                <ButtonSelector
                    label="Button selector (multi)"
                    options={FRUIT_OPTIONS}
                    selectedOptions={selected}
                    onSelect={(v) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))}
                />
            </Block>

            <Block title="Cards">
                <div className="ta-grid">
                    <Card padding="md">Default card (hover me for the glow)</Card>
                    <Card variant="control-panel">Control panel card</Card>
                    <Card variant="output-logs">{'> output-logs card\n> monospaced on --bg-main'}</Card>
                    <Card variant="rose">Rose accent card</Card>
                </div>
                <div className="form-card">
                    <div className="form-card__header">
                        <h3 className="form-card__title">Form card</h3>
                        <p className="form-card__description">Header and actions dividers use --border-subtle.</p>
                    </div>
                    <div className="form-card__body">
                        <div className="input-card"><span>Input card row</span><Button size="sm" variant="secondary">Edit</Button></div>
                    </div>
                    <div className="form-card__actions">
                        <Button variant="secondary">Cancel</Button>
                        <Button>Save</Button>
                    </div>
                </div>
            </Block>

            <Block title="Tabs">
                <Tabs
                    tabs={[
                        { id: `${mode}-t1`, label: 'Active', content: <p>First tab content.</p> },
                        { id: `${mode}-t2`, label: 'Hover me', content: <p>Second tab content.</p> },
                        { id: `${mode}-t3`, label: 'Disabled', content: <p>Never shown.</p>, disabled: true },
                    ]}
                />
            </Block>

            <Block title="Modal" note="The replica is the real dialog's styles rendered in flow; use the button for the actual top-layer modal and its blurred backdrop.">
                <dialog open className={`${modalStyles.modal} ta-inline-modal`}>
                    <div className={modalStyles['modal-container']}>
                        <header className={modalStyles['modal-header']}>
                            <h2 className={modalStyles['modal-title']}>Modal title</h2>
                            <button type="button" className={modalStyles['modal-close-btn']} aria-label="Close modal">✕</button>
                        </header>
                        <div className={modalStyles['modal-body']}>Modal body copy on --bg-surface.</div>
                        <footer className={modalStyles['modal-footer']}>
                            <button type="button" className="btn btn-secondary">Cancel</button>
                            <button type="button" className="btn btn-danger">Delete</button>
                        </footer>
                    </div>
                </dialog>
                <div className="ta-row">
                    <Button variant="secondary" onClick={() => setModalOpen(true)}>Open real modal</Button>
                </div>
                <Modal
                    isOpen={modalOpen}
                    title="Real modal"
                    onClose={() => setModalOpen(false)}
                    onSubmit={() => setModalOpen(false)}
                />
            </Block>

            <Block title="Header & footer" note="Both are real components. Their accent rules use --brand-accent.">
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <Header
                        links={[{ label: 'Projects', href: '#projects' }, { label: 'About', href: '#about' }]}
                    >
                        <Button size="sm" variant="secondary">Action</Button>
                    </Header>
                    <Footer />
                </div>
            </Block>

            <Block title="Toasts (sonner)" note="Sonner isn't installed here, so this is its markup rendered against the real _component_toast.scss rules. Toasts use theme-invariant fills, so they look the same in both themes.">
                <div className="ta-toasts">
                    {(['success', 'warning', 'error', 'info'] as const).map((type) => (
                        <div key={type} data-sonner-toast="" data-type={type}>
                            <span data-icon="">●</span>
                            <span>{type[0].toUpperCase() + type.slice(1)} toast message</span>
                        </div>
                    ))}
                </div>
            </Block>

            <Block title="Colour palette picker & accordion" note="The accordion markup is used by downstream projects; nothing in this repo renders it.">
                <ColourPalettePicker />
                <div className="ta-grid">
                    <details className="color-picker-accordion" open>
                        <summary className="accordion-header">Accordion (open)</summary>
                        <div className="color-picker-component">Accordion body</div>
                    </details>
                    <details className="color-picker-accordion">
                        <summary className="accordion-header">Accordion (closed — hover me)</summary>
                    </details>
                    <details className="color-picker-accordion" aria-disabled="true">
                        <summary className="accordion-header disabled">Accordion (disabled)</summary>
                    </details>
                </div>
            </Block>

            <Block title="Card carousel">
                <CardCarousel items={CAROUSEL_ITEMS} />
            </Block>
        </div>
    );
};

// ==========================================================================
// Public entry
// ==========================================================================

export const ThemeAudit: React.FC<{ theme?: AuditTheme }> = ({ theme = 'light' }) => {
    const { theme: globalTheme, setTheme } = useTheme();
    // Local override for the single-panel view; reset whenever the `theme` control changes.
    const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(theme === 'dark' ? 'dark' : 'light');
    const [prevTheme, setPrevTheme] = useState(theme);
    if (theme !== prevTheme) {
        setPrevTheme(theme);
        if (theme === 'light' || theme === 'dark') setLocalTheme(theme);
    }

    const toggleTheme = () => {
        if (theme === 'global') setTheme(globalTheme === 'dark' ? 'light' : 'dark');
        else setLocalTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    };

    return (
        <>
            <style>{AUDIT_CSS}</style>
            {theme === 'side-by-side' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(520px, 1fr))', gap: '1rem', alignItems: 'start' }}>
                    <ThemePanel mode="light" />
                    <ThemePanel mode="dark" />
                </div>
            ) : (
                <ThemePanel mode={theme === 'global' ? 'global' : localTheme} onToggleTheme={toggleTheme} />
            )}
        </>
    );
};
