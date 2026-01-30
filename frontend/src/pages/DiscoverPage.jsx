import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import { useAuth } from '../context/AuthContext';

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState('startups');
  const [dataList, setDataList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [lastDocId, setLastDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [starredItems, setStarredItems] = useState([]);
  const [followedItems, setFollowedItems] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Fetch starred items on mount
  useEffect(() => {
    const fetchStarred = async () => {
      if (!currentUser) return;
      try {
        const response = await apiRequest(API_ENDPOINTS.starred);
        if (response.ok) {
          const data = await response.json();
          const starredIds = data.starred?.map(item => item.itemId || item.id) || [];
          setStarredItems(starredIds);
        }
      } catch (err) {
        console.error('Error fetching starred items:', err);
      }
    };
    fetchStarred();
  }, [currentUser]);

  const fetchData = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.discover, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'users' ? 'users' : activeTab === 'investors' ? 'investor' : 'startup',
          lastDocId: lastDocId || null,
          limit: 10,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setDataList(prev => {
          const seen = new Set(prev.map(item => item.id));
          const filtered = result.data.filter(item => !seen.has(item.id));
          return [...prev, ...filtered];
        });
        setLastDocId(result.lastDocId);
        setHasMore(result.data.length > 0);
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, lastDocId, loading, hasMore]);

  useEffect(() => {
    setDataList([]);
    setLastDocId(null);
    setHasMore(true);
    setSearchQuery('');
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredList(dataList);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = dataList.filter(item => {
        const name = (item.fullName || item.startupName || '').toLowerCase();
        const tagline = (item.tagline || item.about || item.bio || '').toLowerCase();
        const location = (item.location || '').toLowerCase();
        const category = (item.category?.[0] || item.investorType || item.role || '').toLowerCase();
        return name.includes(query) || tagline.includes(query) || location.includes(query) || category.includes(query);
      });
      setFilteredList(filtered);
    }
  }, [searchQuery, dataList]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 && !loading && hasMore) {
        fetchData();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData, loading, hasMore]);

  const handleStar = async (itemId, itemType) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const isStarred = starredItems.includes(itemId);

    // Optimistic update
    if (isStarred) {
      setStarredItems(prev => prev.filter(id => id !== itemId));
    } else {
      setStarredItems(prev => [...prev, itemId]);
    }

    try {
      const endpoint = isStarred ? API_ENDPOINTS.unstar : API_ENDPOINTS.star;
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ itemId, itemType }),
      });

      if (!response.ok) {
        // Revert on error
        if (isStarred) {
          setStarredItems(prev => [...prev, itemId]);
        } else {
          setStarredItems(prev => prev.filter(id => id !== itemId));
        }
      }
    } catch (err) {
      console.error('Error starring item:', err);
      // Revert on error
      if (isStarred) {
        setStarredItems(prev => [...prev, itemId]);
      } else {
        setStarredItems(prev => prev.filter(id => id !== itemId));
      }
    }
  };

  const handleFollow = async (itemId, itemType) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const isFollowed = followedItems.includes(itemId);

    // Optimistic update
    if (isFollowed) {
      setFollowedItems(prev => prev.filter(id => id !== itemId));
    } else {
      setFollowedItems(prev => [...prev, itemId]);
    }

    try {
      const endpoint = isFollowed ? API_ENDPOINTS.unfollow : API_ENDPOINTS.follow;
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ targetId: itemId, targetType: itemType }),
      });

      if (!response.ok) {
        // Revert on error
        if (isFollowed) {
          setFollowedItems(prev => [...prev, itemId]);
        } else {
          setFollowedItems(prev => prev.filter(id => id !== itemId));
        }
      }
    } catch (err) {
      console.error('Error following item:', err);
      // Revert on error
      if (isFollowed) {
        setFollowedItems(prev => [...prev, itemId]);
      } else {
        setFollowedItems(prev => prev.filter(id => id !== itemId));
      }
    }
  };

  const handleViewDetails = (entry) => {
    if (activeTab === 'startups') {
      navigate(`/startups/${entry.id}`);
    } else if (activeTab === 'investors') {
      navigate(`/investors/${entry.id}`);
    } else {
      navigate(`/users/${entry.id}`);
    }
  };

  const renderCard = (entry, i) => {
    const isStartup = activeTab === 'startups';
    const isInvestor = activeTab === 'investors';
    const isUser = activeTab === 'users';
    const isStarred = starredItems.includes(entry.id);
    const isFollowed = followedItems.includes(entry.id);
    const itemType = isStartup ? 'startup' : isInvestor ? 'investor' : 'user';

    return (
      <div
        key={entry.id || i}
        className="bg-white rounded-xl shadow-md p-4 h-[300px] w-[300px] mx-auto flex flex-col justify-between relative"
      >
        {/* Star Icon */}
        <button
          onClick={() => handleStar(entry.id, itemType)}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition"
          title={isStarred ? 'Remove from starred' : 'Add to starred'}
        >
          <FiStar
            className={`w-5 h-5 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
          />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pr-8">
          <img
            src={entry.profileImage || '/assets/default.jpg'}
            alt="Avatar"
            className="h-8 w-8 object-cover rounded-full"
          />
          <div className="font-semibold text-sm line-clamp-1">
            {entry.fullName || entry.startupName || 'Anonymous'}
          </div>
        </div>

        {/* Description & Info */}
        <div className="flex-grow flex flex-col justify-start overflow-hidden">
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {entry.tagline || entry.about || entry.bio || 'No description'}
          </p>

          <ul className="text-xs text-gray-700 space-y-1">
            {isStartup && (
              <>
                <li className="leading-tight">💼 {entry.category?.[0] || 'Startup'}</li>
                <li className="leading-tight">📍 {entry.location || 'N/A'}</li>
                <li className="leading-tight">📈 {entry.fundingRound || 'N/A'}</li>
                <li className="leading-tight">👥 {entry.teamSize || 'N/A'}</li>
                <li className="leading-tight text-green-600 font-semibold">💰 {entry.raised || 'N/A'}</li>
              </>
            )}
            {isInvestor && (
              <>
                <li className="leading-tight">💼 {entry.investorType || 'Investor'}</li>
                <li className="leading-tight">📍 {entry.location || 'N/A'}</li>
                <li className="flex items-center gap-2 leading-tight">📊 {entry.assets || '0'} Investments</li>
                <li className="flex items-center gap-2 leading-tight">📅 {entry.experience || '0'} yrs experience</li>
                <li className="leading-tight text-green-600 font-semibold">
                  💰 {entry.investmentAmount ? `$${Number(entry.investmentAmount).toLocaleString()}` : 'N/A'}
                </li>
              </>
            )}
            {isUser && (
              <>
                <li className="leading-tight">💼 {entry.role || 'User'}</li>
                <li className="leading-tight">📍 {entry.location || 'N/A'}</li>
                <li className="leading-tight">🌐 Interested in {entry.lookingFor || 'N/A'}</li>
                <li className="leading-tight">🎓 {entry.education?.[0]?.degree || 'No degree listed'}</li>
                <li className="leading-tight">🏢 {entry.workExperience?.[0]?.title || 'No role'} @ {entry.workExperience?.[0]?.company || 'N/A'}</li>
              </>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            className={`text-sm py-1 rounded transition ${
              isFollowed
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            onClick={() => handleFollow(entry.id, itemType)}
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>
          <button
            className="bg-black text-white text-sm py-1 rounded hover:bg-gray-800 transition"
            onClick={() => handleViewDetails(entry)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5EE] font-sans text-sm">
      <Header active="Discover" />
      <main className="flex-grow max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-center mb-6 gap-4">
          {['startups', 'investors', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-black border hover:bg-gray-50'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-1">
          Discover {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          {activeTab === 'startups'
            ? 'Connect with innovative startups and explore investment opportunities'
            : activeTab === 'investors'
            ? 'Explore experienced investors who are funding future innovations'
            : 'Find fellow users to network, collaborate, or build with'}
        </p>

        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <select className="bg-gray-200 px-4 py-2 rounded-full focus:outline-none cursor-pointer">
            <option value="">Industry</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
          </select>
          <select className="bg-gray-200 px-4 py-2 rounded-full focus:outline-none cursor-pointer">
            <option value="">
              {activeTab === 'startups'
                ? 'Stage'
                : activeTab === 'investors'
                ? 'Experience'
                : 'Interest'}
            </option>
            {activeTab === 'startups' && (
              <>
                <option value="pre-seed">Pre-seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
                <option value="series-b">Series B+</option>
              </>
            )}
            {activeTab === 'investors' && (
              <>
                <option value="1-5">1-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </>
            )}
            {activeTab === 'users' && (
              <>
                <option value="networking">Networking</option>
                <option value="collaboration">Collaboration</option>
                <option value="investment">Investment</option>
              </>
            )}
          </select>
          <button className="bg-white border px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-50 transition cursor-pointer">
            <FiFilter /> More Filters
          </button>
        </div>

        {filteredList.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? `No ${activeTab} found matching "${searchQuery}"` : `No ${activeTab} available yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item, i) => renderCard(item, i))}
          </div>
        )}

        {loading && <p className="text-center text-gray-500 mt-4">Loading more...</p>}
      </main>
      <Footer />
    </div>
  );
};

export default DiscoverPage;
