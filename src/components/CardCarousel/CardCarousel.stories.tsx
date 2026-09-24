import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { CardCarousel, type CardProps } from './CardCarousel';
import { ResponsiveMatrix } from '@stories/ResponsiveMatrix';
import { DocsPage } from '@stories/DocsPage';

const mockCards: CardProps[] = [
    {
        id: '1',
        title: 'Design Systems',
        description: 'Explore consistent design tokens, dark themes, and scalable UI components.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        link: { label: 'Read docs', url: '#' },
    },
    {
        id: '2',
        title: 'React & Vite',
        description: 'Fast modern bundling paired with flexible component abstractions.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        link: { label: 'Explore stack', url: '#' },
    },
    {
        id: '3',
        title: 'SCSS & Design Tokens',
        description: 'Leveraging CSS custom variables for dynamic runtime theme swappability.',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
        link: { label: 'View variables', url: '#' },
    },
    {
        id: '4',
        title: 'Accessibility First',
        description: 'Built-in keyboard navigation, ARIA roles, and focus indicator loops.',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
        link: { label: 'Audit report', url: '#' },
    },
    {
        id: '5',
        title: 'CI/CD Automation',
        description: 'Automated Storybook deployment to GitHub Pages on every push.',
        image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=600&q=80',
        link: { label: 'View pipeline', url: '#' },
    },
];

const meta: Meta<typeof CardCarousel> = {
    title: 'Display/CardCarousel',
    component: CardCarousel,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: DocsPage,
        },
    },
    argTypes: {
        items: {
            control: 'object',
            description: 'List of card data objects to render inside the carousel track.',
        },
        isInfinite: {
            control: 'boolean',
            description: 'Enable or disable infinite rotation mode for the carousel.',
        },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof CardCarousel>;

const titles = mockCards.map((card) => card.title);

/**
 * The carousel's navigation overlays and slides have no role, name or text, so they're located by
 * their structural class names (the overlays are the same global `.overlay-*` pattern the
 * scroll-overlay helper uses) and the "current card" is read from layout: the slide whose centre
 * is nearest the viewport centre.
 */
const getCarousels = (canvasElement: HTMLElement) =>
    Array.from(canvasElement.querySelectorAll<HTMLElement>('.carousel'));

const getOverlay = (carousel: HTMLElement, side: 'left' | 'right') => {
    const overlay = carousel.querySelector<HTMLElement>(`.overlay-${side}`);
    if (!overlay) throw new Error(`Carousel has no ${side} overlay`);
    return overlay;
};

const getActiveCard = (carousel: HTMLElement) => {
    const viewport = carousel.querySelector<HTMLElement>('.carousel__viewport');
    if (!viewport) throw new Error('Carousel has no viewport');
    const viewportRect = viewport.getBoundingClientRect();
    const viewportCentre = viewportRect.left + viewportRect.width / 2;

    let title: string | null = null;
    let distance = Infinity;
    carousel.querySelectorAll<HTMLElement>('.carousel__slide').forEach((slide) => {
        const rect = slide.getBoundingClientRect();
        const slideDistance = Math.abs(rect.left + rect.width / 2 - viewportCentre);
        if (slideDistance < distance) {
            distance = slideDistance;
            title = slide.querySelector('h3')?.textContent ?? null;
        }
    });
    return { title, distance };
};

/** Waits until `title` is the centred card and the slide animation has come to rest. */
const expectActiveCard = async (carousel: HTMLElement, title: string) => {
    const track = carousel.querySelector<HTMLElement>('.carousel__track');
    if (!track) throw new Error('Carousel has no track');
    await waitFor(() => {
        expect(getActiveCard(carousel).title).toBe(title);
        expect(getActiveCard(carousel).distance).toBeLessThan(2);
        expect(track.getAnimations()).toHaveLength(0);
    });
    // Navigation is locked until the track's `transitionend` handler has run; let React apply it.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};

const go = (carousel: HTMLElement, side: 'left' | 'right') => userEvent.click(getOverlay(carousel, side));

/** Clicks a hidden overlay, bypassing the `pointer-events: none` check, to prove the handler itself respects the bounds. */
const forceClick = (overlay: HTMLElement) =>
    userEvent.setup({ pointerEventsCheck: 0 }).click(overlay);

export const Default: Story = {
    render: (args) => <ResponsiveMatrix component={CardCarousel} args={args} />,
    args: {
        items: mockCards,
        isInfinite: false,
    },
    play: async ({ canvasElement }) => {
        const carousels = getCarousels(canvasElement);
        // Compact (360px) and full-width renderings must behave the same.
        await expect(carousels).toHaveLength(2);

        for (const carousel of carousels) {
            // Start on the first card: nothing to the left.
            await expectActiveCard(carousel, titles[0]);
            await expect(getOverlay(carousel, 'left')).toHaveClass('hidden');
            await expect(getOverlay(carousel, 'right')).not.toHaveClass('hidden');
            await forceClick(getOverlay(carousel, 'left'));
            await expectActiveCard(carousel, titles[0]);

            // Step forward to the last card, one card per click.
            for (const title of titles.slice(1)) {
                await go(carousel, 'right');
                await expectActiveCard(carousel, title);
            }
            await expect(getOverlay(carousel, 'left')).not.toHaveClass('hidden');
            await expect(getOverlay(carousel, 'right')).toHaveClass('hidden');
            await expect(getOverlay(carousel, 'right')).toHaveStyle({ pointerEvents: 'none' });

            // Already on the last card: forward does nothing.
            await forceClick(getOverlay(carousel, 'right'));
            await expectActiveCard(carousel, titles[titles.length - 1]);

            // And back one card.
            await go(carousel, 'left');
            await expectActiveCard(carousel, titles[titles.length - 2]);
            await expect(getOverlay(carousel, 'right')).not.toHaveClass('hidden');
        }
    },
};

/**
 * Singular card variant of the CardCarousel, demonstrating how the carousel behaves with only one card.
 */
export const SingularCard: Story = {
    render: (args) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ width: '360px', border: '1px dashed #b8738a', padding: '1rem', borderRadius: '8px', boxSizing: 'border-box' }}>
                    <CardCarousel {...args} isInfinite={false} />
                </div>
                <div style={{ width: '100%', border: '1px dashed #b8738a', padding: '1rem', borderRadius: '8px', boxSizing: 'border-box' }}>
                    <CardCarousel {...args} isInfinite={true} />
                </div>
            </div>
        );
    },
    args: {
        items: [mockCards[0]],
    },
    play: async ({ canvasElement }) => {
        // Finite and "infinite" alike: a single card has nowhere to go, so both overlays stay hidden.
        const carousels = getCarousels(canvasElement);
        await expect(carousels).toHaveLength(2);

        for (const carousel of carousels) {
            await expectActiveCard(carousel, titles[0]);
            await expect(getOverlay(carousel, 'left')).toHaveClass('hidden');
            await expect(getOverlay(carousel, 'right')).toHaveClass('hidden');
        }
    },
};

/**
 * Text-only variant of the CardCarousel, where images are removed from the cards.
 */
export const TextOnly: Story = {
    args: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured to omit `image` from the rest
        items: mockCards.map(({ image, ...rest }) => rest),
    },
};

/**
 * Infinite rotation variant of the CardCarousel, where the carousel continuously loops through the cards.
 */
export const Infinite: Story = {
    args: {
        items: mockCards,
        isInfinite: true,
    },
    play: async ({ canvasElement }) => {
        const [carousel] = getCarousels(canvasElement);

        // No bounds: both directions are always available.
        await expectActiveCard(carousel, titles[0]);
        await expect(getOverlay(carousel, 'left')).not.toHaveClass('hidden');
        await expect(getOverlay(carousel, 'right')).not.toHaveClass('hidden');

        // Backwards from the first card wraps to the last.
        await go(carousel, 'left');
        await expectActiveCard(carousel, titles[titles.length - 1]);

        // Forwards from the last card wraps to the first, then walks the whole loop.
        await go(carousel, 'right');
        await expectActiveCard(carousel, titles[0]);
        for (const title of titles.slice(1)) {
            await go(carousel, 'right');
            await expectActiveCard(carousel, title);
        }
        await go(carousel, 'right');
        await expectActiveCard(carousel, titles[0]);
        await expect(getOverlay(carousel, 'left')).not.toHaveClass('hidden');
        await expect(getOverlay(carousel, 'right')).not.toHaveClass('hidden');
    },
};