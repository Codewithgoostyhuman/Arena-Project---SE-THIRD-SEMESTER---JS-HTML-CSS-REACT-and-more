import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
import Account from './Account';
import SponsorshipRequests from './SponsorshipRequest';
import Sponsorships from './Sponsorship';
import Interests from './Interests';
import Overview from './Overview';
import Advertisements from './Advertisement';
import { Navigate } from 'react-router-dom';

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
  if (!response.ok) {
  const text = await response.text();
  console.error("Profile API failed:", response.status, text);
  throw new Error(text);
}

  return response.json();
};

export default function AdvertiserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
useEffect(() => {
    if (!authLoading && user) {
      loadProfile();
    }
  }, [authLoading, user]);


  const loadProfile = async () => {
    try {
      const data = await fetchWithAuth('/advertiser/profile');
      console.log('Profile loaded:', data);
      setProfile(data);
    } catch (err) {
      if (err.message.includes("403")) {
    setApprovalPending(true);
    return;
  }
  alert("Failed to load profile");
      console.error('Error loading profile:', err);
      alert('Failed to load profile. Your account may need operator approval.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (authLoading || loading) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-2xl">Loading...</div>
    </div>
  );
}

if (!user) {
  return <Navigate to="/login" replace />;
}

if (user.role !== 'advertiser') {
  return <Navigate to="/unauthorized" replace />;
}

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-2xl text-red-600 mb-4">Failed to load profile</div>
        <p className="text-gray-600 mb-4">Your account may need operator approval.</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="flex justify-between items-center px-10 py-5">
          <div>
            <h1 className="text-3xl font-bold">Advertiser Dashboard</h1>
            <p className="text-sm text-gray-600">
              {profile.companyName} • Balance: $
              {profile.account?.balance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="bg-white border-b px-10 py-5">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'advertisements', label: '📢 Advertisements' },
            { key: 'sponsorships', label: '🤝 Sponsorships' },
            { key: 'requests', label: '📨 Requests' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-10">
        {activeTab === 'overview' && <Overview profile={profile} fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'advertisements' && <Advertisements fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'sponsorships' && <Sponsorships fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'requests' && <SponsorshipRequests fetchWithAuth={fetchWithAuth} />}
      </main>
    </div>
  );
}