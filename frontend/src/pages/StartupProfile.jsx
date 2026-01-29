import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import {
  FiMail,
  FiCopy,
  FiMessageSquare,
  FiUserPlus,
  FiShare2,
  FiGlobe,
  FiDownload,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiHeart,
  FiLink
} from 'react-icons/fi';

// Mock data - in a real app, this would come from your API
const mockStartupData = {
  id: 'discord',
  name: 'Discord',
  tagline: 'Revolutionizing workflow automation with artificial intelligence',
  verified: true,
  logo: '/assets/discord.svg',
  coverImage: '/assets/cover-placeholder.jpg',
  categories: ['SaaS', 'AI'],
  stage: 'Series A',
  teamSize: '25-50',
  location: 'San Francisco, CA',
  founded: '2020',
  website: 'techflow.ai',
  email: 'contact@techflow.ai',
  about: 'TechFlow AI is building the next generation of intelligent workflow automation. Our platform uses advanced AI to automate complex business processes, reducing manual work by up to 80% and improving accuracy by 95%.',
  problem: 'Traditional workflow automation tools are rigid and require extensive manual configuration. They cannot adapt to changing business needs and often break when processes evolve.',
  solution: 'Our AI-powered platform learns from existing workflows and automatically adapts to changes. It can understand context, handle exceptions, and continuously improve its automation capabilities.',
  metrics: {
    monthlyRevenue: '$500k',
    activeUsers: '5000+',
    arr: '$1.8M',
    monthlyGrowth: '15%',
    cac: '$1,200',
    ltv: '$24,000',
    burnRate: '$120k/month',
    runway: '18 months'
  },
  fundraising: {
    currentRound: 'Series A',
    raised: '$3.2M',
    goal: '$5M',
    valuation: '$25M',
    investors: 12,
    closingDate: '2025-06-30'
  },
  team: [
    { name: 'Sarah Chen', title: 'CEO & Co-founder', exp: 'Ex-Google AI, Stanford CS', linkedin: 'linkedin.com/in/sarah' },
    { name: 'Mike Rodriguez', title: 'CTO & Co-founder', exp: 'Ex-AWS, MIT AI Lab', linkedin: 'linkedin.com/in/mike' },
    { name: 'Lisa Kumar', title: 'Head of Product', exp: 'Ex-Salesforce, PM Lead', linkedin: 'linkedin.com/in/lisa' }
  ],
  investors: [
    { name: 'TechStars', type: 'Accelerator', logo: '/assets/techstars.png' },
    { name: 'YCombinator', type: 'Accelerator', logo: '/assets/yc.png' },
    { name: 'Warren Buffett', type: 'Angel Investor', logo: '/assets/Warren_Buffett.jpg' }
  ],
  posts: [
    {
      id: 1,
      content: '✨ Excited to announce our Series A funding round! Looking forward to scaling our team and product.',
      hashtags: ['#FundingAnnouncement', '#SeriesA', '#StartupLife'],
      date: '2 days ago',
      likes: 42,
      comments: 12
    },
    {
      id: 2,
      content: '🚀 Just hit 5,000 active users! Thanks to our amazing team and supportive customers.',
      hashtags: ['#Milestone', '#GrowthMetrics', '#CustomerSuccess'],
      date: '1 week ago',
      likes: 28,
      comments: 8
    }
  ],
  pitchDeck: '/documents/pitch-deck.pdf',
  videoDemo: 'https://youtube.com/watch?v=example',
  similarStartups: ['Figma', 'Notion', 'Slack'],
  awards: ['TechCrunch Disrupt Finalist 2024', 'Forbes 30 Under 30']
};

const StartupProfile = () => {
  const { startupId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [startup, setStartup] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Tabs with count indicators where applicable
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'team', label: 'Team', count: mockStartupData.team.length },
    { id: 'investors', label: 'Investors', count: mockStartupData.investors.length },
    { id: 'post', label: 'Updates', count: mockStartupData.posts.length }
  ];

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.startups(startupId));

        if (!response.ok) {
          // If API fails, fall back to mock data for demo
          console.warn('API call failed, using mock data');
          setStartup(mockStartupData);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setStartup(data);
      } catch (err) {
        console.error('Error fetching startup:', err);
        // Fall back to mock data for demo
        setStartup(mockStartupData);
      } finally {
        setLoading(false);
      }
    };

    fetchStartupData();
  }, [startupId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In a real app, you would call your API to follow/unfollow the startup
  };

  const handleExpressInterest = () => {
    setIsInterested(!isInterested);
    // In a real app, you would call your API to express interest
    if (!isInterested) {
      setShowContactInfo(true);
    }
  };

  const handleShare = () => {
    // In a real app, you would implement social sharing
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const renderTabContent = (tab) => {
    if (!startup) return null;

    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-3">About {startup.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{startup.about}</p>
              
              {startup.awards && startup.awards.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Awards & Recognition</h4>
                  <div className="flex flex-wrap gap-2">
                    {startup.awards.map((award, i) => (
                      <span key={i} className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full border border-yellow-200">
                        🏆 {award}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 mb-1">Monthly Revenue</p>
                <p className="text-xl font-bold">{startup.metrics.monthlyRevenue}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 mb-1">Active Users</p>
                <p className="text-xl font-bold">{startup.metrics.activeUsers}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span> Problem
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{startup.problem}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <span className="text-green-500 mr-2">💡</span> Solution
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{startup.solution}</p>
              </div>
            </div>
            
            {startup.videoDemo && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Product Demo</h4>
                <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-sm text-gray-500">Video demo placeholder</p>
                  {/* In a real app, you would embed the video here */}
                </div>
              </div>
            )}
            
            {startup.similarStartups && startup.similarStartups.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h4 className="text-sm font-semibold mb-3">Similar Startups</h4>
                <div className="flex flex-wrap gap-3">
                  {startup.similarStartups.map((similar, i) => (
                    <div key={i} className="bg-gray-50 px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-100">
                      {similar}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Key Performance Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(startup.metrics).map(([key, value], index) => {
                  // Convert camelCase to readable format
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className="text-lg font-bold">{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
              <FiAlertCircle className="text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-700">Investor Information</h4>
                <p className="text-xs text-blue-600 mt-1">
                  These metrics are provided by the startup and have not been independently verified. 
                  Due diligence is recommended before making investment decisions.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Growth Trajectory</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Growth chart placeholder</p>
                {/* In a real app, you would display a chart here */}
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Leadership Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {startup.team.map((member, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        {member.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{member.exp}</p>
                    <a 
                      href={`https://${member.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <FiLink size={12} /> LinkedIn Profile
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Company Culture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Values</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">⬤</span>
                      <span>Innovation and continuous learning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">⬤</span>
                      <span>Customer-centric approach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">⬤</span>
                      <span>Transparency and open communication</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Benefits</h4>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">⬤</span>
                      <span>Flexible remote work policy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">⬤</span>
                      <span>Comprehensive health benefits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">⬤</span>
                      <span>Equity options for all employees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'investors':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Current Investors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {startup.investors.map((investor, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <img 
                      src={investor.logo} 
                      alt={investor.name} 
                      className="w-12 h-12 rounded-full object-cover mr-3" 
                    />
                    <div>
                      <p className="font-medium text-sm">{investor.name}</p>
                      <p className="text-xs text-gray-500">{investor.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Funding History</h3>
              <div className="relative pl-10 pb-8">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="relative mb-8">
                  <div className="absolute left-[-20px] w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    3
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Series A</span>
                      <span className="text-sm text-gray-500">In Progress</span>
                    </div>
                    <p className="text-sm mb-3">Target: $5M</p>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600">$3.2M raised (65%)</p>
                  </div>
                </div>
                
                <div className="relative mb-8">
                  <div className="absolute left-[-20px] w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                    2
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Seed Round</span>
                      <span className="text-sm text-gray-500">2023</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">$1.5M from TechStars and 3 angel investors</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute left-[-20px] w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                    1
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pre-seed</span>
                      <span className="text-sm text-gray-500">2022</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">$500K from friends & family and angel investors</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="space-y-4">
            {startup.posts.map(post => (
              <div key={post.id} className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <img src={startup.logo} alt={startup.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <h4 className="font-medium text-sm">{startup.name}</h4>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{post.content}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-blue-600">{tag}</span>
                  ))}
                </div>
                
                <div className="flex text-xs gap-6 pt-3 border-t">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                    <FiHeart size={14} /> {post.likes} Likes
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                    <FiMessageSquare size={14} /> {post.comments} Comments
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                    <FiShare2 size={14} /> Share
                  </button>
                </div>
              </div>
            ))}
            
            <div className="text-center p-4">
              <button className="text-sm text-blue-600 font-medium hover:underline">
                Load more updates
              </button>
            </div>
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
            <p className="mt-4">Loading startup details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
        <Header active="Discover" />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md">
            <FiAlertCircle className="mx-auto text-red-500" size={48} />
            <h2 className="text-xl font-bold mt-4">Startup Not Found</h2>
            <p className="mt-2 mb-6 text-gray-600">The startup you are looking for could not be found or is no longer available.</p>
            <button 
              onClick={() => navigate('/discover')} 
              className="bg-black text-white px-4 py-2 rounded"
            >
              Discover Startups
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
      <Header active="Discover" />
      
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 py-6">
        {/* Top Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Optional Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {/* {startup.coverImage && (
              <img 
                src={startup.coverImage} 
                alt={`${startup.name} cover`} 
                className="w-full h-full object-cover"
              />
            )} */}
          </div>
          
          <div className="flex justify-between items-start flex-wrap gap-4 p-6 relative">
            {/* Logo (positioned to overlap with cover) */}
            <div className="flex gap-4 items-center min-w-[260px]">
              <img 
                src={startup.logo} 
                alt={startup.name} 
                className="h-20 w-20 rounded-xl object-cover border-4 border-white mt-[-40px]" 
              />
              <div className="mt-2">
                <h2 className="text-xl font-bold flex items-center gap-1">
                  {startup.name} 
                  {startup.verified && <span className="text-blue-500">✓</span>}
                </h2>
                <p className="text-sm text-gray-600">{startup.tagline}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-2 flex-wrap">
                  {startup.categories.map((category, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded">{category}</span>
                  ))}
                  <span className="bg-gray-100 px-2 py-1 rounded">{startup.stage}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{startup.teamSize}</span>
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
                className="border px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                onClick={() => window.open(`https://${startup.website}`, '_blank')}
              >
                <FiGlobe size={14} /> Visit Website
              </button>
              
              <button 
                className="border px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                onClick={() => navigate('/messages')}
              >
                <FiMessageSquare size={14} /> Message
              </button>
              
              <button 
                className="border px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
                onClick={handleShare}
              >
                <FiShare2 size={14} /> {copySuccess ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Company Quick Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Founded</p>
              <p className="text-sm font-semibold">{startup.founded}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-semibold">{startup.location}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Team Size</p>
              <p className="text-sm font-semibold">{startup.teamSize}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Funding Stage</p>
              <p className="text-sm font-semibold">{startup.stage}</p>
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
            {/* Fundraising Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h4 className="text-base font-semibold mb-2">Fundraising</h4>
              <p className="text-xs text-gray-500 mb-3 flex items-center justify-between">
                <span>Current round: {startup.fundraising.currentRound}</span>
                <span className="flex items-center gap-1"><FiCalendar size={12} /> Closing {new Date(startup.fundraising.closingDate).toLocaleDateString()}</span>
              </p>
              
              <div className="flex justify-between text-sm mb-2">
                <span>Raised: <strong>{startup.fundraising.raised}</strong></span>
                <span>Goal: <strong>{startup.fundraising.goal}</strong></span>
              </div>
              
              <div className="w-full bg-gray-200 h-2 rounded-full mb-2 overflow-hidden">
                <div 
                  className="bg-black h-full rounded-full" 
                  style={{ width: `${(parseInt(startup.fundraising.raised.replace(/\D/g, '')) / parseInt(startup.fundraising.goal.replace(/\D/g, ''))) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-600 flex justify-between mb-3">
                <span>Valuation: <strong>{startup.fundraising.valuation}</strong></span>
                <span>{startup.fundraising.investors} investors</span>
              </div>
              
              <button 
                onClick={handleExpressInterest}
                className={`w-full py-2 rounded font-medium text-sm mb-2 transition ${
                  isInterested 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-black text-white'
                }`}
              >
                {isInterested ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiCheck size={16} /> Interest Expressed
                  </span>
                ) : 'Express Interest'}
              </button>
              
              {isInterested && (
                <p className="text-xs text-gray-600 text-center">
                  You'll be notified when the startup responds
                </p>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h4 className="text-base font-semibold mb-3">Contact Information</h4>
              
              {showContactInfo ? (
                <>
                  <p className="text-sm text-blue-600 flex items-center gap-2 mb-2">
                    <FiGlobe size={14} /> {startup.website}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2 mb-4">
                    <FiMail size={14} /> {startup.email}
                  </p>
                </>
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Express interest to view contact information</p>
                  <button 
                    onClick={handleExpressInterest}
                    className="text-sm text-blue-600 font-medium"
                  >
                    Express Interest
                  </button>
                </div>
              )}
              
              <button 
                onClick={handleCopyProfileLink}
                className="w-full border text-sm flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-50"
              >
                <FiCopy size={14} /> {copySuccess ? 'Profile Link Copied!' : 'Copy Profile Link'}
              </button>
            </div>
            
            {/* Pitch Deck */}
            {startup.pitchDeck && (
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h4 className="text-base font-semibold mb-3">Pitch Deck</h4>
                
                {showContactInfo ? (
                  <button className="w-full bg-gray-100 text-gray-800 py-2 rounded text-sm flex items-center justify-center gap-2">
                    <FiDownload size={14} /> Download Pitch Deck
                  </button>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Express interest to access pitch deck</p>
                    <button 
                      onClick={handleExpressInterest}
                      className="text-sm text-blue-600 font-medium"
                    >
                      Express Interest
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Latest Metrics */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-base font-semibold">Key Metrics</h4>
                <button 
                  onClick={() => setActiveTab('metrics')}
                  className="text-xs text-blue-600"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-sm font-medium">{startup.metrics.monthlyRevenue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Growth</span>
                  <span className="text-sm font-medium">{startup.metrics.monthlyGrowth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium">{startup.metrics.activeUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StartupProfile;