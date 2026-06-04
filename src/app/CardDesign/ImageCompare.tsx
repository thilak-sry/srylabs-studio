"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ImageCompareProps {
    beforeImage: string;
    afterImage: string;
    alt: string;
    className?: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({
    beforeImage,
    afterImage,
    alt,
    className = "",
}) => {
    // We use state ONLY for loading status, not for drag updates
    const [isLoaded, setIsLoaded] = useState(false);

    // Refs for direct DOM manipulation and state tracking without re-renders
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const beforeImageRef = useRef<HTMLDivElement>(null);
    const beforeLabelRef = useRef<HTMLDivElement>(null);
    const afterLabelRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Initialize position at 50%
    const positionRef = useRef(50);

    // Loading tracking
    const imagesLoaded = useRef(0);
    const handleImageLoad = () => {
        imagesLoaded.current += 1;
        if (imagesLoaded.current >= 2) {
            setIsLoaded(true);
        }
    };

    // Performance: Update the DOM directly using CSS variables or styles
    const updateDOM = (pos: number) => {
        if (containerRef.current) {
            containerRef.current.style.setProperty('--position', `${pos}%`);
        }

        // Label Logic: Hide Before at < 25%, Hide After at > 75%
        if (beforeLabelRef.current) {
            beforeLabelRef.current.style.opacity = pos < 25 ? '0' : '1';
        }
        if (afterLabelRef.current) {
            afterLabelRef.current.style.opacity = pos > 75 ? '0' : '1';
        }
    };

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;

        // Calculate percentage
        let pos = (x / width) * 100;

        // Clamp between 0 and 100
        pos = Math.min(Math.max(pos, 0), 100);

        positionRef.current = pos;

        // Use requestAnimationFrame for smooth visual updates
        requestAnimationFrame(() => {
            updateDOM(pos);
        });
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        isDragging.current = true;

        // Add global listeners to handle dragging outside the component
        if ('touches' in e) {
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onStop);
        } else {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onStop);
        }
    }, []);

    const onStop = useCallback(() => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onStop);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onStop);
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        handleMove(e.clientX);
    }, [handleMove]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging.current) return;
        handleMove(e.touches[0].clientX);
    }, [handleMove]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        let newPos = positionRef.current;
        if (e.key === 'ArrowLeft') newPos -= 5;
        if (e.key === 'ArrowRight') newPos += 5;

        if (newPos !== positionRef.current) {
            newPos = Math.min(Math.max(newPos, 0), 100);
            positionRef.current = newPos;
            updateDOM(newPos);
        }
    };

    return (
        <div
            className={`relative w-full overflow-hidden select-none group ${className}`}
            ref={containerRef}
            style={{ '--position': '50%' } as React.CSSProperties}
            role="slider"
            aria-label="Image Comparison"
            aria-valuenow={positionRef.current}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Loading Indicator */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
                    <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {/* Container aspect ratio hack or fixed height can be applied via className */}

            {/* AFTER Image (Background) */}
            <img
                src={afterImage}
                alt={`After ${alt}`}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleImageLoad}
                draggable={false}
                decoding="async"
            />

            {/* BEFORE Image (Foreground) - Clipped */}
            <div
                ref={beforeImageRef}
                className={`absolute inset-0 w-full h-full pointer-events-none select-none will-change-[clip-path] transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    clipPath: 'polygon(0 0, var(--position) 0, var(--position) 100%, 0 100%)',
                    zIndex: 10
                }}
            >
                <img
                    src={beforeImage}
                    alt={`Before ${alt}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    draggable={false}
                    decoding="async"
                />
            </div>

            {/* Slider Handle */}
            {/* Uses translateX for performant movement */}
            <div
                ref={sliderRef}
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                style={{
                    left: 'var(--position)',
                    transform: 'translateX(-50%)',
                    touchAction: 'none' // Important for touch devices
                }}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
            >
                {/* Handle Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-[3px] border-zinc-200 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-ew-resize">
                    <div className="flex gap-1.5 text-zinc-800 items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" className="rotate-180 origin-center" /></svg>
                    </div>
                </div>
            </div>


            {/* Labels for verification */}
            <div
                ref={beforeLabelRef}
                className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold z-20 pointer-events-none transition-opacity duration-300"
            >
                Before
            </div>
            <div
                ref={afterLabelRef}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold z-20 pointer-events-none transition-opacity duration-300"
            >
                After
            </div>

        </div>
    );
};

export default ImageCompare;
