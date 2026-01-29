import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';

const DiscoverPage = () => {
  const [activeTab, setActiveTab] = useState('startups');
  const [dataList, setDataList] = useState([]);
  const [lastDocId, setLastDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

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

  const renderCard = (entry, i) => {
  const isStartup = activeTab === 'startups';
  const isInvestor = activeTab === 'investors';
  const isUser = activeTab === 'users';

  return (
    <div
  key={entry.id || i}
  className="bg-white rounded-xl shadow-md p-4 h-[300px]  w-[300px] mx-auto flex flex-col justify-between"
>
  {/* Header */}
  <div className="flex items-center gap-2 mb-2">
    <img
      src={entry.profileImage || '/assets/default.jpg'}
      alt="Avatar"
      className="h-8 w-8 object-cover rounded-full"
    />
    <div className="font-semibold text-sm line-clamp-1">
      {entry.fullName || entry.startupName || 'Anonymous'}
    </div>
  </div>

  {/* Description & Info (take up space) */}
  <div className="flex-grow flex flex-col justify-start overflow-hidden">
    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
      {entry.tagline || entry.about || entry.bio || 'No description' }
    </p>

    <ul className="text-xs text-gray-700 space-y-1">
      {isStartup && (
        <>
          <li className="leading-tight">💼 {entry.category?.[0] || 'Startup'}</li>
          <li className="leading-tight">📍 {entry.location}</li>
          <li className="leading-tight">📈 {entry.fundingRound}</li>
          <li className="leading-tight">👥 {entry.teamSize}</li>
          <li className="leading-tight text-green-600 font-semibold">💰 {entry.raised}</li>
        </>
      )}
      {isInvestor && (
        <>
          <li className="leading-tight">💼 {entry.investorType}</li>
          <li className="leading-tight">📍 {entry.location}</li>
          <li className="flex items-center gap-2 leading-tight">  📊 {entry.assets || '0'} Investments </li>
          <li className="flex items-center gap-2 leading-tight">  📅 {entry.metrics?.experience || '0'} yrs experience </li>
          <li className="leading-tight text-green-600 font-semibold">
  💰 {entry.investmentAmount ? `$${Number(entry.investmentAmount).toLocaleString()}` : '—'}
</li>

        </>
      )}
      {isUser && (
        <>
          <li className="leading-tight">💼 {entry.role}</li>
          <li className="leading-tight">📍 {entry.location}</li>
          <li className="leading-tight">🌐 Interested in {entry.lookingFor || '—'}</li>
          <li className="leading-tight">🎓 {entry.education?.[0]?.degree || 'No degree listed'}</li>
          <li className="leading-tight">🏢 {entry.workExperience?.[0]?.title || 'No role'} @ {entry.workExperience?.[0]?.company || 'No company'}</li>
    
        </>
      )}
    </ul>
  </div>

  {/* Actions always pinned to bottom */}
  <div className="mt-4 flex flex-col gap-2">
    <button className="bg-black text-white text-sm py-1 rounded">Follow</button>
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
      <Header active="Discover" />
      <main className="flex-grow max-w-6xl mx-auto px-6 py-6">
        <div className="flex justify-center mb-6 gap-4">
          {['startups', 'investors', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-black border'}`}
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
              className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-300"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <select className="bg-gray-200 px-4 py-2 rounded-full">
            <option>Industry</option>
          </select>
          <select className="bg-gray-200 px-4 py-2 rounded-full">
            <option>
              {activeTab === 'startups'
                ? 'Stage'
                : activeTab === 'investors'
                ? 'Experience'
                : 'Interest'}
            </option>
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

export default DiscoverPage;
