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
                    >
                        <div className="">
                            <h3 className="">{item.title}</h3>
                            <p className="">{item.description}</p>
                            {item.link && (
                                <a href={item.link.url} className="">
                                    {item.link.label}
                                </a>
                            )}
                        </div>
                    </div>
                );
            })}
        </Carousel>
        // <div className={`carousel overlay-wrapper ${isInfinite ? 'carousel--infinite' : ''}`}>
        //     <div className={`overlay-left overlay-left-main ${!canScrollLeft && !isInfinite ? 'hidden' : ''}`} />
        //     <div className={`overlay-right overlay-right-main ${!canScrollRight && !isInfinite ? 'hidden' : ''}`} />
        //     <div
        //         className="carousel__track overlay-component"
        //         ref={scrollContainerRef}
        //         onScroll={handleScroll}
        //     >
        //     </div>
        // </div>
    );
};