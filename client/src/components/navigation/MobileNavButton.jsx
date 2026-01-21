import React from 'react';
export default function MobileNavButton({ children, onClick }) {
    return (
        <button
            onClick={onClick}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
            {children}
        </button>
    );
}