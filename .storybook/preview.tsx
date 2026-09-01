import type { Preview } from '@storybook/react-vite'
// @ts-ignore
import '../src/styles/index.scss'
import storybookTheme from './theme';

const customViewports = {
  mobile: {
    name: 'Mobile (375px)',
    styles: { width: '375px', height: '667px' },
  },
  tablet: {
    name: 'Tablet (768px)',
    styles: { width: '768px', height: '1024px' },
  },
  laptop: {
    name: 'Laptop (1024px)',
    styles: { width: '1024px', height: '768px' },
  },
  desktop: {
    name: 'Desktop (1440px)',
    styles: { width: '1440px', height: '900px' },
  },
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="layout layout-storybook">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      theme: storybookTheme,
    },
    viewport: {
      viewports: customViewports,
      defaultViewport: 'responsive',
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;