import React, { useState, useEffect } from 'react';
import { apiService } from '../../APIs/apiService';

const MatchAdDisplay = ({ matchId }) => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adData = await apiService.matches.getMatchAds(matchId);
        setAds(Array.isArray(adData) ? adData : []);
      } catch (error) {
        console.error("Failed to fetch match ads:", error);
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchAds();
    }
  }, [matchId]);

  // Rotate ads every 10 seconds
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [ads]);

  if (loading || ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl">
            SPONSORED
        </div>
        
        <div className="flex flex-col items-center justify-center text-center">
            {currentAd.imageUrl || (currentAd.content && currentAd.content.startsWith('/uploads')) ? (
               <img 
                 src={`http://localhost:5000${currentAd.imageUrl || currentAd.content}`} 
                 alt={currentAd.title} 
                 className="max-h-32 object-contain mb-2 rounded"
               />
            ) : currentAd.content && (
                <div className="text-gray-300 text-sm mb-2 italic">"{currentAd.content}"</div>
            )}
            
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                {currentAd.title || currentAd.companyName || 'Sponsor'}
            </h3>
            
            {(currentAd.title || currentAd.companyName) && (
                <p className="text-gray-400 text-xs mt-1">
                    Please visit our partner {currentAd.companyName}
                </p>
            )}
        </div>
    </div>
  );
};

export default MatchAdDisplay;
