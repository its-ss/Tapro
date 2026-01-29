import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { API_ENDPOINTS } from '../config/api';
import {
  FiMail,
  FiCopy,
  FiExternalLink,
  FiMessageSquare,
  FiUserPlus,
  FiShare2,
  FiGlobe,
  FiCheck,
  FiCalendar,
  FiLinkedin,
  FiTwitter,
  FiDollarSign,
  FiBarChart2,
  FiBook,
  FiHeart,
  FiAlertCircle,
  FiLink,
  FiStar
} from 'react-icons/fi';

// Mock data - in a real app, this would come from your API
const mockInvestorData = {
  id: 'warren-buffett',
  name: 'Warren Buffett',
  title: 'Managing Partner at Tech Ventures Capital',
  verified: true,
  profileImage: '/assets/Warren_Buffett.jpg',
  coverImage: '/assets/cover-placeholder.jpg',
  investorType: 'Angel Investor',
  sectors: ['Fintech', 'SaaS', 'AI', 'HealthTech'],
  investments: '50+',
  location: 'New York, USA',
  website: 'techventures.capital',
  email: 'warren@techventures.com',
  linkedin: 'linkedin.com/in/warren-buffett',
  twitter: '@warrenbuffett',
  about: 'Warren is a globally renowned angel investor and Managing Partner at Tech Ventures Capital. He has a passion for empowering founders and unlocking new markets with capital, mentorship, and strategy. With over 10 years of experience in the tech investment space, Warren has backed numerous successful startups from seed to series A and beyond.',
  investmentPhilosophy: 'I focus on founders with clear vision, strong execution capability, and market insights that others miss. I believe in backing people first, ideas second, and metrics third. My investment horizon is typically 5-7 years, and I aim to be a value-add investor through my network and operational experience.',
  metrics: {
    aum: '$500M',
    experience: '10+ years',
    averageInvestment: '$250K - $1M',
    successfulExits: '12',
    currentPortfolioSize: '28',
    returnRate: '22% IRR'
  },
  portfolio: [
    { name: 'Discord', stage: 'Series A', sector: 'Communication', logo: '/assets/discord.svg', year: '2021' },
    { name: 'Figma', stage: 'Seed', sector: 'Design Tools', logo: '/assets/figma.svg', year: '2020' },
    { name: 'Notion', stage: 'Series A', sector: 'Productivity', logo: '/assets/notion.svg', year: '2019' },
    { name: 'Rippling', stage: 'Seed', sector: 'HR Tech', logo: '/assets/rippling.svg', year: '2018' }
  ],
  founderTestimonials: [
    { 
      name: 'Anjali Mehta', 
      role: 'CEO', 
      company: 'Finstream', 
      testimonial: 'Warren provided invaluable guidance and opened key investor networks. His strategic advice helped us navigate challenging times and accelerate our growth.', 
      image: '/assets/user1.jpg' 
    },
    { 
      name: 'David Kim', 
      role: 'Founder', 
      company: 'TruAI', 
      testimonial: "He helped us navigate our pivot with clarity and confidence. Warren goes beyond capital - he's a true partner who cares about founder success.", 
      image: '/assets/user2.jpg' 
    },
    { 
      name: 'Sarah Chen', 
      role: 'CTO', 
      company: 'DataFlow', 
      testimonial: 'The best value from Warren was his deep industry expertise and willingness to make key introductions at exactly the right time.', 
      image: '/assets/user3.jpg' 
    }
  ],
  posts: [
    {
      id: 1,
      content: "✨ Always learning. Excited to support the next wave of disruptors in the AI space!",
      hashtags: ['#Investing', '#StartupLife', '#TechTrends', '#AI'],
      date: '2 days ago',
      likes: 42,
      comments: 12
    },
    {
      id: 2,
      content: "Just had a great discussion with founders in the climate tech space. The innovation happening is truly inspiring. Looking to increase my exposure in this sector.",
      hashtags: ['#ClimateAction', '#ClimateTech', '#Investing'],
      date: '1 week ago',
      likes: 78,
      comments: 23
    },
    {
      id: 3,
      content: "Attending @TechCrunch Disrupt next month. Excited to meet promising founders. DM me if you're there and would like to connect!",
      hashtags: ['#TechCrunch', '#Networking', '#VentureCapital'],
      date: '2 weeks ago',
      likes: 56,
      comments: 31
    }
  ],
  investmentCriteria: {
    stagePreference: ['Pre-seed', 'Seed', 'Series A'],
    checkSize: '$250K - $1M',
    geography: 'US, India, South East Asia',
    leadOrFollow: 'Both lead and follow',
    commitmentLevel: 'Hands-on, board seat when appropriate',
    decisionTimeframe: '2-4 weeks'
  },
  achievements: [
    'Midas List 2023 - Top 100 VCs',
    'Forbes 30 Under 30 in Finance (2018)',
    'Named "Angel Investor of the Year" by TechCrunch (2021)'
  ],
  availableForMentoring: true,
  calendarLink: 'calendly.com/warrenbuffett'
};

const InvestorProfile = () => {
  const { investorId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [investor, setInvestor] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Tabs with count indicators where applicable
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio', count: mockInvestorData.portfolio.length },
    { id: 'founders', label: 'Founder Testimonials', count: mockInvestorData.founderTestimonials.length },
    { id: 'post', label: 'Posts', count: mockInvestorData.posts.length }
  ];

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.investors(investorId));

        if (!response.ok) {
          // If API fails, fall back to mock data for demo
          console.warn('API call failed, using mock data');
          setInvestor(mockInvestorData);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setInvestor(data);
      } catch (err) {
        console.error('Error fetching investor:', err);
        // Fall back to mock data for demo
        setInvestor(mockInvestorData);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestorData();
  }, [investorId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // In a real app, you would call your API to follow/unfollow the investor
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

  const handleScheduleMeeting = () => {
    // In a real app, redirect to the investor's calendar
    window.open(`https://${investor.calendarLink}`, '_blank');
  };

  const renderTabContent = (tab) => {
    if (!investor) return null;

    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-3">About {investor.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{investor.about}</p>
              
              {investor.investmentPhilosophy && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FiBook size={16} className="text-blue-600" />
                    Investment Philosophy
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{investor.investmentPhilosophy}</p>
                </div>
              )}
              
              {investor.achievements && investor.achievements.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Achievements & Recognition</h4>
                  <div className="flex flex-wrap gap-2">
                    {investor.achievements.map((achievement, i) => (
                      <span key={i} className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full border border-yellow-200 flex items-center gap-1">
                        <FiStar size={12} className="text-yellow-500" /> {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 mb-1">Assets Under Management</p>
                <p className="text-xl font-bold">{investor.metrics.aum}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 mb-1">Years of Experience</p>
                <p className="text-xl font-bold">{investor.metrics.experience}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <p className="text-xs text-gray-500 mb-1">Successful Exits</p>
                <p className="text-xl font-bold">{investor.metrics.successfulExits}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-base font-semibold mb-4">Investment Criteria</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium mb-2">Stage Preference</h5>
                  <div className="flex flex-wrap gap-2">
                    {investor.investmentCriteria.stagePreference.map((stage, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Check Size</h5>
                  <p className="text-sm flex items-center gap-2">
                    <FiDollarSign size={14} className="text-green-500" />
                    {investor.investmentCriteria.checkSize}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Geography Focus</h5>
                  <p className="text-sm">{investor.investmentCriteria.geography}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Decision Timeframe</h5>
                  <p className="text-sm">{investor.investmentCriteria.decisionTimeframe}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Lead/Follow</h5>
                  <p className="text-sm">{investor.investmentCriteria.leadOrFollow}</p>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium mb-2">Commitment Level</h5>
                  <p className="text-sm">{investor.investmentCriteria.commitmentLevel}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="text-base font-semibold mb-4">Sector Expertise</h4>
              <div className="flex flex-wrap gap-3">
                {investor.sectors.map((sector, i) => (
                  <div key={i} className="bg-gray-50 px-4 py-2 rounded-lg text-sm border border-gray-100">
                    {sector}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Portfolio Companies</h3>
                <div className="text-sm text-gray-500">Total: {investor.metrics.currentPortfolioSize}</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {investor.portfolio.map((company, i) => (
                  <div 
                    key={i} 
                    className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/startups/${company.name.toLowerCase()}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        <p className="text-xs text-gray-500">{company.sector}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{company.stage}</span>
                      <span>{company.year}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="text-sm font-medium mb-3">Portfolio Metrics</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Average Return</p>
                    <p className="text-base font-medium text-blue-700">{investor.metrics.returnRate}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                    <p className="text-base font-medium text-green-700">68%</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-gray-600 mb-1">Avg Holding Period</p>
                    <p className="text-base font-medium text-purple-700">4.2 years</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-4">Portfolio Distribution</h3>
              <div className="h-72 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">Portfolio distribution chart placeholder</p>
                {/* In a real app, you would display a chart here */}
              </div>
            </div>
          </div>
        );

      case 'founders':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                <span>Founder Testimonials</span>
                <span className="text-sm font-normal text-gray-500">({investor.founderTestimonials.length})</span>
              </h3>
              
              <div className="space-y-6">
                {investor.founderTestimonials.map((testimonial, i) => (
                  <div key={i} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/assets/user.jpeg'; // Fallback image
                        }}
                      />
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-gray-500">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute top-0 left-0 text-gray-200 text-6xl leading-none">"</span>
                      <p className="text-sm text-gray-600 pl-6 pt-2 italic relative z-10">{testimonial.testimonial}</p>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <a 
                        href={`/startups/${testimonial.company.toLowerCase()}`}
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        View Company <FiExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="space-y-4">
            {investor.posts.map(post => (
              <div key={post.id} className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <img src={investor.profileImage} alt={investor.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-medium text-sm">{investor.name}</h4>
                    <p className="text-xs text-gray-500">{post.date}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">{post.content}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-blue-600 hover:underline cursor-pointer">{tag}</span>
                  ))}
                </div>
                
                <div className="flex text-xs gap-6 pt-3 border-t">
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
                    <FiHeart size={14} /> {post.likes} Likes
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
                    <FiMessageSquare size={14} /> {post.comments} Comments
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition">
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
        <Header active="Profile" />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center p-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-4">Loading investor profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
        <Header active="Profile" />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center bg-white p-10 rounded-lg shadow-md max-w-md">
            <FiAlertCircle className="mx-auto text-red-500" size={48} />
            <h2 className="text-xl font-bold mt-4">Investor Not Found</h2>
            <p className="mt-2 mb-6 text-gray-600">The investor profile you are looking for could not be found or is no longer available.</p>
            <button 
              onClick={() => navigate('/discover')} 
              className="bg-black text-white px-4 py-2 rounded"
            >
              Discover Investors
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
      <Header active="Profile" />
      
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 py-6">
        {/* Top Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Optional Cover Image */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            {/* {investor.coverImage && (
              <img 
                src={investor.coverImage} 
                alt={`${investor.name} cover`} 
                className="w-full h-full object-cover"
              />
            )} */}
          </div>
          
          <div className="flex justify-between items-start flex-wrap gap-4 p-6 relative">
            {/* Profile Image (positioned to overlap with cover) */}
            <div className="flex gap-4 items-center min-w-[260px]">
              <img 
                src={investor.profileImage} 
                alt={investor.name} 
                className="h-20 w-20 rounded-full object-cover border-4 border-white mt-[-40px]" 
              />
              <div className="mt-2">
                <h2 className="text-xl font-bold flex items-center gap-1">
                  {investor.name} 
                  {investor.verified && <span className="text-blue-500">✓</span>}
                </h2>
                <p className="text-sm text-gray-600">{investor.title}</p>
                <div className="flex gap-2 text-xs text-gray-500 mt-2 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded">{investor.investorType}</span>
                  {investor.sectors.map((sector, i) => (
                    i < 2 && <span key={i} className="bg-gray-100 px-2 py-1 rounded">{sector}</span>
                  ))}
                  {investor.sectors.length > 2 && (
                    <span className="bg-gray-100 px-2 py-1 rounded">+{investor.sectors.length - 2} more</span>
                  )}
                  <span className="bg-gray-100 px-2 py-1 rounded">{investor.investments} investments</span>
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
                onClick={() => navigate('/messages')}
              >
                <FiMessageSquare size={14} /> Message
              </button>
              
              {investor.availableForMentoring && (
                <button 
                  className="border border-green-500 text-green-600 px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-green-50 transition"
                  onClick={handleScheduleMeeting}
                >
                  <FiCalendar size={14} /> Schedule Meeting
                </button>
              )}
              
              <button 
                className="border px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                onClick={handleShare}
              >
                <FiShare2 size={14} /> {copySuccess ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Investor Quick Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-semibold">{investor.location}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Investments</p>
              <p className="text-sm font-semibold">{investor.investments}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Check Size</p>
              <p className="text-sm font-semibold">{investor.investmentCriteria.checkSize}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Experience</p>
              <p className="text-sm font-semibold">{investor.metrics.experience}</p>
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
            {/* Contact Information */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h4 className="text-base font-semibold mb-3">Contact Information</h4>
              
              <p className="text-sm text-blue-600 flex items-center gap-2 mb-2 hover:underline">
                <FiGlobe size={14} /> 
                <a href={`https://${investor.website}`} target="_blank" rel="noopener noreferrer">
                  {investor.website}
                </a>
              </p>
              
              <p className="text-sm text-gray-700 flex items-center gap-2 mb-2">
                <FiMail size={14} /> {investor.email}
              </p>
              
              <div className="flex gap-3 mt-4 mb-4">
                {investor.linkedin && (
                  <a 
                    href={`https://${investor.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-50 text-blue-700 p-2 rounded-full hover:bg-blue-100 transition"
                  >
                    <FiLinkedin size={18} />
                  </a>
                )}
                
                {investor.twitter && (
                  <a 
                    href={`https://twitter.com/${investor.twitter.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-50 text-blue-500 p-2 rounded-full hover:bg-blue-100 transition"
                  >
                    <FiTwitter size={18} />
                  </a>
                )}
              </div>
              
              <button 
                onClick={handleCopyProfileLink}
                className="w-full border text-sm flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-50 transition"
              >
                <FiCopy size={14} /> {copySuccess ? 'Profile Link Copied!' : 'Copy Profile Link'}
              </button>
            </div>
            
            {/* Key Metrics */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-semibold">Investment Metrics</h4>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View Portfolio
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AUM</span>
                  <span className="text-sm font-medium">{investor.metrics.aum}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Investment</span>
                  <span className="text-sm font-medium">{investor.metrics.averageInvestment}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Portfolio Size</span>
                  <span className="text-sm font-medium">{investor.metrics.currentPortfolioSize} companies</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Successful Exits</span>
                  <span className="text-sm font-medium">{investor.metrics.successfulExits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Return Rate</span>
                  <span className="text-sm font-medium">{investor.metrics.returnRate}</span>
                </div>
              </div>
            </div>
            
            {/* Investment Focus */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h4 className="text-base font-semibold mb-3">Sector Focus</h4>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {investor.sectors.map((sector, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {sector}
                  </span>
                ))}
              </div>
              
              <h5 className="text-sm font-medium mb-2">Stage Preference</h5>
              <div className="flex flex-wrap gap-2 mb-2">
                {investor.investmentCriteria.stagePreference.map((stage, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                    {stage}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Recent Portfolio Additions */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-base font-semibold">Recent Investments</h4>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {investor.portfolio.slice(0, 2).map((company, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                    onClick={() => navigate(`/startups/${company.name.toLowerCase()}`)}
                  >
                    <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-gray-500">{company.sector} • {company.stage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InvestorProfile;