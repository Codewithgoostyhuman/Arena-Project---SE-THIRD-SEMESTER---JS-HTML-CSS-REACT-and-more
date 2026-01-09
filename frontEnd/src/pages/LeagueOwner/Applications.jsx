import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function Applications({fetchWithAuth}) {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await fetchWithAuth('/leagues/my-leagues');
      const leaguesWithApps = data.filter(league => 
        league.applications && league.applications.length > 0
      );
      setLeagues(leaguesWithApps);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leagueId, applicationId) => {
    try {
      await fetchWithAuth(`/league/${leagueId}/approve-application`, {
        method: 'POST',
        body: JSON.stringify({ applicationId })
      });
      loadApplications();
    } catch (err) {
      alert('Error approving application');
    }
  };

  const handleReject = async (leagueId, applicationId) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await fetchWithAuth(`/league/${leagueId}/reject-application`, {
        method: 'POST',
        body: JSON.stringify({ applicationId })
      });
      loadApplications();
    } catch (err) {
      alert('Error rejecting application');
    }
  };

  if (loading) return <div className="text-center py-10 text-xl text-gray-600">Loading applications...</div>;

  const pendingCount = leagues.reduce((total, league) => 
    total + league.applications.filter(app => app.status === 'pending').length, 0
  );

  if (leagues.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2">No Applications</h2>
        <p className="text-gray-600">When players apply to join your leagues, they will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Player Applications</h2>
        <div className="text-sm text-gray-600">
          <span>Pending: {pendingCount}</span>
        </div>
      </div>

      {leagues.map(league => (
        <div key={league._id} className="mb-8">
          <h3 className="text-xl font-bold mb-3">{league.name}</h3>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {league.applications.map(app => (
                  <tr key={app._id}>
                    <td className="px-6 py-4 text-sm">{app.player?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        app.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(league._id, app._id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(league._id, app._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {app.status !== 'pending' && app.reviewedAt && (
                        <span className="text-xs text-gray-500">
                          Reviewed {new Date(app.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}