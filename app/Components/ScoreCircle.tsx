import React from "react";

interface ScoreCircleProps {
    score: number;
    size?: number; // optional size prop
}

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, size = 100 }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = score / 100;
    const strokeDashoffset = circumference * (1 - progress);

    // Unique gradient ID per instance
    const gradId = `grad-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div
            className="relative"
            style={{ width: size, height: size }}
            aria-label={`Score ${score} out of 100`}
        >
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                    fill="transparent"
                />

                {/* Partial circle with gradient */}
                <defs>
                    <linearGradient id={gradId} x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF97AD" />
                        <stop offset="100%" stopColor="#5171FF" />
                    </linearGradient>
                </defs>
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke={`url(#${gradId})`}
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>

            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-semibold text-sm">{`${score}/100`}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
