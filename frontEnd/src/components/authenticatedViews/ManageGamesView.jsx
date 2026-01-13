import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { apiService } from '../../APIs/apiService';
import CreateGameForm from './CreateGamesForm';
export default function ManageGamesView() {
    const [games, setGames] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadGames();
    }, []);

    const loadGames = async () => {
        try {
            const data = await apiService.operator.getAllGames();
            setGames(data);
        } catch (error) {
            console.error('Failed to load games:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Manage Games</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5 inline mr-2" />
                    Add Game
                </button>
            </div>

            {showForm && <CreateGameForm onSuccess={() => { setShowForm(false); loadGames(); }} />}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map(game => (
                    <div key={game._id} className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{game.description}</p>
                        <div className="text-sm text-gray-500">
                            <p>Type: {game.type}</p>
                            <p>Players: {game.minPlayers}-{game.maxPlayers}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
