import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiImage,
  FiMapPin,
  FiHeart,
  FiMessageSquare,
  FiShare2,
  FiInfo,
  FiFilter,
  FiBell,
  FiLink,
  FiBarChart2,
  FiMoreHorizontal,
  FiBookmark,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiGlobe,
  FiTag,
  FiActivity,
  FiClock
} from 'react-icons/fi';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiRequest } from '../config/api';

// Default profile image constant
const DEFAULT_PROFILE_IMAGE = '/assets/default-avatar.png';
const DEFAULT_STARTUP_LOGO = '/assets/default-startup.png';

const TaproExplore = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentField, setShowCommentField] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [whoToFollow, setWhoToFollow] = useState([]);
  const fileInputRef = React.useRef(null);
  
  // Mock promotions and trending topics data
  const [promotions] = useState([
    { title: "India's 25 fastest-growing jobs", time: "6d ago", views: "835 readers", image: "/assets/promotion1.jpg" },
    { title: "Logistics leads real estate leasing", time: "8h ago", views: "1,287 readers", image: "/assets/promotion2.jpg" },
    { title: "Navigating startup IPO firestorm", time: "6h ago", views: "1,196 readers", image: "/assets/promotion3.jpg" }
  ]);
  
  const [trendingTopics] = useState([
    { name: 'AI Startups', count: 182 },
    { name: 'Fundraising', count: 145 },
    { name: 'SaaS', count: 128 },
    { name: 'Climate Tech', count: 87 },
    { name: 'FinTech', count: 76 }
  ]);
  
  const [upcomingEvents] = useState([
    { name: 'TechCrunch Disrupt', date: 'May 15-17, 2025', location: 'San Francisco' },
    { name: 'Y Combinator Demo Day', date: 'June 3, 2025', location: 'Online' }
  ]);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`${API_ENDPOINTS.posts}?type=${activeFilter === 'all' ? '' : activeFilter}`);

        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        } else {
          // Fall back to mock data if API fails
          console.warn('API call failed, using mock data');
          setPosts(getMockPosts());
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        // Fall back to mock data
        setPosts(getMockPosts());
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [activeFilter]);

  // Fetch Who to Follow from database (random users, startups, investors)
  useEffect(() => {
    const fetchWhoToFollow = async () => {
      try {
        // Fetch random mix of users, startups, investors
        const responses = await Promise.all([
          apiRequest(API_ENDPOINTS.discover, {
            method: 'POST',
            body: JSON.stringify({ type: 'startup', limit: 2 })
          }),
          apiRequest(API_ENDPOINTS.discover, {
            method: 'POST',
            body: JSON.stringify({ type: 'user', limit: 2 })
          })
        ]);

        const suggestions = [];
        for (const response of responses) {
          if (response.ok) {
            const data = await response.json();
            suggestions.push(...(data.data || []));
          }
        }

        // Shuffle and take 4 random
        const shuffled = suggestions.sort(() => 0.5 - Math.random());
        setWhoToFollow(shuffled.slice(0, 4));
      } catch (err) {
        console.error('Error fetching who to follow:', err);
        // Fallback to mock data
        setWhoToFollow([
          { id: 'rippling', name: 'Rippling', role: 'HR Tech Platform', profileImage: '/assets/rippling.svg' },
          { id: 'notion', name: 'Notion', role: 'Productivity Platform', profileImage: '/assets/notion.svg' }
        ]);
      }
    };

    fetchWhoToFollow();
  }, []);

  // Handle media selection
  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Only image and video files are allowed');
        return;
      }

      setSelectedMedia(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview({
          url: e.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected media
  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to get profile image with fallback
  const getProfileImage = (image, type = 'user') => {
    if (image && image !== '' && !image.includes('undefined')) {
      return image;
    }
    return type === 'startup' ? DEFAULT_STARTUP_LOGO : DEFAULT_PROFILE_IMAGE;
  };

  // Mock data fallback
  const getMockPosts = () => [
    {
      id: 1,
      author: {
        id: 'warren-buffett',
        name: 'Warren Buffett',
        role: 'Managing Partner at Tech Ventures Capital',
        avatar: '/assets/Warren_Buffett.jpg',
        isVerified: true
      },
      content: '✨ Learning is a journey, and I\'m loving every step!\n\nCurrently diving deep into private equity, VC, and how angel investors collaborate with merchant bankers.',
      hashtags: ['#LearningJourney', '#VentureCapital', '#AngelInvestors'],
      likes: 42,
      comments: [
        {
          author: { name: 'John Smith', avatar: '/assets/user2.jpg' },
          text: 'Great insights! Would love to hear more about your thoughts on angel investing.',
          time: '2 hours ago',
          likes: 3
        }
      ],
      shares: 5,
      isLiked: false,
      postTime: '2 hours ago',
      type: 'thought'
    },
    {
      id: 2,
      author: {
        id: 'discord',
        name: 'Discord',
        role: 'Workflow automation platform',
        avatar: '/assets/discord.svg',
        isVerified: true
      },
      content: '✨ Exploring how partnerships bring innovative ideas to life is fascinating! 🚀\n\nWe\'re excited to announce our integration with Tapro to help startups streamline their workflow.',
      hashtags: ['#Collaboration', '#StartUps', '#ProductUpdate'],
      likes: 28,
      comments: [
        {
          author: { name: 'Sarah Chen', avatar: '/assets/user3.jpg' },
          text: 'This is exactly what we needed for our team!',
          time: '1 hour ago',
          likes: 2
        }
      ],
      shares: 3,
      isLiked: false,
      postTime: '4 hours ago',
      image: '/assets/discord-post.jpg',
      type: 'announcement'
    },
    {
      id: 3,
      author: {
        id: 'suyash-shukla',
        name: 'Suyash Shukla',
        role: 'Founder & CEO at FinStream',
        avatar: '/assets/user.jpeg',
        isVerified: true
      },
      content: '🎉 Thrilled to announce that FinStream has successfully closed our $1.5M seed round led by Tech Ventures Capital with participation from Y Combinator and several strategic angel investors.\n\nWe\'re on a mission to democratize financial analytics for SMEs across emerging markets, and this funding will help us scale our AI capabilities and expand to new regions.\n\nHiring across engineering, product, and sales roles. DM if interested!',
      hashtags: ['#Funding', '#Fintech', '#Startup', '#Hiring'],
      likes: 136,
      comments: [
        {
          author: { name: 'Warren Buffett', avatar: '/assets/Warren_Buffett.jpg' },
          text: 'Congratulations! Excited to be part of this journey.',
          time: '30 minutes ago',
          likes: 8
        },
        {
          author: { name: 'Alex Johnson', avatar: '/assets/user4.jpg' },
          text: 'Amazing news! Looking forward to seeing FinStream grow.',
          time: '20 minutes ago',
          likes: 2
        }
      ],
      shares: 24,
      isLiked: true,
      postTime: '6 hours ago',
      type: 'funding'
    },
    {
      id: 4,
      author: {
        id: 'figma',
        name: 'Figma',
        role: 'Design Tool Platform',
        avatar: '/assets/figma.svg',
        isVerified: true
      },
      content: '📊 How we scaled our design system to support 10M+ users:\n\n1. Built a centralized component library\n2. Implemented strict versioning\n3. Created detailed documentation\n4. Established cross-functional design reviews\n5. Automated testing for visual consistency\n\nWhat strategies have worked for your team?',
      hashtags: ['#DesignSystem', '#ProductDesign', '#Scaling'],
      likes: 89,
      comments: [],
      shares: 17,
      isLiked: false,
      postTime: '1 day ago',
      type: 'insight'
    }
  ];

  const handleLike = async (postId) => {
    // Optimistic update
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
        : post
    ));

    // Make API call
    try {
      await apiRequest(API_ENDPOINTS.postLike(postId), { method: 'POST' });
    } catch (err) {
      console.error('Error liking post:', err);
      // Revert on error
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes + 1 : post.likes - 1, isLiked: !post.isLiked }
          : post
      ));
    }
  };

  const handleComment = (postId) => {
    setShowCommentField(showCommentField === postId ? null : postId);
  };
  
  const submitComment = async (postId) => {
    if (commentText.trim() === '') return;

    const newComment = {
      author: {
        name: currentUser?.name || 'Anonymous',
        avatar: currentUser?.profileImage || '/assets/user.jpeg'
      },
      text: commentText,
      time: 'Just now',
      likes: 0
    };

    // Optimistic update
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [...post.comments, newComment]
          }
        : post
    ));

    setCommentText('');
    setShowCommentField(null);

    // Make API call
    try {
      await apiRequest(API_ENDPOINTS.postComment(postId), {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      });
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };
  
  const handleBookmark = async (postId) => {
    const isBookmarked = bookmarkedPosts.includes(postId);

    // Optimistic update
    if (isBookmarked) {
      setBookmarkedPosts(bookmarkedPosts.filter(id => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }

    // Make API call
    try {
      await apiRequest(API_ENDPOINTS.postBookmark(postId), { method: 'POST' });
    } catch (err) {
      console.error('Error bookmarking post:', err);
      // Revert on error
      if (isBookmarked) {
        setBookmarkedPosts([...bookmarkedPosts, postId]);
      } else {
        setBookmarkedPosts(bookmarkedPosts.filter(id => id !== postId));
      }
    }
  };
  
  const handleShare = (postId) => {
    // In a real app, this would open a share modal
    alert(`Sharing post #${postId}`);
  };
  
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.tag-dropdown')) {
      setShowTagDropdown(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


  const handlePostContent = async () => {
    if (postContent.trim() === '' && !selectedMedia) return;

    // Determine post type based on selected tag
    let postType = 'thought';
    if (selectedTag) {
      if (selectedTag.includes('Funding')) postType = 'funding';
      else if (selectedTag.includes('Announcement')) postType = 'announcement';
      else if (selectedTag.includes('Insight')) postType = 'insight';
    }

    const newPost = {
      id: Date.now(),
      author: {
        id: currentUser?.id || 'anonymous',
        name: currentUser?.name || currentUser?.fullName || 'Anonymous',
        role: currentUser?.role || 'User',
        avatar: getProfileImage(currentUser?.profileImage),
        isVerified: false
      },
      content: postContent,
      hashtags: selectedTag ? [`#${selectedTag.replace(/[^\w]/g, '')}`] : [],
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      postTime: 'Just now',
      type: postType,
      image: mediaPreview?.url || null
    };

    // Optimistic update
    setPosts([newPost, ...posts]);
    const savedContent = postContent;
    const savedTag = selectedTag;
    const savedMedia = mediaPreview;
    setPostContent('');
    setSelectedTag(null);
    removeMedia();

    // Make API call
    try {
      // For now, we'll send the image as a base64 string
      // In production, you'd want to upload to a file storage service
      const response = await apiRequest(API_ENDPOINTS.posts, {
        method: 'POST',
        body: JSON.stringify({
          content: savedContent,
          type: postType,
          hashtags: savedTag ? [`#${savedTag.replace(/[^\w]/g, '')}`] : [],
          images: savedMedia ? [savedMedia.url] : [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update with actual post from server
        setPosts(prev => prev.map(p => p.id === newPost.id ? { ...p, id: data.post.id } : p));
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };
  
  const navigateToProfile = (authorId, authorType) => {
    if (authorType === 'investor' || authorId.includes('warren') || authorId.includes('buffett')) {
      navigate(`/investors/${authorId}`);
    } else if (authorType === 'user' || authorId === 'suyash-shukla') {
      navigate(`/users/${authorId}`);
    } else {
      navigate(`/startups/${authorId}`);
    }
  };
  
  // Posts are already filtered by API, but apply local filter for mock data fallback
  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(post => post.type === activeFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5EE] font-sans text-sm">
      <Header active="Home" />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Explore</h1>
            <p className="text-gray-600 text-sm">Connect with startups, investors, and founders</p>
          </div>
          
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search posts, people, or topics..." 
                className="w-full md:w-64 pl-12 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black" 
              />
            </div>
          </div>
        </div>
        
        {/* Post Filters */}
        <div className="flex overflow-x-auto mb-6 pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
              activeFilter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            All Updates
          </button>
          <button 
            onClick={() => setActiveFilter('funding')}
            className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
              activeFilter === 'funding' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span className="inline-block mr-1">💰</span> Funding News
          </button>
          <button 
            onClick={() => setActiveFilter('announcement')}
            className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
              activeFilter === 'announcement' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span className="inline-block mr-1">🔔</span> Announcements
          </button>
          <button 
            onClick={() => setActiveFilter('insight')}
            className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
              activeFilter === 'insight' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span className="inline-block mr-1">📊</span> Insights
          </button>
          <button 
            onClick={() => setActiveFilter('thought')}
            className={`px-4 py-2 mr-2 rounded-full whitespace-nowrap ${
              activeFilter === 'thought' ? 'bg-black text-white' : 'bg-white text-gray-700'
            }`}
          >
            <span className="inline-block mr-1">💭</span> Thoughts
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={getProfileImage(currentUser?.profileImage)}
                  alt="User"
                  className="w-10 h-10 object-cover rounded-full cursor-pointer"
                  onError={(e) => { e.target.src = DEFAULT_PROFILE_IMAGE; }}
                  onClick={() => navigate('/profile/manage')}
                />
                <div className="relative flex-1">
                  <textarea
                    placeholder="Share an update, milestone or announcement..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="bg-gray-50 w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[60px] resize-none"
                  />
                </div>
              </div>

              {/* Media Preview */}
              {mediaPreview && (
                <div className="mb-4 relative">
                  {mediaPreview.type === 'image' ? (
                    <img
                      src={mediaPreview.url}
                      alt="Preview"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={mediaPreview.url}
                      controls
                      className="w-full max-h-64 rounded-lg"
                    />
                  )}
                  <button
                    onClick={removeMedia}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleMediaSelect}
                accept="image/*,video/*"
                className="hidden"
              />

              <div className="flex flex-wrap justify-between items-center text-xs">
                <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-1 px-3 py-1.5 ${selectedMedia ? 'bg-blue-100 text-blue-600' : 'bg-gray-50'} rounded-full hover:bg-gray-100 transition`}
                  >
                    <FiImage className={selectedMedia ? 'text-blue-600' : 'text-gray-500'} /> <span>Media</span>
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                    <FiLink className="text-gray-500" /> <span>Link</span>
                  </button>
                  <div className="relative tag-dropdown">
  <button 
    type="button"
    onClick={() => setShowTagDropdown(prev => !prev)}
    className={`flex items-center gap-1 px-3 py-1.5 ${selectedTag ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100'} rounded-full transition`}
  >
    <FiTag className={selectedTag ? 'text-white' : 'text-gray-500'} />
    <span>{selectedTag || 'Add Tag'}</span>
  </button>

  {showTagDropdown && (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-md p-2 w-48 z-20">
      {['💰 Funding News', '🔔 Announcement', '📊 Insight', '💭 Thought'].map(tag => (
        <button 
          key={tag}
          onClick={() => {
            setSelectedTag(tag);
            setShowTagDropdown(false);
          }}
          className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 rounded text-sm"
        >
          {tag}
        </button>
      ))}
    </div>
  )}
</div>

                </div>
                
                <button 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    postContent.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  } transition`}
                  onClick={handlePostContent}
                  disabled={!postContent.trim()}
                >
                  Post
                </button>
              </div>
            </div>
            
            {loading ? (
              // Loading skeleton
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white rounded-lg p-5 shadow-sm animate-pulse">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Actual posts
              <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                    <div className="mb-4 text-gray-400">
                      <FiActivity size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No posts to show</h3>
                    <p className="text-gray-500 mb-4">
                      {activeFilter === 'all' 
                        ? "Your feed is empty. Follow more people or startups to see their updates." 
                        : `No ${activeFilter} posts available at the moment.`
                      }
                    </p>
                    <button 
                      onClick={() => navigate('/discover')}
                      className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium"
                    >
                      Discover People & Startups
                    </button>
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <div key={post.id} className="bg-white rounded-lg p-5 shadow-sm">
                      {/* Post Header */}
                      <div className="flex items-start mb-3">
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name} 
                          className="w-10 h-10 object-cover rounded-full mr-3 cursor-pointer" 
                          onClick={() => navigateToProfile(post.author.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3 
                              className="font-semibold text-sm hover:underline cursor-pointer truncate"
                              onClick={() => navigateToProfile(post.author.id)}
                            >
                              {post.author.name}
                            </h3>
                            {post.author.isVerified && (
                              <span className="text-blue-500 ml-1">✓</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{post.author.role}</p>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-2 whitespace-nowrap">{post.postTime}</span>
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <FiMoreHorizontal />
                          </button>
                        </div>
                      </div>
                      
                      {/* Post Content */}
                      <div className="text-sm text-gray-800 whitespace-pre-line mb-3">{post.content}</div>
                      
                      {/* Post Image (if present) */}
                      {post.image && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img src={post.image} alt="Post" className="w-full h-auto" />
                        </div>
                      )}
                      
                      {/* Post Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.hashtags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="text-xs text-blue-600 hover:underline cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Engagement Stats */}
                      <div className="flex text-xs text-gray-500 mb-3">
                        <span>{post.likes} likes</span>
                        <span className="mx-2">•</span>
                        <span>{post.comments.length} comments</span>
                        <span className="mx-2">•</span>
                        <span>{post.shares} shares</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex border-t border-b py-1 mb-3">
                        <button 
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50 transition ${
                            post.isLiked ? 'text-blue-600 font-medium' : 'text-gray-600'
                          }`}
                          onClick={() => handleLike(post.id)}
                        >
                          <FiHeart className={post.isLiked ? 'fill-current' : ''} /> Like
                        </button>
                        <button 
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50 transition text-gray-600"
                          onClick={() => handleComment(post.id)}
                        >
                          <FiMessageSquare /> Comment
                        </button>
                        <button 
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50 transition text-gray-600"
                          onClick={() => handleShare(post.id)}
                        >
                          <FiShare2 /> Share
                        </button>
                        <button 
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-50 transition ${
                            bookmarkedPosts.includes(post.id) ? 'text-blue-600 font-medium' : 'text-gray-600'
                          }`}
                          onClick={() => handleBookmark(post.id)}
                        >
                          <FiBookmark className={bookmarkedPosts.includes(post.id) ? 'fill-current' : ''} /> Save
                        </button>
                      </div>
                      
                      {/* Comments Section */}
                      {post.comments.length > 0 && (
                        <div className="mb-3">
                          {post.comments.slice(0, showCommentField === post.id ? undefined : 2).map((comment, index) => (
                            <div key={index} className="flex items-start mb-3 last:mb-0">
                              <img 
                                src={comment.author.avatar} 
                                alt={comment.author.name} 
                                className="w-7 h-7 object-cover rounded-full mr-2" 
                              />
                              <div className="flex-1">
                                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium text-xs">{comment.author.name}</span>
                                    <span className="text-gray-400 text-xs">{comment.time}</span>
                                  </div>
                                  <p className="text-sm">{comment.text}</p>
                                </div>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                  <button>Like</button>
                                  <button>Reply</button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {post.comments.length > 2 && showCommentField !== post.id && (
                            <button 
                              className="text-sm text-blue-600 hover:underline mt-1"
                              onClick={() => handleComment(post.id)}
                            >
                              Show all {post.comments.length} comments
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Comment Input Field */}
                      {showCommentField === post.id && (
                        <div className="flex items-start mt-3">
                          <img 
                            src="/assets/user.jpeg" 
                            alt="User" 
                            className="w-7 h-7 object-cover rounded-full mr-2" 
                          />
                          <div className="flex-1 relative">
                            <textarea
                              placeholder="Write a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black min-h-[60px] resize-none"
                            />
                            <button 
                              className="absolute right-2 bottom-2 bg-black text-white px-3 py-1 text-xs rounded-full disabled:bg-gray-300"
                              onClick={() => submitComment(post.id)}
                              disabled={!commentText.trim()}
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Trending Topics</h3>
                <FiTrendingUp className="text-gray-400" />
              </div>
              {trendingTopics.map((topic, index) => (
                <div 
                  key={index} 
                  className="py-2 border-t last:border-b flex justify-between items-center hover:bg-gray-50 px-2 rounded cursor-pointer transition"
                >
                  <span className="text-sm">{topic.name}</span>
                  <span className="text-xs text-gray-500">{topic.count} posts</span>
                </div>
              ))}
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Upcoming Events</h3>
                <FiCalendar className="text-gray-400" />
              </div>
              {upcomingEvents.map((event, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <p className="font-medium text-sm">{event.name}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={12} /> {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin size={12} /> {event.location}
                    </span>
                  </div>
                </div>
              ))}
              <button className="w-full mt-3 text-blue-600 text-sm hover:underline">
                View All Events
              </button>
            </div>
            
            {/* Promotions */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold">Sponsored</h3>
                <FiInfo className="text-gray-400 cursor-help" title="Sponsored content" />
              </div>
              
              {promotions.map((promo, index) => (
                <div key={index} className="mb-4 last:mb-0 cursor-pointer">
                  <div className="mb-2 overflow-hidden rounded-lg bg-gray-100 h-24">
                    <img 
                      src={promo.image}
                      alt={promo.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/promotion-placeholder.jpg';
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium hover:underline">{promo.title}</p>
                  <p className="text-xs text-gray-500">{promo.time} • {promo.views}</p>
                </div>
              ))}
            </div>
            
            {/* Who to Follow */}
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Who to Follow</h3>
                <FiUsers className="text-gray-400" />
              </div>

              {whoToFollow.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Loading suggestions...</p>
              ) : (
              whoToFollow.map((suggestion, index) => (
                <div key={suggestion.id || index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center">
                    <img
                      src={getProfileImage(suggestion.profileImage || suggestion.logo, suggestion.userType === 'startup' ? 'startup' : 'user')}
                      alt={suggestion.name || suggestion.fullName}
                      onError={(e) => { e.target.src = DEFAULT_PROFILE_IMAGE; }} 
                      className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                      onClick={() => navigateToProfile(suggestion.id)}
                    />
                    <div>
                      <div className="flex items-center">
                        <h4
                          className="font-medium text-sm hover:underline cursor-pointer"
                          onClick={() => {
                            if (suggestion.userType === 'startup') {
                              navigate(`/startups/${suggestion.id}`);
                            } else if (suggestion.userType === 'investor') {
                              navigate(`/investors/${suggestion.id}`);
                            } else {
                              navigate(`/users/${suggestion.id}`);
                            }
                          }}
                        >
                          {suggestion.name || suggestion.fullName}
                        </h4>
                        {suggestion.verified && (
                          <span className="text-blue-500 ml-1">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{suggestion.role || suggestion.tagline || suggestion.userType}</p>
                    </div>
                  </div>
                  <button className="bg-black text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800 transition">
                    Follow
                  </button>
                </div>
              ))
              )}
              
              <button 
                className="w-full mt-3 text-blue-600 text-sm hover:underline"
                onClick={() => navigate('/discover')}
              >
                View More
              </button>
            </div>
            
            {/* Footer */}
            <div className="text-xs text-gray-500">
              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Help Center</a>
              </div>
              <p>© 2025 Tapro, Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TaproExplore;