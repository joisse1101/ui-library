import React from 'react';
import { Carousel } from './Carousel';

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
    isInfinite?: boolean;
}

/**
 * `CardCarousel` component that renders a carousel of cards, supporting infinite scrolling if specified.
 */

export const CardCarousel: React.FC<CardCarouselProps> = ({ items, isInfinite = false }) => {
    const displayItems = items;
    return (
        <Carousel
            infinite={isInfinite}
        >
            {displayItems.map((item) => {
                return (
                    <div
                        className="card"
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
                );
            })}
        </Carousel>
    );
};