import type { Preview } from '@storybook/react-vite'
// @ts-ignore
import '../src/styles/index.scss'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className="layout layout-storybook">
        <Story />
      </div>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;