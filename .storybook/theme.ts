import { create } from 'storybook/theming';

export default create({
    base: 'dark',

    // Branding
    brandTitle: 'UI Library',
    brandUrl: 'https://github.com/joisse1101/ui-library',
    brandTarget: '_self',

    // Typography
    fontBase: "'Figtree', system-ui, -apple-system, sans-serif",
    fontCode: "'JetBrains Mono', monospace",

    // Core Colors
    colorPrimary: '#9d5a70',   // $brand-accent
    colorSecondary: '#b8738a', // $brand-border-strong (Accents, active states)

    // UI Backgrounds
    appBg: '#121214',          // $bg-main (Sidebar & main shell)
    appContentBg: '#1a1a1e',   // $bg-surface (Canvas area)
    appPreviewBg: '#121214',   // $bg-main (Story iframe background)
    appBorderColor: '#27272a', // $border-subtle
    appBorderRadius: 8,        // $radius-md

    // Text Colors
    textColor: '#ffffff',      // $text-main
    textMutedColor: '#a1a1aa', // $text-muted

    // Toolbar & Navigation
    barTextColor: '#a1a1aa',   // $text-muted
    barSelectedColor: '#b8738a', // $brand-border-strong
    barHoverColor: '#ffffff',    // $text-main
    barBg: '#1a1a1e',          // $bg-surface

    // Form Controls (Controls Panel)
    inputBg: '#18181b',        // $input-bg
    inputBorder: '#27272a',    // $input-border
    inputTextColor: '#ffffff', // $text-main
});