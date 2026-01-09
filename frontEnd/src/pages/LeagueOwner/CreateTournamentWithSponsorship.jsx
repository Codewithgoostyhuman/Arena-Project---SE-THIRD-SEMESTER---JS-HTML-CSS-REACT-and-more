import { useState, useEffect,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth/AuthContext';
export default function CreateTournamentWithSponsorship({ league, onComplete, onCancel,fetchWithAuth }) {
  //League prop validation
  if (!league || !league._id) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">No League Selected</h3>
          <p className="text-gray-600 mb-4">Please select a league first.</p>
          <button onClick={onCancel} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }
  const [step, setStep] = useState(1);
  const [tournamentId, setTournamentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    style: 'RoundRobin',
    maxPlayers: 16,
    applicationStartDate: '',
    applicationEndDate: '',
    playStartDate: '',
    playEndDate: ''
  });
  const [seekSponsorship, setSeekSponsorship] = useState(false);
  const [advertisers, setAdvertisers] = useState([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState([]);
  const [sponsorshipResponses, setSponsorshipResponses] = useState([]);
  const [interestGroups, setInterestGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [flatFee, setFlatFee] = useState(500);

  // Step 1: Create tournament
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetchWithAuth(`/league/${league._id}/tournament`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setTournamentId(response._id);
      setStep(2);
    } catch (err) {
      alert('Error creating tournament: ' + err.message);
    }
  };

  // Load advertisers when sponsorship is sought
  useEffect(() => {
    if (step === 2 && seekSponsorship && advertisers.length === 0) {
      loadAdvertisers();
    }
  }, [step, seekSponsorship]);

//Load Advertisers
  const loadAdvertisers = useCallback(async () => {
  try {
    const data = await fetchWithAuth(`/league/${league._id}/interested-advertisers`);
    setAdvertisers(data);
  } catch (err) {
    console.error('Error loading advertisers:', err);
  }
}, [league._id]);

useEffect(() => {
  if (step === 2 && seekSponsorship && advertisers.length === 0) {
    loadAdvertisers();
  }
}, [step, seekSponsorship, advertisers.length, loadAdvertisers]);

//Load Hanlde Request Sponsorships
  const handleRequestSponsorships = async () => {
  try {
    const response = await fetchWithAuth(`/tournament/${tournamentId}/request-sponsorships`, {
      method: 'POST',
      body: JSON.stringify({ advertiserIds: selectedAdvertisers })
    });
    
    setFlatFee(response.flatFee);
    alert('Sponsorship requests sent!');
    
    // Poll for responses
    const pollResponses = async () => {
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const data = await fetchWithAuth(`/tournament/${tournamentId}/sponsorship-responses`);
          if (data && data.length > 0) {
            setSponsorshipResponses(data);
            return;
          }
        } catch (err) {
          console.error('Error polling responses:', err);
        }
      }
      // After 10 seconds, load whatever we have
      loadSponsorshipResponses();
    };
    pollResponses();
  } catch (err) {
    alert('Error requesting sponsorships: ' + err.message);
  }
};

// Load Sponsorship Responses
  const loadSponsorshipResponses = async () => {
    try {
      const data = await fetchWithAuth(`/tournament/${tournamentId}/sponsorship-responses`);
      setSponsorshipResponses(data);
    } catch (err) {
      console.error('Error loading responses:', err);
    }
  };

  //Handle Select Sponsor
  const handleSelectSponsor = async (advertiserId) => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/select-sponsor`, {
        method: 'POST',
        body: JSON.stringify({ advertiserId })
      });
      
      alert('Exclusive sponsor selected!');
      setStep(3);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
//Handle Skip Sponsorship
  const handleSkipSponsorship = async () => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/skip-sponsorship`, {
        method: 'POST'
      });
      setStep(3);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Load Interest Groups
  const loadInterestGroups = useCallback(async () => {
  try {
    const data = await fetchWithAuth('/interest-groups');
    setInterestGroups(data);
  } catch (err) {
    console.error('Error loading interest groups:', err);
  }
}, []);
  // Load interest groups for step 3
  useEffect(() => {
  if (step === 3 && interestGroups.length === 0) {
    loadInterestGroups();
  }
}, [step, interestGroups.length, loadInterestGroups]);


// Handle Notify Groups
  const handleNotifyGroups = async () => {
    try {
      await fetchWithAuth(`/tournament/${tournamentId}/notify-groups`, {
        method: 'POST',
        body: JSON.stringify({ groupIds: selectedGroups })
      });
      
      alert('Tournament created successfully!');
      onComplete();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className={`flex-1 text-center ${step >= 1 ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
            }`}>1</div>
            <div className="mt-2 text-sm">Basic Info</div>
          </div>
          <div className="flex-1 h-1 bg-gray-300 relative">
            {step >= 2 && <div className="absolute inset-0 bg-purple-600"></div>}
          </div>
          <div className={`flex-1 text-center ${step >= 2 ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
            }`}>2</div>
            <div className="mt-2 text-sm">Sponsorship</div>
          </div>
          <div className="flex-1 h-1 bg-gray-300 relative">
            {step >= 3 && <div className="absolute inset-0 bg-purple-600"></div>}
          </div>
          <div className={`flex-1 text-center ${step >= 3 ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
              step >= 3 ? 'border-purple-600 bg-purple-100' : 'border-gray-300'
            }`}>3</div>
            <div className="mt-2 text-sm">Notification</div>
          </div>
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit}>
          <h3 className="text-2xl font-bold mb-6">Tournament Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style *</label>
              <select
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="RoundRobin">Round Robin</option>
                <option value="DoubleRoundRobin">Double Round Robin</option>
                <option value="SingleElimination">Single Elimination</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Players *</label>
              <input
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({...formData, maxPlayers: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="4"
                max="128"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Start *</label>
              <input
                type="date"
                value={formData.applicationStartDate}
                onChange={(e) => setFormData({...formData, applicationStartDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application End *</label>
              <input
                type="date"
                value={formData.applicationEndDate}
                onChange={(e) => setFormData({...formData, applicationEndDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Play Start *</label>
              <input
                type="date"
                value={formData.playStartDate}
                onChange={(e) => setFormData({...formData, playStartDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Play End *</label>
              <input
                type="date"
                value={formData.playEndDate}
                onChange={(e) => setFormData({...formData, playEndDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Next: Sponsorship
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Sponsorship */}
      {step === 2 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Sponsorship Options</h3>
          
          <div className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={seekSponsorship}
                onChange={(e) => setSeekSponsorship(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-lg">Seek exclusive sponsorship?</span>
            </label>
            <p className="text-sm text-gray-600 mt-2">
              Exclusive sponsors pay ${flatFee} flat fee.
            </p>
          </div>

          {!seekSponsorship ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Random ads will be displayed.</p>
              <button
                onClick={handleSkipSponsorship}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Continue Without Sponsorship
              </button>
            </div>
          ) : advertisers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No advertisers interested yet.</p>
              <button
                onClick={handleSkipSponsorship}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Continue Without Sponsorship
              </button>
            </div>
          ) : sponsorshipResponses.length === 0 ? (
            <div>
              <h4 className="font-bold mb-4">Select Advertisers:</h4>
              <div className="space-y-3 mb-6">
                {advertisers.map(adv => (
                  <label key={adv._id} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedAdvertisers.includes(adv._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdvertisers([...selectedAdvertisers, adv._id]);
                        } else {
                          setSelectedAdvertisers(selectedAdvertisers.filter(id => id !== adv._id));
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{adv.companyName}</div>
                      <div className="text-sm text-gray-600">Balance: ${adv.account?.balance.toFixed(2)}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSkipSponsorship}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Skip
                </button>
                <button
                  onClick={handleRequestSponsorships}
                  disabled={selectedAdvertisers.length === 0}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  Request ({selectedAdvertisers.length})
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-bold mb-4">Responses:</h4>
              <div className="space-y-3 mb-6">
                {sponsorshipResponses.map(resp => (
                  <div key={resp._id} className="p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">{resp.advertiser?.companyName}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        resp.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        resp.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {resp.status}
                      </span>
                    </div>
                    {resp.status === 'accepted' && (
                      <button
                        onClick={() => handleSelectSponsor(resp.advertiser._id)}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium mt-2"
                      >
                        Select as Sponsor
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleSkipSponsorship}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Continue Without Sponsor
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Notify Groups */}
      {step === 3 && (
        <div>
          <h3 className="text-2xl font-bold mb-6">Notify Interest Groups</h3>
          
          <p className="text-gray-600 mb-4">Select groups to notify:</p>

          <div className="space-y-3 mb-6">
            {interestGroups.map(group => (
              <label key={group._id} className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroups([...selectedGroups, group._id]);
                    } else {
                      setSelectedGroups(selectedGroups.filter(id => id !== group._id));
                    }
                  }}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-medium">{group.name}</div>
                  <div className="text-sm text-gray-600">{group.members?.length || 0} members</div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleNotifyGroups}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Complete Tournament Creation
          </button>
        </div>
      )}
    </div>
  );
}