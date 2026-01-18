import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../APIs/apiService';
import LoadingScreen from '../reuseableComponents/LoadingScreen';

const TournamentBracketView = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [bracket, setBracket] = useState({});
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBracket();
  }, [tournamentId]);

  const fetchBracket = async () => {
    try {
      const response = await apiService.get(`/tournaments/${tournamentId}/bracket`);
      setBracket(response.data.bracket);
      setTournament(response.data.tournament);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bracket:', error);
      setLoading(false);
    }
  };

  const getRoundName = (roundNumber, totalRounds) => {
    if (roundNumber === totalRounds) return 'Finals';
    if (roundNumber === totalRounds - 1) return 'Semi-Finals';
    if (roundNumber === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNumber}`;
  };

  const handleMatchClick = (matchId) => {
    navigate(`/match/${matchId}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const rounds = Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b));
  const totalRounds = rounds.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{tournament?.name}</h1>
          <p className="text-gray-400 text-lg">
            {tournament?.style} Tournament - {tournament?.status}
          </p>
        </div>

        {/* Bracket */}
        <div className="overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {rounds.map((roundNum) => (
              <div key={roundNum} className="flex flex-col gap-4 min-w-70">
                
                {/* Round Header */}
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <h3 className="text-xl font-bold">
                    {getRoundName(parseInt(roundNum), totalRounds)}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {bracket[roundNum].length} {bracket[roundNum].length === 1 ? 'Match' : 'Matches'}
                  </p>
                </div>

                {/* Matches in Round */}
                {bracket[roundNum].map((match, index) => (
                  <div
                    key={match._id}
                    onClick={() => handleMatchClick(match._id)}
                    className={`
                      bg-gray-800 rounded-lg p-4 cursor-pointer
                      transition-all duration-200 hover:bg-gray-700
                      border-2 
                      ${match.status === 'live' ? 'border-green-500' : 
                        match.status === 'finished' ? 'border-blue-500' : 
                        'border-gray-700'}
                    `}
                  >
                    {/* Match Number */}
                    <div className="text-xs text-gray-400 mb-2">
                      Match {match.matchNumber}
                      {match.isFinals && ' 🏆'}
                    </div>

                    {/* Players */}
                    <div className="space-y-2">
                      {match.players.length > 0 ? (
                        match.players.map((player, idx) => (
                          <div
                            key={player._id}
                            className={`
                              flex justify-between items-center p-2 rounded
                              ${match.winner?._id === player._id ? 
                                'bg-green-500/20 font-bold' : 
                                'bg-gray-700/50'}
                            `}
                          >
                            <span className="truncate">{player.name}</span>
                            {match.winner?._id === player._id && (
                              <span className="text-green-400 ml-2">✓</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 italic text-sm py-4 text-center">
                          TBD
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 flex justify-between items-center">
                      <span className={`
                        text-xs px-2 py-1 rounded
                        ${match.status === 'live' ? 'bg-green-500 text-white' :
                          match.status === 'finished' ? 'bg-blue-500 text-white' :
                          match.status === 'ready' ? 'bg-yellow-500 text-black' :
                          'bg-gray-600 text-gray-300'}
                      `}>
                        {match.status.toUpperCase()}
                      </span>

                      {match.bestOf > 1 && (
                        <span className="text-xs text-gray-400">
                          Best of {match.bestOf}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tournament Info */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Players</div>
            <div className="text-2xl font-bold">{tournament?.players?.length || 0}</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Matches</div>
            <div className="text-2xl font-bold">
              {Object.values(bracket).reduce((sum, round) => sum + round.length, 0)}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Status</div>
            <div className={`text-2xl font-bold ${
              tournament?.status === 'ongoing' ? 'text-green-400' :
              tournament?.status === 'finished' ? 'text-blue-400' :
              'text-yellow-400'
            }`}>
              {tournament?.status?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracketView;