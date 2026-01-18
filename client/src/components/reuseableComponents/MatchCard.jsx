import React from 'react';

const MatchCard = ({ match, setCurrentView, setSelectedMatchId }) => {
  const handleViewMatch = () => {
    console.log('MatchCard clicked!');
    console.log('Match ID:', match._id);
    console.log('setCurrentView:', setCurrentView);
    console.log('setSelectedMatchId:', setSelectedMatchId);
    
    if (!setSelectedMatchId) {
      console.error('setSelectedMatchId is undefined!');
      return;
    }
    
    if (!setCurrentView) {
      console.error('setCurrentView is undefined!');
      return;
    }
    
    console.log('About to set match ID to:', match._id);
    setSelectedMatchId(match._id); // Set the match ID
    
    console.log('About to set view to: match');
    setCurrentView('match'); // Navigate to match view
    
    console.log('Navigation commands sent!');
  };

  // Prevent the onClick from being blocked
  const handleClick = (e) => {
    e.stopPropagation();
    handleViewMatch();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {match.game?.name || 'Match'}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          match.status === 'live' ? 'bg-green-100 text-green-800' :
          match.status === 'finished' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {match.status?.toUpperCase() || 'PENDING'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{match.players?.[0]?.name || 'Player 1'}</span>
          {match.score && <span className="font-bold">{match.score.player1}</span>}
        </div>
        <div className="text-center text-xs text-gray-400">VS</div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{match.players?.[1]?.name || 'Player 2'}</span>
          {match.score && <span className="font-bold">{match.score.player2}</span>}
        </div>
      </div>

      {match.tournament && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {match.tournament.name} - Round {match.round}
          </p>
        </div>
      )}

      <button
        onClick={handleClick}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
      >
        View Match
      </button>
    </div>
  );
};

export default MatchCard;