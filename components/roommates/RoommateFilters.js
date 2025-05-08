// RoommateFilters.js - Enhanced Design
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const RoommateFilters = ({ onFilterChange }) => {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Load available preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          setAvailablePreferences(data);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, []);

  // Handle filter from URL params on initial load
  useEffect(() => {
    const { query } = router;
    
    if (query.location) setLocation(query.location);
    if (query.budget) setBudget(query.budget);
    if (query.moveInDate) setMoveInDate(query.moveInDate);
    if (query.preferences) {
      const prefsArray = query.preferences.split(',');
      setPreferences(prefsArray);
    }
    
    // Apply filters from URL
    if (Object.keys(query).length > 0) {
      handleApplyFilters();
    }
  }, [router.isReady]);

  const handlePreferenceToggle = (pref) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter(p => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      location: location || undefined,
      budget: budget || undefined,
      moveInDate: moveInDate || undefined, 
      preferences: preferences.length ? preferences : undefined
    };
    
    // Update URL query params
    const queryParams = new URLSearchParams();
    if (location) queryParams.append('location', location);
    if (budget) queryParams.append('budget', budget);
    if (moveInDate) queryParams.append('moveInDate', moveInDate);
    if (preferences.length) queryParams.append('preferences', preferences.join(','));
    
    const query = queryParams.toString();
    router.push(`/find-roommates${query ? `?${query}` : ''}`, undefined, { shallow: true });
    
    // Call the parent component callback
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setLocation('');
    setBudget('');
    setMoveInDate('');
    setPreferences([]);
    
    router.push('/find-roommates', undefined, { shallow: true });
    onFilterChange({});
  };

  const handleToggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  const setFilterTab = (tab) => {
    setActiveFilter(tab);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-0 mb-12 overflow-hidden backdrop-blur-lg bg-opacity-70">
      <div className="bg-gradient-to-r from-purple-900 via-pink-800 to-purple-900 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-2xl font-bold text-white tracking-wide">Find Your Perfect Match</h2>
        </div>
        <button 
          onClick={handleToggleFilters}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-700 bg-opacity-50 hover:bg-opacity-70 text-white font-medium transition-all duration-300 border border-purple-500"
        >
          {isExpanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span>Hide Filters</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Show Filters</span>
            </>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="flex border-b border-gray-800">
            <button 
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-4 font-medium transition-all ${
                activeFilter === 'all' 
                  ? 'text-white border-b-2 border-pink-500' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              All Filters
            </button>
            <button 
              onClick={() => setFilterTab('location')}
              className={`flex-1 py-4 font-medium transition-all ${
                activeFilter === 'location' 
                  ? 'text-white border-b-2 border-pink-500' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Location
            </button>
            <button 
              onClick={() => setFilterTab('budget')}
              className={`flex-1 py-4 font-medium transition-all ${
                activeFilter === 'budget' 
                  ? 'text-white border-b-2 border-pink-500' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Budget
            </button>
            <button 
              onClick={() => setFilterTab('preferences')}
              className={`flex-1 py-4 font-medium transition-all ${
                activeFilter === 'preferences' 
                  ? 'text-white border-b-2 border-pink-500' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Preferences
            </button>
          </div>

          <div className="p-8 space-y-8">
            {(activeFilter === 'all' || activeFilter === 'location') && (
              <div className="transition-all duration-300">
                <label htmlFor="location" className="block text-lg font-medium text-pink-300 mb-3">
                  Where are you looking?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, neighborhood, or zip code"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white placeholder-gray-400 text-lg shadow-inner"
                  />
                </div>
              </div>
            )}
            
            {(activeFilter === 'all' || activeFilter === 'budget') && (
              <div className="transition-all duration-300">
                <label htmlFor="budget" className="block text-lg font-medium text-pink-300 mb-3">
                  What's your maximum budget?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="appearance-none w-full pl-12 pr-10 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white text-lg shadow-inner"
                  >
                    <option value="">Any budget</option>
                    <option value="500">$500/month</option>
                    <option value="750">$750/month</option>
                    <option value="1000">$1,000/month</option>
                    <option value="1500">$1,500/month</option>
                    <option value="2000">$2,000/month</option>
                    <option value="2500">$2,500/month</option>
                    <option value="3000">$3,000/month</option>
                    <option value="3500">$3,500+/month</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            {(activeFilter === 'all') && (
              <div className="transition-all duration-300">
                <label htmlFor="moveInDate" className="block text-lg font-medium text-pink-300 mb-3">
                  When do you want to move in?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="moveInDate"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-white text-lg shadow-inner"
                  />
                </div>
              </div>
            )}
            
            {(activeFilter === 'all' || activeFilter === 'preferences') && (
              <div className="transition-all duration-300">
                <label className="block text-lg font-medium text-pink-300 mb-3">
                  What's important to you?
                </label>
                <div className="flex flex-wrap gap-3 bg-gray-800 p-5 rounded-xl border border-gray-700">
                  {availablePreferences.map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => handlePreferenceToggle(pref.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        preferences.includes(pref.value)
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preferences.includes(pref.value) && (
                        <span className="inline-block mr-1.5">✓</span>
                      )}
                      {pref.label}
                    </button>
                  ))}
                  {availablePreferences.length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500 mb-4"></div>
                      <p className="text-gray-400">Loading your preferences...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
              <button
                onClick={handleClearFilters}
                className="px-6 py-3.5 border border-gray-600 rounded-xl text-gray-300 hover:bg-gray-800 transition-all duration-300 text-lg"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white transition-all duration-300 shadow-xl hover:shadow-pink-500/30 font-semibold text-lg"
              >
                Find Matches
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoommateFilters;