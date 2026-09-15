import type { Meta, StoryObj } from '@storybook/react-vite';
import { InlineSelect } from './InlineSelect';
import { DocsPage } from '@stories/DocsPage';

const meta: Meta<typeof InlineSelect> = {
    title: 'User Input/InlineSelect',
    component: InlineSelect,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
       options: { control: 'object', description: 'Array of options for the select dropdown' },
       label: { control: 'text', description: 'Label for the select dropdown' },
       value: { control: 'text', description: 'Currently selected or initially selected value' },
       onChange: { action: 'valueChanged', description: 'Callback when the selected value changes' },
    },
};

export default meta;
type Story = StoryObj<typeof InlineSelect>;

export const Default: Story = {
    render: (args) => <InlineSelect {...args} />,
    args: {
        label: 'Choose an option',
        options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ],
        value: 'option1',
    }
};
