import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function Sponsorships({fetchWithAuth }) {
  const [sponsorships, setSponsorship] = useState([]);
  const [loading, setLoading] = useState(true);
const loadSponsorship = async () => {
    try {
      const data = await fetchWithAuth('/advertiser/sponsored-tournaments');
      setSponsorship(data);
    } catch (err) {
      console.error('Error loading sponsorships:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSponsorship();
  }, []);

  

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Sponsored Tournaments</h2>

      {sponsorships.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Sponsored Tournaments</h3>
          <p className="text-gray-600">Respond to sponsorship requests to start sponsoring!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">League</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sponsorships.map(sp => (
                <tr key={sp._id}>
                  <td className="px-6 py-4 text-sm font-medium">{sp.tournament?.name}</td>
                  <td className="px-6 py-4 text-sm">{sp.tournament?.league?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sp.type === 'exclusive' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sp.type === 'exclusive' ? '⭐ Exclusive' : '📊 Per Unit'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ${sp.amountPaid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {sp.startDate && new Date(sp.startDate).toLocaleDateString()} - 
                    {sp.endDate && new Date(sp.endDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
