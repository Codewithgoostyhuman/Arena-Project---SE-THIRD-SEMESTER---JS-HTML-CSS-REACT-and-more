import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function SponsorshipRequests({fetchWithAuth}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await fetchWithAuth('/advertiser/sponsorship-requests');
      setRequests(data);
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (requestId, accept) => {
    try {
      await fetchWithAuth(`/advertiser/sponsorship-request/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept })
      });
      alert(`Sponsorship ${accept ? 'accepted' : 'declined'}`);
      loadRequests();
    } catch (err) {
      alert('Error responding to request');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sponsorship Requests</h2>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Pending Requests</h3>
          <p className="text-gray-600">You'll see sponsorship requests here when league owners send them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => (
            <div key={req._id} className="bg-white p-6 rounded-lg shadow border-2 border-yellow-100">
              <h3 className="text-xl font-bold mb-3">{req.tournament?.name}</h3>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">🏆 League:</span>
                  <span className="font-semibold">{req.tournament?.league?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">🎮 Game:</span>
                  <span className="font-semibold">{req.tournament?.league?.game?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">📅 Requested:</span>
                  <span className="font-semibold">{new Date(req.requestedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(req._id, true)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond(req._id, false)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}