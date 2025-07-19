// This is a new file
import React, { ReactNode } from 'react';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    colors?: string[];
    animationSpeed?: number;
}

export default function GradientText({
    children,
    className = "",
    colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
    animationSpeed = 8,
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        animationDuration: `${animationSpeed}s`,
    };

    return (
        <span
            className={`inline-block text-transparent bg-cover animate-gradient ${className}`}
            style={{
                ...gradientStyle,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                backgroundSize: "300% 100%",
            }}
        >
            {children}
        </span>
    );
}
