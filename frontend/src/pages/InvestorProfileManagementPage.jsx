import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { 
  FiEdit2, 
  FiUser, 
  FiSettings, 
  FiDollarSign,
  FiBell, 
  FiSliders, 
  FiSave, 
  FiX
} from 'react-icons/fi';

const InvestorProfileManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  
  // Mock investor data - in a real app, this would come from your auth system/backend
  const [investorData, setInvestorData] = useState({
    fullName: 'Warren Buffett',
    email: 'warren@techventures.com',
    phone: '+1 (555) 123-4567',
    location: 'New York',
    dob: '1990-08-30',
    website: 'techventures.capital',
    linkedinProfile: 'linkedin.com/in/warrenbuffett',
    about: 'Warren is a globally renowned angel investor and Managing Partner at Tech Ventures Capital. He has a passion for empowering founders and unlocking new markets with capital, mentorship, and strategy.',
    valueAdd: 'I provide strategic guidance, mentorship, and access to my extensive network of industry professionals. I help startups refine their business models, navigate market challenges, and scale efficiently.',
    investorType: 'Angel',
    preference: 'Fintech, SaaS',
    experience: '10+',
    assets: '50+',
    accredited: 'Yes',
    investments: 'Early-stage startups with global potential',
    requirements: 'Looking for innovative startups with strong founding teams, clear market fit, and scalable business models. Prefer B2B SaaS and fintech solutions with some traction and revenue.',
    // Financial information
    investmentType: 'Series A',
    timeline: '3-6 months',
    investmentAmount: '500000',
    avgInvestment: '$100,000 - $500,000',
    portfolioValue: '$500M',
    yearlyInvestments: '5-10',
    activeInvestment: '3'
  });

  // Mock settings data
  const [settingsData, setSettingsData] = useState({
    notifications: {
      messages: true,
      mentions: true,
      follows: true,
      startup_updates: true,
      investment_opportunities: true,
      portfolio_changes: true,
      funding_rounds: true
    },
    preferences: {
      emailDigest: 'weekly',
      theme: 'light',
      language: 'english',
      privacy: 'public',
      dealFlow: 'all',
      minInvestment: '$50,000',
      maxInvestment: '$1,000,000'
    }
  });

  // Form data for editing
  const [formData, setFormData] = useState({...investorData});

  useEffect(() => {
    // Reset form data when editing is toggled
    if (editing) {
      setFormData({...investorData});
    }
  }, [editing, investorData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    setInvestorData(formData);
    setEditing(false);
  };

  const handleSettingsChange = (settingType, settingName, value) => {
    setSettingsData(prev => ({
      ...prev,
      [settingType]: {
        ...prev[settingType],
        [settingName]: value
      }
    }));
  };

  const renderProfileTab = () => (
    <div className="space-y-4">
      {editing ? (
        // Edit mode
        <>
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditing(false)} 
                  className="flex items-center gap-1 px-3 py-1 border rounded text-sm"
                >
                  <FiX /> Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded text-sm"
                >
                  <FiSave /> Save Changes
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Business Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input 
                  type="text" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
                <input 
                  type="text" 
                  name="linkedinProfile" 
                  value={formData.linkedinProfile} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type of Investor</label>
                <select
                  name="investorType"
                  value={formData.investorType}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                >
                  <option value="Angel">Angel</option>
                  <option value="Venture Capitalist">Venture Capitalist</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Industry Preference</label>
                <input 
                  type="text" 
                  name="preference" 
                  value={formData.preference} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <input 
                  type="text" 
                  name="experience" 
                  value={formData.experience} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Number of Investments</label>
                <input 
                  type="text" 
                  name="assets" 
                  value={formData.assets} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">About</label>
              <textarea 
                name="about" 
                value={formData.about} 
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm h-24"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Value Add</label>
              <textarea 
                name="valueAdd" 
                value={formData.valueAdd} 
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm h-24"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Investment Requirements</label>
              <textarea 
                name="requirements" 
                value={formData.requirements} 
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm h-24"
              />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Investment Type</label>
                <select
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                >
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C+">Series C+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Investment Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                >
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Are you an accredited investor?</label>
                <select
                  name="accredited"
                  value={formData.accredited}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Investment Amount</label>
                <div className="flex items-center border px-3 py-2 rounded text-sm">
                  <span className="mr-2">₹</span>
                  <input
                    type="number"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleInputChange}
                    className="w-full border-0 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Average Investment</label>
                <input
                  type="text"
                  name="avgInvestment"
                  value={formData.avgInvestment}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio Value</label>
                <input
                  type="text"
                  name="portfolioValue"
                  value={formData.portfolioValue}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Yearly Investments</label>
                <input
                  type="text"
                  name="yearlyInvestments"
                  value={formData.yearlyInvestments}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Active Investments</label>
                <input
                  type="text"
                  name="activeInvestment"
                  value={formData.activeInvestment}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        // View mode
        <>
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              <button 
                onClick={() => setEditing(true)} 
                className="flex items-center gap-1 px-3 py-1 border rounded text-sm"
              >
                <FiEdit2 /> Edit Profile
              </button>
            </div>
            
            <div className="flex gap-4 items-start mb-6">
              <img 
                src="/assets/Warren_Buffett.jpg" 
                alt="Investor" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold">{investorData.fullName}</h2>
                <p className="text-sm text-gray-600">Managing Partner at Tech Ventures Capital</p>
                <p className="text-sm text-gray-500 mt-1">{investorData.location}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {investorData.investorType} Investor
                  </span>
                  {investorData.preference.split(',').map((pref, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {pref.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">About</h4>
              <p className="text-sm text-gray-600">{investorData.about}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Contact</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600">Email: {investorData.email}</li>
                  <li className="text-gray-600">Phone: {investorData.phone}</li>
                  <li className="text-gray-600">Website: {investorData.website}</li>
                  <li className="text-gray-600">LinkedIn: {investorData.linkedinProfile}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Investment Experience</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600">Experience: {investorData.experience} years</li>
                  <li className="text-gray-600">Investments: {investorData.assets}</li>
                  <li className="text-gray-600">Accredited: {investorData.accredited}</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Value Add</h4>
              <p className="text-sm text-gray-600">{investorData.valueAdd}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Investment Requirements</h4>
              <p className="text-sm text-gray-600">{investorData.requirements}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Investment Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Deal Flow</label>
            <select 
              value={settingsData.preferences.dealFlow}
              onChange={(e) => handleSettingsChange('preferences', 'dealFlow', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="all">All Deals</option>
              <option value="filtered">Filtered by My Preferences</option>
              <option value="recommended">Recommended Only</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Investment</label>
            <select 
              value={settingsData.preferences.minInvestment}
              onChange={(e) => handleSettingsChange('preferences', 'minInvestment', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="$10,000">$10,000</option>
              <option value="$25,000">$25,000</option>
              <option value="$50,000">$50,000</option>
              <option value="$100,000">$100,000</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Investment</label>
            <select 
              value={settingsData.preferences.maxInvestment}
              onChange={(e) => handleSettingsChange('preferences', 'maxInvestment', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="$500,000">$500,000</option>
              <option value="$1,000,000">$1,000,000</option>
              <option value="$5,000,000">$5,000,000</option>
              <option value="No Limit">No Limit</option>
            </select>
          </div>
        </div>
      </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Investment Type</h4>
                <p className="text-sm font-medium">{investorData.investmentType}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Timeline</h4>
                <p className="text-sm font-medium">{investorData.timeline}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Investment Amount</h4>
                <p className="text-sm font-medium">₹{Number(investorData.investmentAmount).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Average Investment</h4>
                <p className="text-sm font-medium">{investorData.avgInvestment}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Portfolio Value</h4>
                <p className="text-sm font-medium">{investorData.portfolioValue}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Yearly Investments</h4>
                <p className="text-sm font-medium">{investorData.yearlyInvestments}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="text-xs text-gray-500">Active Investments</h4>
                <p className="text-sm font-medium">{investorData.activeInvestment}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded text-center">
              <h4 className="text-xs text-gray-500">Total Investments</h4>
              <p className="text-sm font-medium">{investorData.assets}</p>
              </div>
          
              <div className="bg-gray-50 p-4 rounded text-center">
              <h4 className="text-xs text-gray-500">Assets Under Management</h4>
              <p className="text-sm font-medium">{investorData.portfolioValue}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        
        {Object.entries(settingsData.notifications).map(([key, value]) => {
          const label = key.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          return (
            <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={value} 
                  onChange={(e) => handleSettingsChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          );
        })}
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Account Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Digest</label>
            <select 
              value={settingsData.preferences.emailDigest}
              onChange={(e) => handleSettingsChange('preferences', 'emailDigest', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select 
              value={settingsData.preferences.theme}
              onChange={(e) => handleSettingsChange('preferences', 'theme', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select 
              value={settingsData.preferences.language}
              onChange={(e) => handleSettingsChange('preferences', 'language', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="spanish">Spanish</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Profile Privacy</label>
            <select 
              value={settingsData.preferences.privacy}
              onChange={(e) => handleSettingsChange('preferences', 'privacy', e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="founders">Founders Only</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        
        <button className="bg-black text-white px-4 py-2 rounded text-sm">
          Change Password
        </button>
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 text-red-600">Danger Zone</h4>
          <button className="border border-red-500 text-red-500 px-4 py-2 rounded text-sm">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  

  return (
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
      <Header active="Profile" />
      
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Investor Account Management</h1>
        
        <div className="flex mb-6 border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'profile' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500'
            }`}
          >
            <FiUser /> Profile
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'settings' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500'
            }`}
          >
            <FiSettings /> Settings
          </button>
          
        
        </div>
        
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>
      
      <Footer />
    </div>
  );
};

export default InvestorProfileManagement;