import React from 'react';
import { getBarcodeBinary } from '@/lib/barcodeHelper';

interface BarcodeProps {
    value: string;
    width?: number;
    height?: number;
}

export const Barcode: React.FC<BarcodeProps> = ({ value, width = 180, height = 50 }) => {
    if (!value) return null;
    const result = getBarcodeBinary(value);
    const binary = result.binary;
    const barCount = binary.length;
    
    // Calculate precise bar width to fit container width
    const barWidth = width / barCount;
    
    return (
        <svg 
            width="100%" 
            height={height} 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="none"
            className="mx-auto select-none"
        >
            {binary.split('').map((bit, index) => {
                if (bit === '1') {
                    return (
                        <rect
                            key={index}
                            x={index * barWidth}
                            y={0}
                            width={barWidth + 0.05} // slight padding overlap to avoid floating-point gaps
                            height={height}
                            fill="#000"
                        />
                    );
                }
                return null;
            })}
        </svg>
    );
};
