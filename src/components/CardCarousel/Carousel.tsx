import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

export interface CarouselProps {
    children: React.ReactNode;
    infinite?: boolean;
}

/**
 * `Carousel` component that renders a carousel of child elements, supporting infinite scrolling if specified.
 */
export const Carousel: React.FC<CarouselProps> = ({ children, infinite = true }) => {
    const items = React.Children.toArray(children);
    const totalItems = items.length;
    const isInfinite = infinite && totalItems > 1;

    const displayItems = isInfinite
        ? [...items, ...items, ...items]
        : items;

    const [currentIndex, setCurrentIndex] = useState(isInfinite ? totalItems : 0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [trackPadding, setTrackPadding] = useState({ left: 0, right: 0 });

    const [liveOffset, setLiveOffset] = useState<number | null>(null);

    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const isWheelSwipingRef = useRef(false);

    const currentIndexRef = useRef(currentIndex);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const updatePadding = useCallback(() => {
        if (!trackRef.current || !viewportRef.current || isInfinite) {
            setTrackPadding({ left: 0, right: 0 });
            return;
        }

        const slideElements = trackRef.current.children;
        const viewportWidth = viewportRef.current.offsetWidth;

        if (slideElements.length > 0) {
            const firstSlide = slideElements[0] as HTMLElement;
            const lastSlide = slideElements[slideElements.length - 1] as HTMLElement;

            const leftPad = (viewportWidth - firstSlide.offsetWidth) / 2;
            const rightPad = (viewportWidth - lastSlide.offsetWidth) / 2;

            setTrackPadding({
                left: Math.max(0, leftPad),
                right: Math.max(0, rightPad),
            });
        }
    }, [isInfinite]);

    const calculateOffset = useCallback((index: number, alignment: 'center' | 'left' | 'right' = 'center') => {
        if (!trackRef.current || !viewportRef.current) return 0;

        const viewportWidth = viewportRef.current.offsetWidth;
        const slideElements = trackRef.current.children;
        const targetSlide = slideElements[index] as HTMLElement;

        if (targetSlide) {
            const cardLeftPosition = targetSlide.offsetLeft;
            const cardWidth = targetSlide.offsetWidth;

            if (alignment === 'left') {
                return cardLeftPosition - trackPadding.left;
            }
            if (alignment === 'right') {
                return cardLeftPosition + cardWidth - viewportWidth + trackPadding.right;
            }

            return cardLeftPosition - (viewportWidth / 2) + (cardWidth / 2);
        }

        return 0;
    }, [trackPadding]);

    const defaultWidths = { left: '35%', right: '35%' };
    const getOverlayWidths = useCallback((index: number) => {
        if (!trackRef.current) return defaultWidths;
        const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
        const slideElements = trackRef.current.children;
        const targetSlideWidth = (slideElements[index] as HTMLElement).offsetWidth ?? 0;
        const TOLERANCE = 10;

        if (Math.abs(viewportWidth - targetSlideWidth) <= TOLERANCE) {
            return defaultWidths;
        }
        if (!isInfinite) return {
            left: trackPadding.left + 'px',
            right: trackPadding.right + 'px',
        };

        const width = viewportWidth - targetSlideWidth;

        return targetSlideWidth ? { left: width / 2 + 'px', right: width / 2 + 'px' } : { left: '0px', right: '0px' };
    }, [isInfinite, trackPadding]);

    const applyTransform = useCallback((targetOffset: number) => {
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(-${targetOffset}px)`;
        }
    }, []);

    useLayoutEffect(() => {
        updatePadding();
    }, [updatePadding]);

    useLayoutEffect(() => {
        if (!isWheelSwipingRef.current) {
            const newOffset = calculateOffset(currentIndex);
            applyTransform(newOffset);
        }
    }, [currentIndex, trackPadding, calculateOffset, applyTransform]);

    useEffect(() => {
        const handleResize = () => {
            updatePadding();
            applyTransform(calculateOffset(currentIndexRef.current));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateOffset, updatePadding, applyTransform]);

    const nextSlide = useCallback(() => {
        if (isAnimating) return;
        if (!infinite && currentIndex >= totalItems - 1) return;

        setIsAnimating(true);
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    }, [isAnimating, infinite, currentIndex, totalItems]);

    const prevSlide = useCallback(() => {
        if (isAnimating) return;
        if (!infinite && currentIndex <= 0) return;

        setIsAnimating(true);
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    }, [isAnimating, infinite, currentIndex]);

    // --- WHEEL HANDLER ---
    useEffect(() => {
        const viewport = viewportRef.current;
        const track = trackRef.current;
        if (!viewport || !track) return;

        let accumulatedDelta = 0;
        let endSwipeTimer: NodeJS.Timeout | null = null;
        let moduloTimer: NodeJS.Timeout | null = null;

        const handleWheel = (e: WheelEvent) => {
            const absX = Math.abs(e.deltaX);
            const absY = Math.abs(e.deltaY);

            if (absY >= absX) return;
            e.preventDefault();

            const activeIndex = currentIndexRef.current;

            if (!isWheelSwipingRef.current) {
                isWheelSwipingRef.current = true;
                setIsTransitioning(false);
                track.style.transition = 'none';
            }

            accumulatedDelta += e.deltaX * 0.7;

            const baseOffset = calculateOffset(activeIndex);
            let currentLiveOffset = baseOffset + accumulatedDelta;

            const minTrackOffset = calculateOffset(0, 'left');
            const maxTrackOffset = calculateOffset(displayItems.length - 1, 'right');
            currentLiveOffset = Math.max(minTrackOffset, Math.min(currentLiveOffset, maxTrackOffset));

            applyTransform(currentLiveOffset);
            setLiveOffset(currentLiveOffset);

            if (endSwipeTimer) clearTimeout(endSwipeTimer);
            if (moduloTimer) clearTimeout(moduloTimer);

            endSwipeTimer = setTimeout(() => {
                const slideElements = track.children;
                const viewportWidth = viewport.offsetWidth;
                const targetCenter = currentLiveOffset + viewportWidth / 2;

                let closestIndex = activeIndex;
                let smallestDistance = Infinity;

                Array.from(slideElements).forEach((slide, index) => {
                    const element = slide as HTMLElement;
                    const cardCenter = element.offsetLeft + element.offsetWidth / 2;
                    const dist = Math.abs(cardCenter - targetCenter);

                    if (dist < smallestDistance) {
                        smallestDistance = dist;
                        closestIndex = index;
                    }
                });

                accumulatedDelta = 0;

                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                    track.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

                    requestAnimationFrame(() => {
                        const targetOffset = calculateOffset(closestIndex);
                        applyTransform(targetOffset);
                        setCurrentIndex(closestIndex);

                        setTimeout(() => {
                            isWheelSwipingRef.current = false;
                            setLiveOffset(null);
                        }, 400);

                        if (isInfinite) {
                            moduloTimer = setTimeout(() => {
                                const middleIndex = totalItems + (((closestIndex % totalItems) + totalItems) % totalItems);

                                if (middleIndex === closestIndex) return;

                                setIsTransitioning(false);
                                track.style.transition = 'none';

                                void track.offsetHeight;

                                const silentOffset = calculateOffset(middleIndex);
                                applyTransform(silentOffset);
                                setCurrentIndex(middleIndex);
                            }, 400);
                        }
                    });
                });
            }, 120);
        };

        viewport.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            viewport.removeEventListener('wheel', handleWheel);
            if (endSwipeTimer) clearTimeout(endSwipeTimer);
            if (moduloTimer) clearTimeout(moduloTimer);
        };
    }, [totalItems, displayItems.length, isInfinite, calculateOffset, applyTransform]);

    const handleTransitionEnd = () => {
        if (!isInfinite) {
            setIsAnimating(false);
            return;
        }

        if (currentIndex >= totalItems * 2 || currentIndex < totalItems) {
            const normalizedIndex = totalItems + (((currentIndex % totalItems) + totalItems) % totalItems);
            setIsTransitioning(false);
            setCurrentIndex(normalizedIndex);
        }

        setIsAnimating(false);
    };

    const minOffset = calculateOffset(0, 'left');
    const maxOffset = calculateOffset(displayItems.length - 1, 'right');
    const activeOffset = liveOffset !== null ? liveOffset : calculateOffset(currentIndex);

    const canScrollLeft = isInfinite ? true : activeOffset > minOffset + 1;
    const canScrollRight = isInfinite ? true : activeOffset < maxOffset - 1;

    return (
        <div className="carousel">
            <div className="overlay-wrapper">
                <button
                    className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`}
                    style={{ width: getOverlayWidths(currentIndex).left, pointerEvents: !canScrollLeft ? 'none' : 'auto', cursor: !canScrollLeft ? 'default' : 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); prevSlide(); }} />
                <button
                    className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`}
                    style={{ width: getOverlayWidths(currentIndex).right, pointerEvents: !canScrollRight ? 'none' : 'auto', cursor: !canScrollRight ? 'default' : 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); nextSlide(); }} />
                <div className="carousel__viewport" ref={viewportRef}>
                    <div
                        ref={trackRef}
                        className={`carousel__track ${!isTransitioning ? 'carousel__track--no-transition' : ''}`}
                        onTransitionEnd={handleTransitionEnd}
                        style={{
                            paddingLeft: !isInfinite ? `${trackPadding.left}px` : 0,
                            paddingRight: !isInfinite ? `${trackPadding.right}px` : 0,
                        }}
                    >
                        {displayItems.map((child, idx) => (
                            <div className="carousel__slide" key={idx}>
                                {child}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};