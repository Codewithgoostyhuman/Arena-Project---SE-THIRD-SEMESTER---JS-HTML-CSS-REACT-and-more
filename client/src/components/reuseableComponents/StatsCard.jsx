import React from 'react';
export default function StatsCard({ title, value, icon }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                {icon}
            </div>
        </div>
    );
}