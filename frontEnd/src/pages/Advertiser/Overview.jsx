import { useState, useEffect } from 'react';

export default function Overview({ profile, fetchWithAuth }) {
  const [ads, setAds] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    try {
      const [adsData, sponsorshipsData] = await Promise.all([
        fetchWithAuth('/advertiser/advertisements'),
        fetchWithAuth('/advertiser/sponsored-tournaments'),
      ]);

      setAds(adsData || []);
      setSponsorships(sponsorshipsData || []);
    } catch (err) {
      console.error('Error loading overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading overview...</div>
      </div>
    );
  }

  const totalImpressions = ads.reduce(
    (sum, ad) => sum + (ad.impressions || 0),
    0
  );
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const avgCTR =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat 
          title="Balance" 
          value={`$${profile.account?.balance?.toFixed(2) || '0.00'}`} 
        />
        <Stat 
          title="Active Ads" 
          value={ads.filter(a => a.status === 'active').length} 
        />
        <Stat title="Impressions" value={totalImpressions.toLocaleString()} />
        <Stat title="Avg CTR" value={`${avgCTR}%`} />
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}