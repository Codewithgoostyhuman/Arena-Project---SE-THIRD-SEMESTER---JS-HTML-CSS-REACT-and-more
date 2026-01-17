import React from 'react';
export default function StatusBadge({ status }) {
    const styles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        inactive: 'bg-gray-100 text-gray-800',
        ongoing: 'bg-blue-100 text-blue-800',
        finished: 'bg-gray-100 text-gray-800',
        open_for_applications: 'bg-green-100 text-green-800',
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status] || styles.inactive}`}>
            {status}
        </span>
    );
}