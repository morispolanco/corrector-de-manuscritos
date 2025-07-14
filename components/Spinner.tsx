
import React from 'react';

interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-5 h-5 border-2',
        medium: 'w-8 h-8 border-4',
        large: 'w-16 h-16 border-4',
    };

    return (
        <div
            className={`${sizeClasses[size]} border-sky-400 border-t-transparent rounded-full animate-spin`}
            role="status"
            aria-label="Loading"
        >
        </div>
    );
};

export default Spinner;
