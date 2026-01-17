import React from "react";
export default function LoadingScreen() {
    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
            <div className="text-white text-2xl">Loading...</div>
        </div>
    );
}