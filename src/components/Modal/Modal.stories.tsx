import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';
import { useForm } from '@hooks/useForm';
import { FormProvider } from '@providers/FormProvider';
import { TextInput } from '@components/TextInput';
import { NumberInput } from '@components/NumberInput';
import { DateInput } from '@components/DateInput';
import { ButtonSelector } from '@components/ButtonSelector';
import { RadioSelector } from '@components/RadioSelector';
import type { Option } from '../../types/selectors';

const meta: Meta<typeof Modal> = {
    title: 'Display/Modal',
    component: Modal,
    tags: ['autodocs'],
    argTypes: {
        isOpen: { control: 'boolean', description: 'Controls whether the HTML native dialog is visible' },
        title: { control: 'text', description: 'Header text for the modal' },
        modalType: {
            control: 'select',
            options: ['form', 'destructive', 'confirmation'],
            description: 'Changes styling/variant of the primary call-to-action button',
        },
        buttonText: { control: 'object', description: 'Custom labels for primary and secondary buttons' },
        onClose: { action: 'closed', description: 'Triggered when the modal is requested to be closed' },
        onSubmit: { action: 'submitted', description: 'Triggered when the primary action button is clicked' },
        onCancel: { action: 'cancelled', description: 'Triggered when the secondary action button is clicked' },
    },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/**
 * The standard modal view, typically used for forms or general information display. It includes a header, body, and footer with customizable buttons.
 */
export const FormModal: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <button type="button" className="btn btn-primary" onClick={() => setIsOpen(true)}>
                    Open Form Modal
                </button>
                <Modal
                    {...args}
                    isOpen={isOpen}
                    onClose={() => {
                        args.onClose?.();
                        setIsOpen(false);
                    }}
                    onSubmit={() => {
                        args.onSubmit?.();
                        setIsOpen(false);
                    }}
                    onCancel={() => {
                        args.onCancel?.();
                        setIsOpen(false);
                    }}
                />
            </>
        );
    },
    args: {
        title: 'Edit User Settings',
        modalType: 'form',
        buttonText: { primary: 'Save Changes', secondary: 'Cancel' },
        children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>Username</span>
                    <input type="text" defaultValue="joisse1101" style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span>Email</span>
                    <input type="email" defaultValue="thoiwei@gmail.com" style={{ padding: '0.5rem', borderRadius: '4px' }} />
                </label>
            </div>
        ),
    },
};

/**
 * The destructive modal view, typically used for actions that cannot be undone. It includes a prominent warning and requires explicit user confirmation before proceeding.
 */
export const DestructiveModal: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <button type="button" className="btn btn-danger" onClick={() => setIsOpen(true)}>
                    Delete Repository
                </button>
                <Modal
                    {...args}
                    isOpen={isOpen}
                    onClose={() => {
                        args.onClose?.();
                        setIsOpen(false);
                    }}
                    onSubmit={() => {
                        args.onSubmit?.();
                        setIsOpen(false);
                    }}
                />
            </>
        );
    },
    args: {
        title: 'Are you absolutely sure?',
        modalType: 'destructive',
        buttonText: { primary: 'Delete Permanently', secondary: 'Keep Project' },
        children: (
            <p>
                This action cannot be undone. This will permanently delete the <strong>ui-library</strong> repository and remove all collaborators.
            </p>
        ),
    },
};

/**
 * The simple confirmation modal view, typically used for actions that require user confirmation. It prompts the user to confirm their action before proceeding.
 */
export const ConfirmationModal: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(true)}>
                    Publish Component Library
                </button>
                <Modal
                    {...args}
                    isOpen={isOpen}
                    onClose={() => {
                        args.onClose?.();
                        setIsOpen(false);
                    }}
                    onSubmit={() => {
                        args.onSubmit?.();
                        setIsOpen(false);
                    }}
                />
            </>
        );
    },
    args: {
        title: 'Confirm Publication',
        modalType: 'confirmation',
        buttonText: { primary: 'Publish v1.0.0', secondary: 'Back to Editing' },
        children: <p>You are about to release version 1.0.0 to NPM public registry.</p>,
    },
};

const dayOptions: Option[] = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

interface GoalFormValues {
    goalTitle: string;
    startDate: string;
    endDate: string;
    expectedProgress: number | '';
    targets: string;
    overloadDays: (string | number)[];
    firstDayOfWeek: string | number;
}

/**
 * Demonstrates composing the form abstraction (`useForm` + `FormProvider`) with field
 * components (`TextInput`, `NumberInput`, `DateInput`, `ButtonSelector`, `RadioSelector`)
 * inside a `Modal`. Every field binds to form state via its `name` prop alone — no manual
 * `useState`/`onChange` wiring, and validation errors render inline per field.
 */
export const FormWithValidation: Story = {
    render: function Render(args) {
        const [isOpen, setIsOpen] = useState(false);

        const form = useForm<GoalFormValues>({
            defaultValues: {
                goalTitle: '',
                startDate: '',
                endDate: '',
                expectedProgress: '',
                targets: '',
                overloadDays: [],
                firstDayOfWeek: 1,
            },
            rules: {
                startDate: { required: 'Start date is required.' },
                endDate: {
                    required: 'End date is required.',
                    validate: (value, values) =>
                        values.startDate && value && new Date(values.startDate as string) > new Date(value)
                            ? 'Start date cannot be after end date.'
                            : undefined,
                },
                expectedProgress: { required: 'Expected progress per day is required.' },
                targets: {
                    required: 'Goal targets are required.',
                    pattern: {
                        value: /^\s*\d+(\s*,\s*\d+)*\s*$/,
                        message: 'Goal targets must be a list of comma-separated numbers.',
                    },
                },
                overloadDays: { required: 'At least one overload day must be selected.' },
                firstDayOfWeek: { required: 'First day of the week must be selected.' },
            },
        });

        const handleValidSubmit = (values: GoalFormValues) => {
            args.onSubmit?.();
            console.log('Goal tracker configuration updated:', values);
            setIsOpen(false);
        };

        return (
            <>
                <button type="button" className="btn btn-primary" onClick={() => setIsOpen(true)}>
                    Configure Goal
                </button>
                <FormProvider form={form}>
                    <Modal
                        {...args}
                        isOpen={isOpen}
                        onClose={() => {
                            args.onClose?.();
                            setIsOpen(false);
                        }}
                        onSubmit={form.handleSubmit(handleValidSubmit)}
                        onCancel={() => {
                            args.onCancel?.();
                            setIsOpen(false);
                        }}
                    >
                        <div className="form-container">
                            <TextInput name="goalTitle" id="goal-title" label="Goal Name:" placeholder="What is your goal?" />
                            <div className="form-row">
                                <DateInput name="startDate" id="start-date" label="Start Date:" />
                                <DateInput name="endDate" id="end-date" label="End Date:" />
                            </div>
                            <NumberInput name="expectedProgress" id="expected-progress" label="Expected Progress Per Day:" placeholder="e.g., 5" suffix="km" />
                            <TextInput name="targets" id="targets" label="Goal Targets:" placeholder="Enter a list of comma-separated numbers" />
                            <ButtonSelector
                                name="overloadDays"
                                label="Select overload days:"
                                options={dayOptions}
                                title="Select days of the week that you want to set as overload days. These days will be used to make up for missed progress."
                            />
                            <RadioSelector name="firstDayOfWeek" label="Select first day of week:" options={dayOptions} />
                        </div>
                    </Modal>
                </FormProvider>
            </>
        );
    },
    args: {
        title: 'Configure Goal',
        modalType: 'form',
    },
};