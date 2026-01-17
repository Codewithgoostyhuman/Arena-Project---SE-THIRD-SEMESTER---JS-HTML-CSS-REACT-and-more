import React from 'react';
export default function NavButton({ children, onClick, active }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            {children}
        </button>
    );
}