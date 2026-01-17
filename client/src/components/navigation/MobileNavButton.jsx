import React from 'react';
export default function MobileNavButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
        >
            {children}
        </button>
    );
}