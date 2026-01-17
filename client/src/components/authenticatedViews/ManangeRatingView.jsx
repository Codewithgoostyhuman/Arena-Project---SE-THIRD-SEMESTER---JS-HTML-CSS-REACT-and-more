import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, RefreshCw, Star } from 'lucide-react';

// Create/Edit Rating Formula Form
function RatingFormulaForm({ onSuccess, onCancel, existingFormula = null }) {
    const [formData, setFormData] = useState({
        name: existingFormula?.name || '',
        description: existingFormula?.description || '',
        winnerScore: existingFormula?.winnerScore || 3,
        loserScore: existingFormula?.loserScore || 0,
        drawScore: existingFormula?.drawScore || 1,
        isDefault: existingFormula?.isDefault || false
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!formData.name || !formData.description) {
            setError('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const url = existingFormula 
                ? `http://localhost:5000/api/operator/rating-formula/${existingFormula._id}`
                : 'http://localhost:5000/api/operator/rating-formula';
            
            const method = existingFormula ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to save rating formula');
            }

            alert(`Rating formula ${existingFormula ? 'updated' : 'created'} successfully!`);
            onSuccess();
        } catch (error) {
            console.error('Failed to save rating formula:', error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    {existingFormula ? 'Edit Rating Formula' : 'Create New Rating Formula'}
                </h2>
                {onCancel && (
                    <button 
                        onClick={onCancel} 
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Formula Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Standard Scoring System"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        rows="3"
                        placeholder="Describe how this rating formula works..."
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Winner Score <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.winnerScore}
                            onChange={(e) => setFormData({ ...formData, winnerScore: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Points awarded for winning</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Draw Score <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.drawScore}
                            onChange={(e) => setFormData({ ...formData, drawScore: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Points for a draw</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loser Score <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.loserScore}
                            onChange={(e) => setFormData({ ...formData, loserScore: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Points for losing</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Set as default formula
                    </label>
                    <Star className="h-4 w-4 text-yellow-500 ml-1" />
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                    >
                        {submitting ? 'Saving...' : (existingFormula ? 'Update Formula' : 'Create Formula')}
                    </button>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Main Manage Rating Formulas View
export default function ManageRatingFormulasView() {
    const [formulas, setFormulas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingFormula, setEditingFormula] = useState(null);

    useEffect(() => {
        loadFormulas();
    }, []);

    const loadFormulas = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:5000/api/operator/rating-formulas', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load rating formulas');
            }

            const data = await response.json();
            const formulasData = Array.isArray(data) ? data : (data.formulas || []);
            setFormulas(formulasData);
        } catch (error) {
            console.error('Failed to load rating formulas:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (formulaId) => {
        if (!window.confirm('Are you sure you want to delete this rating formula?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/operator/rating-formula/${formulaId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete rating formula');
            }

            alert('Rating formula deleted successfully');
            loadFormulas();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingFormula(null);
        loadFormulas();
    };

    const handleEdit = (formula) => {
        setEditingFormula(formula);
        setShowForm(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading rating formulas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Manage Rating Formulas</h1>
                    <p className="text-gray-600 mt-2">Create and manage scoring systems for leagues</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingFormula(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition font-medium"
                >
                    <Plus className="h-5 w-5" />
                    Add Formula
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Error loading rating formulas</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                        <button 
                            onClick={loadFormulas}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {showForm && (
                <RatingFormulaForm 
                    existingFormula={editingFormula}
                    onSuccess={handleFormSuccess} 
                    onCancel={() => {
                        setShowForm(false);
                        setEditingFormula(null);
                    }}
                />
            )}

            {formulas.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-lg">No rating formulas found</p>
                    <p className="text-gray-400 text-sm mt-2">Create your first rating formula to get started</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Your First Formula
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formulas.map(formula => (
                            <div key={formula._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 relative">
                                {formula.isDefault && (
                                    <div className="absolute top-2 right-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                            <Star className="h-3 w-3" />
                                            Default
                                        </span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-semibold text-gray-900 pr-16">{formula.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(formula)}
                                            className="text-blue-600 hover:text-blue-900 transition"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(formula._id)}
                                            className="text-red-600 hover:text-red-900 transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{formula.description}</p>
                                
                                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Win:</span>
                                        <span className="font-semibold text-green-600">{formula.winnerScore} points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Draw:</span>
                                        <span className="font-semibold text-blue-600">{formula.drawScore} points</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Loss:</span>
                                        <span className="font-semibold text-gray-600">{formula.loserScore} points</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        formula.status === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {formula.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-sm text-gray-600">
                        Showing {formulas.length} {formulas.length === 1 ? 'formula' : 'formulas'}
                    </div>
                </>
            )}
        </div>
    );
}