import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { DocsPage } from '@stories/DocsPage';
import { TextArea } from './TextArea';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';

const meta: Meta<typeof TextArea> = {
    title: 'User Input/TextArea',
    component: TextArea,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        onSubmit: { action: 'submitted', description: 'Callback when the text area is submitted' },
    },
};

export default meta;

type Story = StoryObj<typeof TextArea>;

export const Basic: Story = {
    render: (args) => {
        return (
            <ResponsiveMatrix component={TextArea} args={args} />
        );
    },
    args: {
        onSubmit: (text: string) => alert(text),
    },
};

/**
 * Typing reveals the submit hint; Ctrl + Enter submits the trimmed text and clears the field.
 */
export const SubmitWithKeyboard: Story = {
    args: {
        onSubmit: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');

        await expect(canvas.queryByText('to submit', { exact: false })).not.toBeInTheDocument();

        await userEvent.type(textarea, '  hello world  ');
        await expect(textarea).toHaveValue('  hello world  ');
        await expect(canvas.getByText('to submit', { exact: false })).toBeInTheDocument();

        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await expect(args.onSubmit).toHaveBeenCalledTimes(1);
        await expect(args.onSubmit).toHaveBeenCalledWith('hello world');
        await expect(textarea).toHaveValue('');
    },
};

/**
 * Whitespace-only text is not content: nothing is submitted and the hint stays hidden.
 */
export const IgnoresEmptySubmit: Story = {
    args: {
        onSubmit: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');

        await userEvent.type(textarea, '   ');
        await expect(canvas.queryByText('to submit', { exact: false })).not.toBeInTheDocument();

        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await expect(args.onSubmit).not.toHaveBeenCalled();
    },
};

/**
 * The submit button (shown instead of the keyboard hint on compact screens) also submits.
 */
export const SubmitWithButton: Story = {
    render: (args) => (
        <div style={{ width: '360px' }}>
            <TextArea {...args} />
        </div>
    ),
    args: {
        onSubmit: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');

        await userEvent.type(textarea, 'via button');
        await userEvent.click(canvas.getByRole('button', { name: '➤' }));

        await expect(args.onSubmit).toHaveBeenCalledWith('via button');
        await expect(textarea).toHaveValue('');
    },
};

/**
 * A disabled textarea ignores typing, so no content and no submit hint appear.
 */
export const Disabled: Story = {
    args: {
        onSubmit: fn(),
        disabled: true,
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');

        await expect(textarea).toBeDisabled();

        await userEvent.type(textarea, 'nope');
        await expect(textarea).toHaveValue('');
        await expect(args.onSubmit).not.toHaveBeenCalled();
    },
};

/**
 * A `defaultValue` seeds the textarea's initial text, which then submits like typed text.
 */
export const DefaultValue: Story = {
    args: {
        onSubmit: fn(),
        defaultValue: 'saved draft',
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const textarea = canvas.getByRole('textbox');

        await expect(textarea).toHaveValue('saved draft');

        await userEvent.type(textarea, '!');
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await expect(args.onSubmit).toHaveBeenCalledWith('saved draft!');
    },
};
