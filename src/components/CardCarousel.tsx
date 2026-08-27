import { useCanSideScroll } from '@hooks/useCanSideScroll';
import React, { useRef, useState, useEffect } from 'react';

export interface CardProps {
    id: string | number;
    title: string;
    description: string;
    image?: string;
    link?: {
        label: string;
        url: string;
    };
}

interface CardCarouselProps {
    items: CardProps[];
}

export const CardCarousel: React.FC<CardCarouselProps> = ({ items }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());
    const { canScrollLeft, canScrollRight } = useCanSideScroll(scrollContainerRef);

    const [activeId, setActiveId] = useState<string>(String(items[0]?.id ?? ''));

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observerOptions: IntersectionObserverInit = {
            root: container,
            rootMargin: '0px -40% 0px -40%',
            threshold: 0.1,
        };

        const handleIntersect: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const cardId = entry.target.getAttribute('data-id');
                    if (cardId !== null) {
                        setActiveId(cardId);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        const slides = container.querySelectorAll('.carousel__slide');
        slides.forEach((slide) => observer.observe(slide));

        return () => observer.disconnect();
    }, [items]);

    const scrollToCard = (id: string | number) => {
        const card = cardRefs.current.get(id);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    return (
        <div className="carousel overlay-wrapper">
            <div className={`overlay-left overlay-left-main ${!canScrollLeft ? 'hidden' : ''}`} />
            <div className={`overlay-right overlay-right-main ${!canScrollRight ? 'hidden' : ''}`} />
            <div className="carousel__track overlay-component" ref={scrollContainerRef}>
                {items.map((item) => {
                    return (
                        <div
                            className={`carousel__slide`}
                            key={item.id}
                            data-id={String(item.id)}
                        >
                            <div
                                className="card"
                                ref={(el) => {
                                    if (el) {
                                        cardRefs.current.set(item.id, el);
                                    } else {
                                        cardRefs.current.delete(item.id);
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={item.title}
                                onClick={() => scrollToCard(item.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        scrollToCard(item.id);
                                    }
                                }}
                                style={{ '--bg-image': item.image ? `url(${item.image})` : 'none' } as React.CSSProperties}
                            >
                                <div className="card__content">
                                    <h3 className="card__title">{item.title}</h3>
                                    <p className="card__description">{item.description}</p>
                                    {item.link && (
                                        <a href={item.link.url} className="card__link">
                                            {item.link.label}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};