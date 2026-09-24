import { expect, waitFor, within } from 'storybook/test';

/** `data-testid` that overflow stories put on the fixed-width frame wrapping the component under test. */
export const OVERFLOW_FRAME_TEST_ID = 'overflow-frame';

/**
 * Drives a horizontally-scrollable component (`ButtonSelector`, `RadioSelector`, `Tabs`) through
 * `useCanSideScroll`'s states and asserts the fade overlays follow: start -> middle -> end -> back
 * to start, then widening the frame so nothing overflows any more. The component must be rendered
 * inside a fixed-width element carrying `data-testid={OVERFLOW_FRAME_TEST_ID}`, narrow enough to overflow.
 *
 * The overlays are decorative (no role or text), so they're located by their shared global class
 * names and asserted via the `hidden` modifier rather than by pixel values, which avoids racing
 * the CSS transition.
 */
export async function expectScrollOverlaysFollowScrolling(canvasElement: HTMLElement) {
    const frame = within(canvasElement).getByTestId(OVERFLOW_FRAME_TEST_ID);
    const scroller = frame.querySelector<HTMLElement>('.overlay-component');
    const left = frame.querySelector<HTMLElement>('.overlay-left');
    const right = frame.querySelector<HTMLElement>('.overlay-right');
    if (!scroller || !left || !right) throw new Error('Overflow frame does not contain the overlay markup');

    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    // Measured fresh at each step: web fonts loading mid-test can widen the content after the first measurement.
    const maxScroll = () => scroller.scrollWidth - scroller.clientWidth;

    // At the start: more content to the right only.
    await waitFor(() => {
        expect(left).toHaveClass('hidden');
        expect(right).not.toHaveClass('hidden');
    });

    // In the middle: more content on both sides.
    scroller.scrollLeft = Math.floor(maxScroll() / 2);
    await waitFor(() => {
        expect(left).not.toHaveClass('hidden');
        expect(right).not.toHaveClass('hidden');
    });

    // At the end: more content to the left only.
    await waitFor(() => {
        scroller.scrollLeft = maxScroll();
        expect(left).not.toHaveClass('hidden');
        expect(right).toHaveClass('hidden');
    });

    // Back at the start.
    scroller.scrollLeft = 0;
    await waitFor(() => {
        expect(left).toHaveClass('hidden');
        expect(right).not.toHaveClass('hidden');
    });

    // Widen the frame until the content fits: the ResizeObserver hides both overlays.
    frame.style.width = '3000px';
    await waitFor(() => {
        expect(left).toHaveClass('hidden');
        expect(right).toHaveClass('hidden');
    });
}
