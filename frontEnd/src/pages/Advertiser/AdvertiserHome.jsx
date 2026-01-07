import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';

const API_BASE = 'http://localhost:5000';

const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchWithAuth('/advertiser/profile');
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-10 py-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Advertiser Dashboard</h1>
            {profile && (
              <p className="text-sm text-gray-600 mt-1">
                {profile.companyName} • Balance: ${profile.account?.balance.toFixed(2)}
              </p>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-10 py-5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('advertisements')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'advertisements'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            📢 Advertisements
          </button>
          <button
            onClick={() => setActiveTab('sponsorships')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'sponsorships'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            🤝 Sponsorships
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            📨 Requests
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'account'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            💳 Account
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'interests'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-purple-600'
            }`}
          >
            ⭐ Interests
          </button>
        </div>
      </nav>

      <main className="p-10">
        {activeTab === 'overview' && <Overview profile={profile} />}
        {activeTab === 'advertisements' && <Advertisements />}
        {activeTab === 'sponsorships' && <Sponsorships />}
        {activeTab === 'requests' && <SponsorshipRequests />}
        {activeTab === 'account' && <Account />}
        {activeTab === 'interests' && <Interests profile={profile} loadProfile={loadProfile} />}
      </main>
    </div>
  );
}

// ============================================
// OVERVIEW
// ============================================
function Overview({ profile }) {
  const [ads, setAds] = useState([]);
  const [sponsorships, setSponsorship] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adsData, sponsorshipsData] = await Promise.all([
        fetchWithAuth('/advertiser/advertisements'),
        fetchWithAuth('/advertiser/sponsored-tournaments')
      ]);
      setAds(adsData);
      setSponsorship(sponsorshipsData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Account Balance</div>
          <div className="text-3xl font-bold text-green-600">
            ${profile?.account?.balance.toFixed(2) || '0.00'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Active Ads</div>
          <div className="text-3xl font-bold text-blue-600">
            {ads.filter(a => a.status === 'active').length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Impressions</div>
          <div className="text-3xl font-bold text-purple-600">
            {totalImpressions.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Avg. CTR</div>
          <div className="text-3xl font-bold text-orange-600">
            {avgCTR}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Recent Advertisements</h3>
          {ads.length === 0 ? (
            <p className="text-gray-500">No advertisements yet</p>
          ) : (
            <div className="space-y-3">
              {ads.slice(0, 5).map(ad => (
                <div key={ad._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{ad.title}</div>
                    <div className="text-xs text-gray-500">
                      {ad.impressions} impressions • {ad.clicks} clicks
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    ad.status === 'active' ? 'bg-green-100 text-green-700' :
                    ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ad.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Sponsored Tournaments</h3>
          {sponsorships.length === 0 ? (
            <p className="text-gray-500">No sponsored tournaments yet</p>
          ) : (
            <div className="space-y-3">
              {sponsorships.slice(0, 5).map(sp => (
                <div key={sp._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{sp.tournament?.name}</div>
                    <div className="text-xs text-gray-500">
                      {sp.type === 'exclusive' ? '⭐ Exclusive' : '📊 Per Unit'}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-purple-600">
                    ${sp.amountPaid.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// ADVERTISEMENTS
// ============================================
function Advertisements() {
  const [ads, setAds] = useState([]);
  const [games, setGames] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    game: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adsData, gamesData] = await Promise.all([
        fetchWithAuth('/advertiser/advertisements'),
        fetchWithAuth('/games')
      ]);
      setAds(adsData);
      setGames(gamesData);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetchWithAuth('/advertiser/advertisement', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Advertisement created! Awaiting operator approval.');
      setShowForm(false);
      setFormData({ title: '', imageUrl: '', targetUrl: '', game: '' });
      loadData();
    } catch (err) {
      alert('Error creating advertisement: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this advertisement?')) return;
    
    try {
      await fetchWithAuth(`/advertiser/advertisement/${id}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (err) {
      alert('Error deleting advertisement');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Advertisements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          {showForm ? 'Cancel' : '+ Create Advertisement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-bold mb-4">Create Advertisement</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target URL *</label>
            <input
              type="url"
              value={formData.targetUrl}
              onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://yourwebsite.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Game (Optional)</label>
            <select
              value={formData.game}
              onChange={(e) => setFormData({...formData, game: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Games</option>
              {games.map(game => (
                <option key={game._id} value={game._id}>{game.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
          >
            Create Advertisement
          </button>
        </form>
      )}

      {ads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">No Advertisements</h3>
          <p className="text-gray-600">Create your first advertisement to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad._id} className="bg-white p-5 rounded-lg shadow border-2 border-purple-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold">{ad.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ad.status === 'active' ? 'bg-green-100 text-green-700' :
                  ad.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ad.status}
                </span>
              </div>

              <img 
                src={ad.imageUrl} 
                alt={ad.title}
                className="w-full h-32 object-cover rounded mb-3"
                onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Ad+Image'}
              />

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">👁️ Impressions:</span>
                  <span className="font-semibold">{ad.impressions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">👆 Clicks:</span>
                  <span className="font-semibold">{ad.clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">📊 CTR:</span>
                  <span className="font-semibold">{ad.ctr}%</span>
                </div>
                {ad.game && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">🎮 Game:</span>
                    <span className="font-semibold">{ad.game.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(ad._id)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SPONSORSHIPS
// ============================================
function Sponsorships() {
  const [sponsorships, setSponsorship] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSponsorship();
  }, []);

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

// ============================================
// SPONSORSHIP REQUESTS
// ============================================
function SponsorshipRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

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

// ============================================
// ACCOUNT
// ============================================
function Account() {
  const [account, setAccount] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const data = await fetchWithAuth('/advertiser/account');
      setAccount(data);
    } catch (err) {
      console.error('Error loading account:', err);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    
    try {
      await fetchWithAuth('/advertiser/account/payment', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          method: 'credit_card',
          transactionId: 'TXN' + Date.now()
        })
      });
      alert('Payment added successfully!');
      setShowPaymentForm(false);
      setPaymentAmount('');
      loadAccount();
    } catch (err) {
      alert('Error adding payment');
    }
  };

  if (!account) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account & Billing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Current Balance</div>
          <div className="text-3xl font-bold text-green-600">
            ${account.balance.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Charges</div>
          <div className="text-3xl font-bold text-red-600">
            ${account.charges.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-500 mb-1">Total Payments</div>
          <div className="text-3xl font-bold text-blue-600">
            ${account.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          {showPaymentForm ? 'Cancel' : '+ Add Payment'}
        </button>
      </div>

      {showPaymentForm && (
        <form onSubmit={handleAddPayment} className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-bold mb-4">Add Payment</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Add Payment
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Recent Charges</h3>
          {account.charges.length === 0 ? (
            <p className="text-gray-500">No charges yet</p>
          ) : (
            <div className="space-y-3">
              {account.charges.slice(0, 10).map((charge, idx) => (
                <div key={idx} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <div className="font-medium">{charge.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(charge.timestamp).toLocaleDateString()} • {charge.chargeType}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-red-600">
                    -${charge.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Recent Payments</h3>
          {account.payments.length === 0 ? (
            <p className="text-gray-500">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {account.payments.slice(0, 10).map((payment, idx) => (
                <div key={idx} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <div className="font-medium">Payment via {payment.method}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(payment.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +${payment.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// INTERESTS
// ============================================
function Interests({ profile, loadProfile }) {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
    if (profile?.leaguesOfInterest) {
      setSelectedLeagues(profile.leaguesOfInterest.map(l => l._id || l));
    }
  }, [profile]);

  const loadLeagues = async () => {
    try {
      const data = await fetchWithAuth('/leagues');
      setLeagues(data.filter(l => l.status === 'active'));
    } catch (err) {
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetchWithAuth('/advertiser/profile', {
        method: 'PUT',
        body: JSON.stringify({
          companyName: profile.companyName,
          leaguesOfInterest: selectedLeagues
        })
      });
      alert('Interests updated successfully!');
      loadProfile();
    } catch (err) {
      alert('Error updating interests: ' + err.message);
    }
  };

  const toggleLeague = (leagueId) => {
    if (selectedLeagues.includes(leagueId)) {
      setSelectedLeagues(selectedLeagues.filter(id => id !== leagueId));
    } else {
      setSelectedLeagues([...selectedLeagues, leagueId]);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">League Interests for Exclusive Sponsorships</h2>
      
      <p className="text-gray-600 mb-6">
        Select leagues you're interested in sponsoring exclusively. League owners will see your interest when creating tournaments.
      </p>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {leagues.map(league => (
            <label 
              key={league._id} 
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedLeagues.includes(league._id) 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedLeagues.includes(league._id)}
                onChange={() => toggleLeague(league._id)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <div className="font-bold">{league.name}</div>
                <div className="text-sm text-gray-600">
                  {league.game?.name} • {league.players?.length || 0} players
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedLeagues.length} league{selectedLeagues.length !== 1 ? 's' : ''} selected
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Save Interests
          </button>
        </div>
      </div>

      {selectedLeagues.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div className="flex-1">
              <div className="font-medium text-blue-900">How it works:</div>
              <p className="text-sm text-blue-800 mt-1">
                When league owners create tournaments in these leagues, they'll see your company in their list of 
                potential exclusive sponsors. They can then send you sponsorship requests, which you can accept or decline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}