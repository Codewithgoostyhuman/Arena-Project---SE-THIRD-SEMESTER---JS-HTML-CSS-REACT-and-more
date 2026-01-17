import React, { useState } from 'react';
import { apiService } from '../../APIs/apiService';
export default function CreateGameForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'TicTacToe',
        minPlayers: 2,
        maxPlayers: 2,
        rules: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.operator.createGame(formData);
            onSuccess();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                    title="Name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                    title="Type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="TicTacToe">Tic Tac Toe</option>
                        <option value="RockPaperScissors">Rock Paper Scissors</option>
                        <option value="NumberGuessDuel">Number Guess Duel</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                title="Description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                />
            </div>

            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
                Create Game
            </button>
        </form>
    );
}
