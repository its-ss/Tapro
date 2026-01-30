import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiRequest } from '../config/api';

import {
  FiEdit2,
  FiUser,
  FiSettings,
  FiBriefcase,
  FiBell,
  FiSliders,
  FiSave,
  FiX,
  FiPlus,
  FiLock
} from 'react-icons/fi';

const ProfileManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, logout } = useAuth();
  const loggedInUserId = currentUser?.id;
  
  // States will be populated by the API calls
  const [userData, setUserData] = useState(null);
  const [userStartups, setUserStartups] = useState([]);

 // Form data for editing
  const [formData, setFormData] = useState(null);
  const [startupFormData, setStartupFormData] = useState(null);
  const [editingStartupId, setEditingStartupId] = useState(null);

  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

 // --- FETCH DATA on component load ---
  useEffect(() => {
    if (!loggedInUserId) {
      navigate('/login'); // Redirect if not logged in
      return;
    }
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile and user startups at the same time
        const [userResponse, startupsResponse] = await Promise.all([
          apiRequest(API_ENDPOINTS.users(loggedInUserId)),
          apiRequest(API_ENDPOINTS.userStartups(loggedInUserId))
        ]);

        if (!userResponse.ok || !startupsResponse.ok) {
          throw new Error('Failed to fetch initial page data.');
        }

        const userData = await userResponse.json();
        const startupsData = await startupsResponse.json();

        setUserData(userData);
        setUserStartups(startupsData);
        setFormData(userData); // Pre-fill form data

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };


    fetchAllData();
  }, [loggedInUserId, navigate]);


// --- SAVE PROFILE ---
  const handleSaveProfile = async () => {
    if (!formData) return;
    try {
      const response = await apiRequest(API_ENDPOINTS.users(loggedInUserId), {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save profile.');
      
      const result = await response.json();
      console.log(result.message); // e.g., "Profile updated successfully"

      // Update local state with saved data and exit edit mode
      setUserData(formData);
      setEditing(false);

    } catch (err) {
      console.error("Save profile error:", err);
      alert(err.message); // Show error to the user
    }
  };

  // --- SAVE STARTUP ---
  const handleStartupSave = async () => {
    if (!startupFormData || !editingStartupId) return;

    try {
      const response = await apiRequest(API_ENDPOINTS.startups(editingStartupId), {
        method: 'PUT',
        body: JSON.stringify(startupFormData),
      });

      if (!response.ok) throw new Error('Failed to save startup.');

      // Update the list of startups in the local state
      setUserStartups(prev => 
        prev.map(startup => 
          startup.id === editingStartupId ? { ...startupFormData } : startup
        )
      );
      
      // Reset editing state
      setStartupFormData(null);
      setEditingStartupId(null);

    } catch (err) {
      console.error("Save startup error:", err);
      alert(err.message);
    }
  };

  
  // Mock settings data
  const [settingsData, setSettingsData] = useState({
    notifications: {
      messages: true,
      mentions: true,
      follows: true,
      startup_updates: true,
      investment_opportunities: true
    },
    preferences: {
      emailDigest: 'weekly',
      theme: 'light',
      language: 'english',
      privacy: 'public'
    }
  });




  useEffect(() => {
    // Reset form data when editing is toggled
    if (editing) {
      setFormData({...userData});
    }
  }, [editing, userData]);

  const handleStartupEdit = (startupId) => {
    const startupToEdit = userStartups.find(s => s.id === startupId);
    setStartupFormData({...startupToEdit});
    setEditingStartupId(startupId);
  };

 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStartupInputChange = (e) => {
    const { name, value } = e.target;
    setStartupFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('User signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await apiRequest(API_ENDPOINTS.auth.changePassword, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    }
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

  if (loading) {
    return <div>Loading your profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!userData) {
    // This can happen if the fetch completes but there's no data
    return <div>Could not load user profile.</div>
  }
  
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
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role/Title</label>
                <input 
                  type="text" 
                  name="role" 
                  value={formData.role} 
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
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
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
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <input 
                  type="text" 
                  name="linkedin" 
                  value={formData.linkedin} 
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded text-sm"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm h-24"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Interests (comma separated)</label>
              <input
                type="text"
                name="interests"
                value={(formData.interests || []).join(', ')}
                onChange={(e) => {
                  const interestsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                  setFormData({...formData, interests: interestsArray});
                }}
                className="w-full border px-3 py-2 rounded text-sm"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                value={(formData.skills || []).join(', ')}
                onChange={(e) => {
                  const skillsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                  setFormData({...formData, skills: skillsArray});
                }}
                className="w-full border px-3 py-2 rounded text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">What are you looking for?</label>
              <select
                name="lookingFor"
                value={formData.lookingFor || ''}
                onChange={handleInputChange}
                className="w-full border px-3 py-2 rounded text-sm"
              >
                <option value="">Select</option>
                <option value="Networking">Networking</option>
                <option value="Investment">Investment</option>
                <option value="Co-founder">Finding a Co-founder</option>
                <option value="Job">Job Opportunities</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Partnership">Business Partnerships</option>
              </select>
            </div>

            {/* Work Experience Section */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold">Work Experience</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newExp = { title: '', company: '', duration: '', description: '' };
                    setFormData({...formData, workExperience: [...(formData.workExperience || []), newExp]});
                  }}
                  className="text-xs flex items-center gap-1 text-blue-600"
                >
                  <FiPlus size={14} /> Add
                </button>
              </div>
              {(formData.workExperience || []).map((exp, index) => (
                <div key={index} className="mb-3 p-3 bg-gray-50 rounded relative">
                  {(formData.workExperience || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.workExperience.filter((_, i) => i !== index);
                        setFormData({...formData, workExperience: updated});
                      }}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.title || ''}
                      onChange={(e) => {
                        const updated = [...formData.workExperience];
                        updated[index] = {...updated[index], title: e.target.value};
                        setFormData({...formData, workExperience: updated});
                      }}
                      className="border px-2 py-1 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company || ''}
                      onChange={(e) => {
                        const updated = [...formData.workExperience];
                        updated[index] = {...updated[index], company: e.target.value};
                        setFormData({...formData, workExperience: updated});
                      }}
                      className="border px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g., 2020 - Present)"
                    value={exp.duration || ''}
                    onChange={(e) => {
                      const updated = [...formData.workExperience];
                      updated[index] = {...updated[index], duration: e.target.value};
                      setFormData({...formData, workExperience: updated});
                    }}
                    className="w-full border px-2 py-1 rounded text-sm mb-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={exp.description || ''}
                    onChange={(e) => {
                      const updated = [...formData.workExperience];
                      updated[index] = {...updated[index], description: e.target.value};
                      setFormData({...formData, workExperience: updated});
                    }}
                    className="w-full border px-2 py-1 rounded text-sm"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold">Education</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newEdu = { degree: '', institution: '', year: '' };
                    setFormData({...formData, education: [...(formData.education || []), newEdu]});
                  }}
                  className="text-xs flex items-center gap-1 text-blue-600"
                >
                  <FiPlus size={14} /> Add
                </button>
              </div>
              {(formData.education || []).map((edu, index) => (
                <div key={index} className="mb-3 p-3 bg-gray-50 rounded relative">
                  {(formData.education || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.education.filter((_, i) => i !== index);
                        setFormData({...formData, education: updated});
                      }}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[index] = {...updated[index], degree: e.target.value};
                        setFormData({...formData, education: updated});
                      }}
                      className="border px-2 py-1 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={edu.year || ''}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[index] = {...updated[index], year: e.target.value};
                        setFormData({...formData, education: updated});
                      }}
                      className="border px-2 py-1 rounded text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const updated = [...formData.education];
                      updated[index] = {...updated[index], institution: e.target.value};
                      setFormData({...formData, education: updated});
                    }}
                    className="w-full border px-2 py-1 rounded text-sm"
                  />
                </div>
              ))}
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
                src="/assets/user.jpeg" 
                alt="User" 
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-sm text-gray-600">{userData.role}</p>
                <p className="text-sm text-gray-500 mt-1">{userData.location}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(userData.interests || []).map((interest, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-2">About</h4>
              <p className="text-sm text-gray-600">{userData.bio}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Contact</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-gray-600">Email: {userData.email}</li>
                  <li className="text-gray-600">Website: {userData.website}</li>
                  <li className="text-gray-600">LinkedIn: {userData.linkedin}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(userData.skills || []).map((skill, i) => (
                    <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
            {(userData.workExperience || []).length > 0 ? (
              (userData.workExperience || []).map((job, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-semibold">{job.title}</h4>
                    <span className="text-xs text-gray-500">{job.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No work experience added yet.</p>
            )}
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Education</h3>
            {(userData.education || []).length > 0 ? (
              (userData.education || []).map((edu, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <h4 className="text-sm font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No education added yet.</p>
            )}
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
              <option value="connections">Connections Only</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="bg-black text-white px-4 py-2 rounded text-sm flex items-center gap-2"
        >
          <FiLock size={14} /> Change Password
        </button>

        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 text-red-600">Logout</h4>
          <button onClick={handleLogout}
        className="border border-red-500 text-red-600 px-4 py-2 rounded text-sm hover:bg-red-50 transition mb-4"      >
        Log Out
      </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
                setPasswordSuccess(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}>
                <FiX size={20} />
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
                Password changed successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full border px-3 py-2 rounded text-sm"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full border px-3 py-2 rounded text-sm"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full border px-3 py-2 rounded text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-black text-white rounded text-sm"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStartupsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Startups</h3>
        <button 
          onClick={() => navigate('/list-startup')}
          className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded text-sm"
        >
          <FiPlus /> Add New Startup
        </button>
      </div>
      
      {userStartups.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">You haven't listed any startups yet.</p>
          <button 
            onClick={() => navigate('/list-startup')}
            className="mt-4 bg-black text-white px-4 py-2 rounded text-sm"
          >
            List Your First Startup
          </button>
        </div>
      ) : (
        userStartups.map(startup => (
          <div key={startup.id} className="bg-white p-6 rounded shadow">
            {editingStartupId === startup.id ? (
              // Edit mode for startup
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Edit Startup</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setStartupFormData(null);
                        setEditingStartupId(null);
                      }} 
                      className="flex items-center gap-1 px-3 py-1 border rounded text-sm"
                    >
                      <FiX /> Cancel
                    </button>
                    <button 
                      onClick={handleStartupSave} 
                      className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded text-sm"
                    >
                      <FiSave /> Save Changes
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={startupFormData.name} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tagline</label>
                    <input 
                      type="text" 
                      name="tagline" 
                      value={startupFormData.tagline} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <input 
                      type="text" 
                      name="industry" 
                      value={startupFormData.industry} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Stage</label>
                    <select 
                      name="stage" 
                      value={startupFormData.stage} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    >
                      <option value="Pre-seed">Pre-seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Series C+">Series C+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Founded Year</label>
                    <input 
                      type="text" 
                      name="founded" 
                      value={startupFormData.founded} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    <input 
                      type="text" 
                      name="website" 
                      value={startupFormData.website} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Monthly Revenue</label>
                    <input 
                      type="text" 
                      name="revenue" 
                      value={startupFormData.revenue} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Team Size</label>
                    <input 
                      type="text" 
                      name="employees" 
                      value={startupFormData.employees} 
                      onChange={handleStartupInputChange}
                      className="w-full border px-3 py-2 rounded text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    name="description" 
                    value={startupFormData.description} 
                    onChange={handleStartupInputChange}
                    className="w-full border px-3 py-2 rounded text-sm h-24"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Active Status</label>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={startupFormData.isActive} 
                      onChange={(e) => setStartupFormData({...startupFormData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm">This startup is currently active and seeking investment</label>
                  </div>
                </div>
              </div>
            ) : (
              // View mode for startup
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <img 
                      src={startup.logo} 
                      alt={startup.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{startup.name}</h3>
                      <p className="text-sm text-gray-600">{startup.tagline}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{startup.industry}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{startup.stage}</span>
                        <span className={`px-2 py-1 rounded text-xs ${startup.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {startup.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartupEdit(startup.id)} 
                      className="flex items-center gap-1 px-3 py-1 border rounded text-sm"
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      onClick={() => navigate(`/startups/${startup.name.toLowerCase()}`)}
                      className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <h4 className="text-sm font-semibold">Founded</h4>
                    <p className="text-sm text-gray-600">{startup.founded}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold">Monthly Revenue</h4>
                    <p className="text-sm text-gray-600">{startup.revenue}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold">Team Size</h4>
                    <p className="text-sm text-gray-600">{startup.employees}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{startup.description}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Website</h4>
                  <a href={`https://${startup.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">
                    {startup.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col">
      <Header active="Profile" />
      
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Account Management</h1>
        
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
          
          <button
            onClick={() => setActiveTab('startups')}
            className={`px-6 py-3 font-medium flex items-center gap-2 ${
              activeTab === 'startups' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500'
            }`}
          >
            <FiBriefcase /> My Startups
          </button>
        </div>
        
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'startups' && renderStartupsTab()}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileManagementPage;