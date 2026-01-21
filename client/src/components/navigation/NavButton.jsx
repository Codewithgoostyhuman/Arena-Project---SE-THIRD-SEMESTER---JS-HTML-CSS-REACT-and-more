import React from 'react';
export default function NavButton({ children, onClick, active }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active 
                ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)] border border-indigo-500/30' 
                : 'text-slate-200 hover:text-white hover:bg-white/10 font-medium'
            }`}
        >
            {children}
        </button>
    );
}