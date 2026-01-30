import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiRequest } from '../config/api';

// Default avatar as data URI
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2UyZThmMCIvPjxwYXRoIGQ9Ik0yMCAyMWE2IDYgMCAxMDAtMTIgNiA2IDAgMDAwIDEyem0wIDNjLTYuNjMgMC0xMiAyLjY5LTEyIDZoMjRjMC0zLjMxLTUuMzctNi0xMi02eiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';

const StarredPage = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  const [activeTab, setActiveTab] = useState('startups');
  const [dataList, setDataList] = useState([]);
  const [lastDocId, setLastDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!userId || loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.starred, {
        method: 'POST',
        body: JSON.stringify({
          type: activeTab.slice(0, -1), // 'startup' or 'investor'
          lastDocId,
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
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, lastDocId, loading, hasMore, userId]);

  useEffect(() => {
    setDataList([]);
    setLastDocId(null);
    setHasMore(true);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 && !loading && hasMore) {
        fetchData();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchData, loading, hasMore]);

  const handleUnstar = async (itemId) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.unstar, {
        method: 'POST',
        body: JSON.stringify({
          itemId,
          type: activeTab.slice(0, -1),
        }),
      });

      if (response.ok) {
        setDataList(prev => prev.filter(item => item.id !== itemId));
      } else {
        const result = await response.json();
        console.error(result.error);
      }
    } catch (err) {
      console.error('Failed to unstar item:', err);
    }
  };

  const handleFollow = async (itemId, e) => {
    e.stopPropagation(); // Prevent card click
    const isCurrentlyFollowing = followingIds.has(itemId);
    const endpoint = isCurrentlyFollowing ? API_ENDPOINTS.unfollow : API_ENDPOINTS.follow;

    try {
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          targetId: itemId,
          type: activeTab.slice(0, -1), // 'startup' or 'investor'
        }),
      });

      if (response.ok) {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          if (isCurrentlyFollowing) {
            newSet.delete(itemId);
          } else {
            newSet.add(itemId);
          }
          return newSet;
        });
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    }
  };

  const renderCard = (entry, i) => {
    const isStartup = activeTab === 'startups';
    const isInvestor = activeTab === 'investors';

    return (
      <div
        key={entry.id || i}
        className="relative bg-white rounded-xl shadow-md p-4 h-[300px] w-[300px] mx-auto flex flex-col justify-between"
      >
        <button
          className="absolute top-2 right-2 text-yellow-500 text-2xl hover:text-yellow-600"
          onClick={() => handleUnstar(entry.id)}
          title="Unstar"
        >
          ★
        </button>

        <div className="flex items-center gap-2 mb-2">
          <img
            src={entry.profileImage || entry.logoUrl || DEFAULT_AVATAR}
            alt="Avatar"
            className="h-8 w-8 object-cover rounded-full"
            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
          />
          <div className="font-semibold text-sm line-clamp-1">
            {entry.fullName || entry.startupName || 'Anonymous'}
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-start overflow-hidden">
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {entry.tagline || entry.about || 'No description'}
          </p>

          <ul className="text-xs text-gray-700 space-y-1">
            {isStartup && (
              <>
                <li className="leading-tight">💼 {entry.category?.[0] || 'Startup'}</li>
                <li className="leading-tight">📍 {entry.location || '—'}</li>
                <li className="leading-tight">📈 {entry.fundingRound || '—'}</li>
                <li className="leading-tight">👥 {entry.teamSize}</li>
                <li className="leading-tight text-green-600 font-semibold">💰 {entry.raised || '—'}</li>
              </>
            )}
            {isInvestor && (
              <>
                <li className="leading-tight">💼 {entry.investorType || 'Investor'}</li>
                <li className="leading-tight">📍 {entry.location || '—'}</li>
                <li className="flex items-center gap-2 leading-tight">
                  📊 {entry.assets || '0'} Investments
                </li>
                <li className="flex items-center gap-2 leading-tight">
                  📅 {entry.metrics?.experience || '0'} yrs experience
                </li>
                <li className="leading-tight text-green-600 font-semibold">
                  💰 {entry.investmentAmount
                    ? `$${Number(entry.investmentAmount).toLocaleString()}`
                    : '—'}
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <button
            className={`text-sm py-1 rounded flex items-center justify-center gap-1 ${
              followingIds.has(entry.id)
                ? 'bg-gray-200 text-gray-800'
                : 'bg-black text-white'
            }`}
            onClick={(e) => handleFollow(entry.id, e)}
          >
            {followingIds.has(entry.id) ? (
              <>
                <FiCheck size={14} /> Following
              </>
            ) : (
              'Follow'
            )}
          </button>
          <button
            className="bg-black text-white text-sm py-1 rounded"
            onClick={() => navigate(`/${activeTab}/${entry.id}`)}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5EE] font-sans text-sm">
      <Header active="Starred" />
      <main className="flex-grow max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-center mb-6 gap-4">
          {['startups', 'investors'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium ${
                activeTab === tab ? 'bg-black text-white' : 'bg-white text-black border'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-1">
          Your Starred {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          View and manage your saved {activeTab === 'startups' ? 'startup' : 'investor'} profiles
        </p>

        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-300"
              disabled
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <select className="bg-gray-200 px-4 py-2 rounded-full">
            <option>Industry</option>
          </select>
          <select className="bg-gray-200 px-4 py-2 rounded-full">
            <option>{activeTab === 'startups' ? 'Stage' : 'Experience'}</option>
          </select>
          <button className="bg-white border px-4 py-2 rounded-full flex items-center gap-2">
            <FiFilter /> More Filters
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataList.map((item, i) => renderCard(item, i))}
        </div>

        {loading && <p className="text-center text-gray-500 mt-4">Loading more...</p>}
      </main>
      <Footer />
    </div>
  );
};

export default StarredPage;
