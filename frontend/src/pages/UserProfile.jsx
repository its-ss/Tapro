import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { API_ENDPOINTS, apiRequest } from '../config/api';
import {
  FiMail,
  FiCopy,
  FiExternalLink,
  FiMessageSquare,
  FiUserPlus,
  FiShare2,
  FiGlobe,
  FiEdit2,
  FiCheck,
  FiClock,
  FiMapPin,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiUsers,
  FiHeart,
  FiCalendar,
  FiBook,
  FiAward,
  FiAlertCircle
} from 'react-icons/fi';

// Default avatar as data URI
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2UyZThmMCIvPjxwYXRoIGQ9Ik0yMCAyMWE2IDYgMCAxMDAtMTIgNiA2IDAgMDAwIDEyem0wIDNjLTYuNjMgMC0xMiAyLjY5LTEyIDZoMjRjMC0zLjMxLTUuMzctNi0xMi02eiIgZmlsbD0iIzk0YTNiOCIvPjwvc3ZnPg==';


const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  //State initialization
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);


  useEffect(() => {
    // This function now performs a real API fetch to your Flask backend
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch

        // Fetch data from your Flask API using the userId from the URL
        const response = await fetch(API_ENDPOINTS.users(userId));

        // Check if the request was successful
        if (!response.ok) {
            // If the server responded with a 404 or 500 error, throw an error
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data); // Populate the user state with data from the backend

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message); // Set error state to display an error message
      } finally {
        setLoading(false); // Stop the loading indicator regardless of outcome
      }
    };

    fetchUserData();
  }, [userId]); // Re-run the effect if the userId in the URL changes

  // Fetch user's posts when viewing posts tab
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (activeTab !== 'posts' || !userId) return;

      setPostsLoading(true);
      try {
        const response = await apiRequest(`${API_ENDPOINTS.posts}?authorId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [activeTab, userId]);

  //Tabs moved inside, so it can read 'user's state after it has been fetched
  const tabs = user ? [
    { id: 'overview', label: 'Overview' },
    { id: 'following', label: 'Following', count: user.following?.length || 0 },
    { id: 'posts', label: 'Posts', count: user.stats?.posts || 0 }
  ] : [];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In a real app, you would call your API to follow/unfollow the user
  };

  const handleShare = () => {
    // In a real app, you would implement social sharing
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess('share');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess('copy');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const renderTabContent = (tab) => {
    if (!user) return null;

    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-3">About Me</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
              
              {(user.achievements || []).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FiAward className="text-blue-500" /> Achievements & Recognition
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(user.achievements||[]).map((achievement, i) => (
                      <span key={i} className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full border border-yellow-200">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.availability && (
                <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100 flex items-start gap-3">
                  <FiUsers className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-700">{user.availability}</h4>
                    {user.mentorshipFocus && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(user.mentorshipFocus||[]).map((focus, i) => (
                          <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                            {focus}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {user.startups && user.startups.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-base font-semibold mb-4">Startups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(user.startups||[]).map((startup, i) => (
                    <div 
                      key={i} 
                      className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/startups/${startup.name.toLowerCase()}`)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <img 
                          src={startup.logo} 
                          alt={startup.name} 
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                        <div>
                          <p className="font-medium text-sm">{startup.name}</p>
                          <p className="text-xs text-gray-500">{startup.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{startup.tagline}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Founded: {startup.founded}</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {startup.stage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Work Experience</h3>
              <div className="space-y-6">
                {(user.workExperience||[]).map((job, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-3 items-center">
                        <img 
                          src={job.logo} 
                          alt={job.company} 
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                        <div>
                          <p className="font-medium text-sm">{job.title}</p>
                          <p className="text-xs text-gray-600">
                            {job.company}
                            {job.location && <span> · {job.location}</span>}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FiClock className="mr-1" /> {job.duration}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 ml-11">{job.description}</p>
                    
                    {job.achievements && job.achievements.length > 0 && (
                      <div className="ml-11">
                        <p className="text-xs font-medium text-gray-700 mb-1">Key Achievements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {(job.achievements||[]).map((achievement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">●</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Education</h3>
              <div className="space-y-4">
                {(user.education||[]).map((edu, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-gray-200 pb-4">
                    <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="flex justify-between mb-1">
                      <p className="font-medium text-sm">{edu.degree}</p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{edu.institution}</p>
                    {edu.description && (
                      <p className="text-xs text-gray-500">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
              
              {user.certificates && user.certificates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FiBook className="text-blue-500" /> Certifications
                  </h4>
                  <div className="space-y-2">
                    {(user.certificates||[]).map((cert, i) => (
                      <div key={i} className="flex justify-between bg-gray-50 p-2 rounded">
                        <div>
                          <p className="text-xs font-medium">{cert.name}</p>
                          <p className="text-xs text-gray-500">{cert.issuer}</p>
                        </div>
                        <p className="text-xs text-gray-500">{cert.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(user.skills||[]).map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'following':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Following</h3>
                <span className="text-sm text-gray-500">{user.following.length} connections</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.following||[]).map((connection, i) => (
                  <div 
                    key={i} 
                    className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      const path = connection.role.includes('Managing') 
                        ? `/investors/${connection.name.toLowerCase().replace(/\s+/g, '-')}` 
                        : `/startups/${connection.name.toLowerCase()}`;
                      navigate(path);
                    }}
                  >
                    <img 
                      src={connection.image} 
                      alt={connection.name} 
                      className="h-12 w-12 rounded-full object-cover" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{connection.name}</p>
                      <p className="text-xs text-gray-500 truncate">{connection.role}</p>
                    </div>
                    <button className="bg-black text-white text-xs px-3 py-1 rounded hover:bg-gray-800">
                      Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Suggested Connections</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Notion', role: 'Productivity Platform', image: '/assets/notion.svg' },
                  { name: 'Satya Nadella', role: 'CEO at Microsoft', image: '/assets/satya.jpg' }
                ].map((suggestion, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-3">
                    <img 
                      src={suggestion.image} 
                      alt={suggestion.name} 
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{suggestion.name}</p>
                      <p className="text-xs text-gray-500 truncate">{suggestion.role}</p>
                    </div>
                    <button className="border border-black text-black text-xs px-3 py-1 rounded hover:bg-gray-100">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'posts':
        const displayPosts = userPosts.length > 0 ? userPosts : (user.posts || []);
        return (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user.profileImage || DEFAULT_AVATAR}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                <input
                  type="text"
                  placeholder="Share an update or announcement..."
                  className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1">📷 Image</button>
                  <button className="flex items-center gap-1">🔗 Link</button>
                  <button className="flex items-center gap-1">📌 Tags</button>
                </div>
                <button className="bg-black text-white px-4 py-1 rounded text-sm">Post</button>
              </div>
            </div>

            {postsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading posts...</div>
            ) : displayPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                <FiMessageSquare className="mx-auto text-4xl mb-2" />
                <p>No posts yet</p>
              </div>
            ) : (
              displayPosts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.authorImage || user.profileImage || DEFAULT_AVATAR}
                      alt={post.authorName || user.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div>
                      <h4 className="font-medium text-sm">{post.authorName || user.name}</h4>
                      <p className="text-xs text-gray-500">{post.date || new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{post.content}</p>

                  {post.media && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <img src={post.media} alt="Post media" className="w-full max-h-96 object-cover" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(post.hashtags || post.tags || []).map((tag, idx) => (
                      <span key={idx} className="text-xs text-blue-600 hover:underline cursor-pointer">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>

                  <div className="flex text-xs gap-6 pt-3 border-t">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
                      <FiHeart size={14} /> {post.likes || 0} Likes
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
                      <FiMessageSquare size={14} /> {post.comments || 0} Comments
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
                      <FiShare2 size={14} /> Share
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
        <Header active="Discover" />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center p-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4">Loading user profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
        <Header active="Discover" />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md">
            <FiAlertCircle className="mx-auto text-red-500" size={48} />
            <h2 className="text-xl font-bold mt-4">User Not Found</h2>
            <p className="mt-2 mb-6 text-gray-600">The user profile you are looking for could not be found or is no longer available.</p>
            <button 
              onClick={() => navigate('/discover')} 
              className="bg-black text-white px-4 py-2 rounded"
            >
              Discover Users
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // success state(the full fetched profile)
  return (
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
      <Header active="Discover" />
      
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 py-6">
        {/* Top Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Optional Cover Image */}
          <div className="h-32 bg-gradient-to-r from-teal-500 to-blue-500 relative">
            {/* {user.coverImage && (
              <img 
                src={user.coverImage} 
                alt={`${user.name} cover`} 
                className="w-full h-full object-cover"
              />
            )} */}
          </div>
          
          <div className="flex justify-between items-start flex-wrap gap-4 p-6 relative">
            {/* Profile Image (positioned to overlap with cover) */}
            <div className="flex gap-4 items-center min-w-[260px]">
              <img 
                src={user.profileImage} 
                alt={user.name} 
                className="h-20 w-20 rounded-full object-cover border-4 border-white mt-[-40px]" 
              />
              <div className="mt-2">
                <h2 className="text-xl font-bold flex items-center gap-1">
                  {user.name} 
                  {user.verified && <span className="text-blue-500">✓</span>}
                </h2>
                <p className="text-sm text-gray-600">{user.role}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-2 flex-wrap">
                  {(user.interests||[]).map((interest, i) => (
                    i < 3 && <span key={i} className="bg-gray-100 px-2 py-1 rounded">{interest}</span>
                  ))}
                  {user.interests.length > 3 && (
                    <span className="bg-gray-100 px-2 py-1 rounded">+{user.interests.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs min-w-[160px]">
              <button 
                className={`px-3 py-2 rounded flex items-center justify-center gap-2 ${
                  isFollowing 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-black text-white'
                }`}
                onClick={handleFollow}
              >
                {isFollowing ? <FiCheck size={14} /> : <FiUserPlus size={14} />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              
              <button
                className="bg-blue-500 text-white px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                onClick={() => navigate('/messages', {
                  state: {
                    newConversation: {
                      id: user.id,
                      name: user.name,
                      profileImage: user.profileImage,
                      role: user.role
                    }
                  }
                })}
              >
                <FiMessageSquare size={14} /> Message
              </button>
              
              <button 
                className="border px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                onClick={handleShare}
              >
                <FiShare2 size={14} /> {copySuccess ==='share' ? 'Copied!' : 'Share'}
              </button>
              
              {user.id === 'suyash' && (
                <button 
                  className="border px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                  onClick={() => navigate('/profile/manage')}
                >
                  <FiEdit2 size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Quick Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center border-r border-gray-100 last:border-r-0">
              <p className="text-xs text-gray-500 mb-1">Following</p>
              <p className="text-base font-semibold">{user.stats?.connections}</p>
            </div>
            <div className="text-center border-r border-gray-100 last:border-r-0">
              <p className="text-xs text-gray-500 mb-1">Followers</p>
              <p className="text-base font-semibold">{user.stats?.followers}</p>
            </div>
            <div className="text-center border-r border-gray-100 last:border-r-0">
              <p className="text-xs text-gray-500 mb-1">Posts</p>
              <p className="text-base font-semibold">{user.stats?.posts}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Startups</p>
              <p className="text-base font-semibold">{user.stats?.startups}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6 text-sm h-10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 whitespace-nowrap flex items-center gap-1 ${
                activeTab === tab.id 
                  ? 'border-b-2 border-black font-semibold' 
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-1 bg-gray-100 text-gray-700 rounded-full px-2 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left Side - Tab Content */}
          <div className="w-full">
            {renderTabContent(activeTab)}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[320px] space-y-4 lg:sticky lg:top-6">
            {/* User Info */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h4 className="text-base font-semibold mb-3">User Info</h4>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2">
                  <FiMapPin className="text-gray-400" size={16} />
                  <span className="text-gray-500">Location:</span> 
                  <span>{user.location}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCalendar className="text-gray-400" size={16} />
                  <span className="text-gray-500">Joined:</span> 
                  <span>{user.joinDate}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiUsers className="text-gray-400" size={16} />
                  <span className="text-gray-500">Looking for:</span> 
                  <span>{user.lookingFor}</span>
                </li>
              </ul>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h4 className="text-base font-semibold mb-3">Contact</h4>
              
              <a 
                href={`https://${user.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-600 flex items-center gap-2 mb-2 hover:underline"
              >
                <FiGlobe size={14} /> {user.website}
              </a>
              
              <p className="text-sm text-gray-700 flex items-center gap-2 mb-3">
                <FiMail size={14} /> {user.email}
              </p>
              
              <div className="flex gap-3 mt-4 mb-4">
                {user.linkedin && (
                  <a 
                    href={`https://${user.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-50 text-blue-700 p-2 rounded-full hover:bg-blue-100 transition"
                    title="LinkedIn"
                  >
                    <FiLinkedin size={18} />
                  </a>
                )}
                
                {user.twitter && (
                  <a 
                    href={`https://twitter.com/${user.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-50 text-blue-500 p-2 rounded-full hover:bg-blue-100 transition"
                    title="Twitter"
                  >
                    <FiTwitter size={18} />
                  </a>
                )}
                
                {user.github && (
                  <a 
                    href={`https://${user.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-50 text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
                    title="GitHub"
                  >
                    <FiGithub size={18} />
                  </a>
                )}
              </div>
              
              <button 
                onClick={handleCopyProfileLink}
                className="w-full border text-sm flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-50 transition"
              >
                <FiCopy size={14} /> {copySuccess === 'copy' ? 'Profile Link Copied!' : 'Copy Profile Link'}
              </button>
            </div>
            
            {/* Current Startups */}
            {user.startups && user.startups.length > 0 && (
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-semibold">Current Startups</h4>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(user.startups||[]).map((startup, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                      onClick={() => navigate(`/startups/${startup.name.toLowerCase()}`)}
                    >
                      <img 
                        src={startup.logo} 
                        alt={startup.name} 
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{startup.name}</p>
                        <p className="text-xs text-gray-500 truncate">{startup.role}</p>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        {startup.stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Skills */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-base font-semibold">Top Skills</h4>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(user.skills.slice(0, 6)||[]).map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
                {user.skills.length > 6 && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                    +{user.skills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;