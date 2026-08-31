import type { Preview } from '@storybook/react-vite'
// @ts-ignore
import '../src/styles/index.scss'
import storybookTheme from './theme';

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
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;