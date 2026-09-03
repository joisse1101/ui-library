import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';

export interface CarouselProps {
    children: React.ReactNode;
    infinite?: boolean;
}

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
    const [offset, setOffset] = useState(0);
    const [trackPadding, setTrackPadding] = useState({ left: 0, right: 0 });

    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // 1. Calculate inline padding strictly for non-infinite mode
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

            const leftPad = (viewportWidth / 2) - (firstSlide.offsetWidth / 2);
            const rightPad = (viewportWidth / 2) - (lastSlide.offsetWidth / 2);

            setTrackPadding({
                left: Math.max(0, leftPad),
                right: Math.max(0, rightPad),
            });
        }
    }, [isInfinite]);

    // 2. Pure offset calculation using target card's left position
    const calculateOffset = useCallback((index: number) => {
        if (!trackRef.current || !viewportRef.current) return 0;

        const slideElements = trackRef.current.children;
        const viewportWidth = viewportRef.current.offsetWidth;
        const targetSlide = slideElements[index] as HTMLElement;

        if (targetSlide) {
            const cardLeftPosition = targetSlide.offsetLeft;
            const cardWidth = targetSlide.offsetWidth;

            return cardLeftPosition - (viewportWidth / 2) + (cardWidth / 2);
        }

        return 0;
    }, []);

    useLayoutEffect(() => {
        updatePadding();
        const initialOffset = calculateOffset(currentIndex);
        setOffset(initialOffset);
    }, [currentIndex, calculateOffset, updatePadding]);

    useEffect(() => {
        const handleResize = () => {
            updatePadding();
            setOffset(calculateOffset(currentIndex));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentIndex, calculateOffset, updatePadding]);

    const nextSlide = () => {
        if (isAnimating) return;
        if (!infinite && currentIndex >= totalItems - 1) return;

        setIsAnimating(true);
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        if (!infinite && currentIndex <= 0) return;

        setIsAnimating(true);
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    };

    const handleTransitionEnd = () => {
        if (!isInfinite) {
            setIsAnimating(false);
            return;
        }

        if (currentIndex === totalItems * 2) {
            setIsTransitioning(false);
            setCurrentIndex(totalItems);
        } else if (currentIndex === totalItems - 1) {
            setIsTransitioning(false);
            setCurrentIndex(totalItems * 2 - 1);
        }

        setIsAnimating(false);
    };

    const canScrollLeft = isInfinite ? true : currentIndex > 0;
    const canScrollRight = isInfinite ? true : currentIndex < totalItems - 1;

    return (
        <div className="carousel">
            <button
                className="carousel__button carousel__button--prev"
                onClick={prevSlide}
                disabled={isAnimating}
                aria-label="Previous slide"
            >
                &#10094;
            </button>

            <div className="overlay-wrapper">
                <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
                <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />
                <div className="carousel__viewport" ref={viewportRef}>
                    <div
                        ref={trackRef}
                        className={`carousel__track ${!isTransitioning ? 'carousel__track--no-transition' : ''}`}
                        onTransitionEnd={handleTransitionEnd}
                        style={{
                            transform: `translateX(-${offset}px)`,
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

            <button
                className="carousel__button carousel__button--next"
                onClick={nextSlide}
                disabled={isAnimating}
                aria-label="Next slide"
            >
                &#10095;
            </button>
        </div>
    );
};