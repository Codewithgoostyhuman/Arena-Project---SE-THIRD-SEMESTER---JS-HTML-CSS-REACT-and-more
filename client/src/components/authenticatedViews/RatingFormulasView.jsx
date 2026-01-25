import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';
import { MathOperations, Trash, PencilSimple, Plus, Check, X } from '@phosphor-icons/react';

const RatingFormulasView = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    winnerScore: 3,
    loserScore: 0,
    drawScore: 1,
    isDefault: false
  });

  useEffect(() => {
    fetchFormulas();
  }, []);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const data = await apiService.operator.getAllRatingFormulas();
      setFormulas(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching formulas:', err);
      setError('Failed to load rating formulas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      winnerScore: 3,
      loserScore: 0,
      drawScore: 1,
      isDefault: false
    });
    setEditingFormula(null);
    setShowCreateModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFormula) {
        await apiService.operator.updateRatingFormula(editingFormula._id, formData);
      } else {
        await apiService.operator.createRatingFormula(formData);
      }
      fetchFormulas();
      resetForm();
    } catch (err) {
      console.error('Error saving formula:', err);
      setError(err.message || 'Failed to save formula');
    }
  };

  const handleEdit = (formula) => {
    setEditingFormula(formula);
    setFormData({
      name: formula.name,
      description: formula.description,
      winnerScore: formula.winnerScore,
      loserScore: formula.loserScore,
      drawScore: formula.drawScore,
      isDefault: formula.isDefault
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this formula? This may affect existing leagues.')) {
      return;
    }
    try {
      await apiService.operator.deleteRatingFormula(id);
      fetchFormulas();
    } catch (err) {
      console.error('Error deleting formula:', err);
      setError('Failed to delete formula');
    }
  };

  if (loading && !formulas.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MathOperations className="text-indigo-600" size={32} />
            Rating Formulas
          </h1>
          <p className="text-gray-500 mt-2">Define how points are awarded in leagues</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus weight="bold" />
          Create Formula
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formulas.map((formula) => (
          <div key={formula._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(formula)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <PencilSimple size={20} />
              </button>
              <button
                onClick={() => handleDelete(formula._id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash size={20} />
              </button>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{formula.name}</h3>
                {formula.isDefault && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    Default
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{formula.description}</p>

            <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-lg p-3">
              <div className="p-2">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Win</div>
                <div className="text-xl font-black text-green-600">+{formula.winnerScore}</div>
              </div>
              <div className="p-2 border-x border-gray-200">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Draw</div>
                <div className="text-xl font-black text-yellow-600">+{formula.drawScore}</div>
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Loss</div>
                <div className="text-xl font-black text-red-600">{formula.loserScore}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={resetForm}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {editingFormula ? 'Edit Rating Formula' : 'Create New Rating Formula'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      placeholder="e.g. Standard, High Stakes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      rows="2"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Win Points</label>
                      <input
                        type="number"
                        required
                        value={formData.winnerScore}
                        onChange={(e) => setFormData({...formData, winnerScore: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Draw Points</label>
                      <input
                        type="number"
                        required
                        value={formData.drawScore}
                        onChange={(e) => setFormData({...formData, drawScore: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loss Points</label>
                      <input
                        type="number"
                        required
                        value={formData.loserScore}
                        onChange={(e) => setFormData({...formData, loserScore: parseInt(e.target.value)})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      />
                    </div>
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                      Set as Default Formula
                    </label>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      {editingFormula ? 'Save Changes' : 'Create Formula'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingFormulasView;
