import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { ColourPalettePicker, type PaletteItem } from './ColourPalettePicker';
import { DocsPage } from '@stories/DocsPage';

/** The generated palette is echoed as hex chips (the swatches carry the hex only in `title`). */
const HEX_CHIP = /^#[0-9a-f]{6}$/;

const meta: Meta<typeof ColourPalettePicker> = {
    title: 'User Input/ColourPalettePicker',
    component: ColourPalettePicker,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        onChange: { action: 'paletteChanged' },
        initialPalette: {
            control: 'object',
            description: 'Initial list of palette items (hex code, steps, and id)',
        },
        palette: {
            control: 'object',
            description: 'Controlled palette state with current state and setter function',
        },
    },
};

export default meta;
type Story = StoryObj<typeof ColourPalettePicker>;

export const Default: Story = {
    render: (args) => <ColourPalettePicker {...args} />,
    args: {
        onChange: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        // The native colour inputs have no label or role, so they're located by type.
        const colourInputs = () => canvasElement.querySelectorAll<HTMLInputElement>('input[type="color"]');
        const stepInputs = () => canvas.queryAllByLabelText<HTMLInputElement>('Steps to next:');
        const removeButtons = () => canvas.queryAllByRole('button', { name: '✕' });
        const chips = () => canvas.getAllByText(HEX_CHIP).map((chip) => chip.textContent);
        const expectReported = (palette: (string | null)[]) =>
            waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(palette));

        // Initial: 4 colours with 5 steps between each pair (the last has no step control) -> 19 generated colours.
        await expect(colourInputs()).toHaveLength(4);
        await expect(stepInputs()).toHaveLength(3);
        await expect(chips()).toHaveLength(19);
        await expect(chips()[0]).toBe('#f2f3f5');
        await expect(chips()[18]).toBe('#343648');
        await expectReported(chips());

        // Edit a colour: the first colour becomes red and the reported palette follows.
        fireEvent.input(colourInputs()[0], { target: { value: '#ff0000' } });
        await waitFor(() => expect(chips()[0]).toBe('#ff0000'));
        await expect(chips()).toHaveLength(19);
        await expectReported(chips());

        // Edit steps: 1 step (instead of 5) between the first pair leaves 15 colours in total.
        await userEvent.clear(stepInputs()[0]);
        await userEvent.type(stepInputs()[0], '1');
        await expect(stepInputs()[0]).toHaveValue(1);
        await expect(chips()).toHaveLength(15);
        await expectReported(chips());

        // Steps never go negative: they clamp to 0 (the pair contributes only its two end colours).
        fireEvent.change(stepInputs()[0], { target: { value: '-3' } });
        await waitFor(() => expect(stepInputs()[0]).toHaveValue(0));
        await expect(chips()).toHaveLength(14);
        await expectReported(chips());

        // Add: a black colour is appended, and the former last colour gains a step control.
        await userEvent.click(canvas.getByRole('button', { name: '+ Add Color' }));
        await expect(colourInputs()).toHaveLength(5);
        await expect(colourInputs()[4]).toHaveValue('#000000');
        await expect(stepInputs()).toHaveLength(4);
        await expect(chips()[chips().length - 1]).toBe('#000000');
        await expectReported(chips());

        // Remove: deleting the second colour drops it from the palette.
        await expect(removeButtons()).toHaveLength(5);
        await expect(chips()).toContain('#9c8b7a');
        await userEvent.click(removeButtons()[1]);
        await expect(colourInputs()).toHaveLength(4);
        await expect(chips()).not.toContain('#9c8b7a');
        await expectReported(chips());

        // At two colours the remove buttons disappear, so the palette can't shrink further.
        await userEvent.click(removeButtons()[0]);
        await userEvent.click(removeButtons()[0]);
        await expect(colourInputs()).toHaveLength(2);
        await expect(removeButtons()).toHaveLength(0);
        await expectReported(chips());
    },
};

/**
 * Controlled by the parent via `palette={{ state, setState }}`: every edit is handed to `setState`
 * and the picker shows whatever state the parent gives back. Starts from a black-to-white pair with
 * one step between them, so the generated palette is exactly black, mid-grey, white.
 */
export const Controlled: Story = {
    render: function Render(args) {
        const [state, setState] = useState<PaletteItem[]>([
            { id: 1, hex: '#000000', stepsToNext: 1 },
            { id: 2, hex: '#ffffff', stepsToNext: 0 },
        ]);
        return (
            <ColourPalettePicker
                {...args}
                palette={{
                    state,
                    setState: (next) => {
                        args.palette?.setState(next);
                        setState(next);
                    },
                }}
            />
        );
    },
    args: {
        onChange: fn(),
        palette: { state: [], setState: fn() },
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const setState = args.palette!.setState;
        const chips = () => canvas.getAllByText(HEX_CHIP).map((chip) => chip.textContent);

        await expect(chips()).toEqual(['#000000', '#808080', '#ffffff']);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(['#000000', '#808080', '#ffffff']));

        // Edit steps: the setter receives the full next palette, and the parent's state drives the render.
        const steps = canvas.getByLabelText<HTMLInputElement>('Steps to next:');
        await userEvent.clear(steps);
        await userEvent.type(steps, '3');
        await expect(setState).toHaveBeenLastCalledWith([
            { id: 1, hex: '#000000', stepsToNext: 3 },
            { id: 2, hex: '#ffffff', stepsToNext: 0 },
        ]);
        await expect(chips()).toEqual(['#000000', '#404040', '#808080', '#bfbfbf', '#ffffff']);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(chips()));

        // Add: a black colour is appended through the setter. Its id (5) comes from the default
        // palette rather than the controlled state, because `nextId` is only seeded from `initialPalette`.
        await userEvent.click(canvas.getByRole('button', { name: '+ Add Color' }));
        await expect(setState).toHaveBeenLastCalledWith([
            { id: 1, hex: '#000000', stepsToNext: 3 },
            { id: 2, hex: '#ffffff', stepsToNext: 0 },
            { id: 5, hex: '#000000', stepsToNext: 2 },
        ]);

        // Remove: the middle colour goes; the setter gets the two remaining items.
        await userEvent.click(canvas.getAllByRole('button', { name: '✕' })[1]);
        await expect(setState).toHaveBeenLastCalledWith([
            { id: 1, hex: '#000000', stepsToNext: 3 },
            { id: 5, hex: '#000000', stepsToNext: 2 },
        ]);
        await expect(canvas.queryAllByRole('button', { name: '✕' })).toHaveLength(0);
    },
};