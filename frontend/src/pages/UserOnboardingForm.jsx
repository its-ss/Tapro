import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiArrowRight, FiCheck, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, apiRequest } from '../config/api';

const UserOnboardingForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    bio: '',
    createdAt: '',
    currentSkill: '',
    education: [{ degree: '', institution: '', year: '' }],
    email: '',
    followers: [''],
    following: [''],
    fullName: '',
    interests: [],
    isStartupListed: false,
    linkedinLink: '',
    location: '',
    lookingFor: '',
    post: [{
      commentsCount: '',
      content: '',
      createdAt: '',
      id: '',
      likes: '',
      shareCount: '',
      tag: '',
      profileImage: '',
      role: ''
    }],
    profileImage: '',
    role: '',
    savedInvestors: [''],
    savedPost: [''],
    savedPosts: [''],
    savedStartups: [''],
    skills: [],
    startupID: '',
    userOnboard: [{
      completed: true
    }],
    userType: 'user',
    websiteLink: '',
    workExperience: [{ title: '', company: '', duration: '', description: '' }]
  });

  const { currentUser, updateUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.fullName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);



  const roleOptions = [
    'Founder',
    'Investor',
    'Product Manager',
    'Developer',
    'Designer',
    'Marketing',
    'Business Development',
    'Student',
    'Other'
  ];

  const interestOptions = [
    'Fintech',
    'SaaS',
    'AI',
    'Healthtech',
    'Edtech',
    'E-commerce',
    'Hardware',
    'Web3',
    'Climate Tech',
    'Marketplace'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    setFormData(prev => ({ ...prev, education: updatedEducation }));
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedWorkExperience = [...formData.workExperience];
    updatedWorkExperience[index][field] = value;
    setFormData(prev => ({ ...prev, workExperience: updatedWorkExperience }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { title: '', company: '', duration: '', description: '' }]
    }));
  };

  const removeWorkExperience = (index) => {
    if (formData.workExperience.length > 1) {
      setFormData(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter((_, i) => i !== index)
      }));
    }
  };

  const addSkill = () => {
    if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: ''
      }));
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const toggleInterest = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

const handleSubmit = async () => {
    try {
      if (!currentUser) throw new Error("User not authenticated");

      const payload = {
        ...formData,
        websiteLink: formData.website?.trim() || '',
        linkedinLink: formData.linkedin?.trim() || ''
      };

      const response = await apiRequest(API_ENDPOINTS.userOnboarding(currentUser.id), {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to save onboarding data');
      }

      // Update user in context to mark as onboarded
      updateUser({ isOnboarded: true });

      navigate('/explore');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form.');
    }
  };



  const renderBasicInfo = () => (
    <>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">I am a...</label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((role, index) => (
            <button
              key={index}
              type="button"
              className={`px-3 py-2 border rounded-md text-sm ${
                formData.role === role ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, role }))}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Where are you based?</label>
        <input
          type="text"
          name="location"
          placeholder="City, Country"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">What are you interested in?</label>
        <p className="text-xs text-gray-500 mb-2">Select up to 5 interests</p>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest, index) => (
            <button
              key={index}
              type="button"
              disabled={formData.interests.length >= 5 && !formData.interests.includes(interest)}
              className={`px-3 py-1 border rounded-full text-xs ${
                formData.interests.includes(interest)
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:bg-gray-50'
              } ${formData.interests.length >= 5 && !formData.interests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Tell us about yourself</label>
        <textarea
          name="bio"
          placeholder="Share a brief description about your background, experience, and what you're working on..."
          value={formData.bio}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>
    </>
  );

  const renderWorkEducation = () => (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-semibold">Work Experience</label>
          <button
            type="button"
            onClick={addWorkExperience}
            className="text-xs flex items-center gap-1 text-blue-600"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
        
        {formData.workExperience.map((exp, index) => (
          <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md relative">
            {formData.workExperience.length > 1 && (
              <button
                type="button"
                onClick={() => removeWorkExperience(index)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <FiX size={16} />
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Job Title</label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => handleWorkExperienceChange(index, 'title', e.target.value)}
                  placeholder="e.g. Product Manager"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleWorkExperienceChange(index, 'company', e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Duration</label>
              <input
                type="text"
                value={exp.duration}
                onChange={(e) => handleWorkExperienceChange(index, 'duration', e.target.value)}
                placeholder="e.g. 2020 - Present"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => handleWorkExperienceChange(index, 'description', e.target.value)}
                placeholder="Briefly describe your responsibilities and achievements..."
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-semibold">Education</label>
          <button
            type="button"
            onClick={addEducation}
            className="text-xs flex items-center gap-1 text-blue-600"
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
        
        {formData.education.map((edu, index) => (
          <div key={index} className="mb-3 p-4 bg-gray-50 rounded-md relative">
            {formData.education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <FiX size={16} />
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  placeholder="e.g. B.Tech in Computer Science"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <input
                  type="text"
                  value={edu.year}
                  onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                placeholder="e.g. Harvard University"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderSkillsConnections = () => (
    <>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Skills & Expertise</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            name="currentSkill"
            placeholder="Add a skill (e.g., Product Strategy, Growth Hacking)"
            value={formData.currentSkill}
            onChange={handleChange}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addSkill}
            disabled={!formData.currentSkill.trim()}
            className="bg-black text-white px-3 py-2 rounded-md disabled:opacity-50"
          >
            <FiPlus size={16} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.skills.map((skill, index) => (
            <span key={index} className="bg-gray-100 text-xs px-3 py-1 rounded-full flex items-center">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
          {formData.skills.length === 0 && (
            <p className="text-gray-400 text-xs italic">Add skills to showcase your expertise</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">What are you looking for on Tapro?</label>
        <select
          name="lookingFor"
          value={formData.lookingFor}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="Explorer">Select</option>
          <option value="Networking">Networking</option>
          <option value="Investment">Investment</option>
          <option value="Co-founder">Finding a Co-founder</option>
          <option value="Job">Job Opportunities</option>
          <option value="Mentorship">Mentorship</option>
          <option value="Partnership">Business Partnerships</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2">Social & Contact Info</label>
        
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Website (optional)</label>
          <input
            type="text"
            name="website"
            placeholder="e.g., yourwebsite.com"
            value={formData.website}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">LinkedIn (optional)</label>
          <input
            type="text"
            name="linkedin"
            placeholder="e.g., linkedin.com/in/yourprofile"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderWorkEducation();
      case 2:
        return renderSkillsConnections();
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['Basic Info', 'Experience', 'Skills & Connections'];
    
    return (
      <div className="mb-8">
        <div className="flex justify-between">
          {steps.map((title, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index <= step ? 'text-black' : 'text-gray-400'}`}
              style={{ width: `${100 / steps.length}%` }}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 mb-2 ${
                  index < step ? 'bg-black text-white border-black' : 
                  index === step ? 'border-black text-black' :
                  'border-gray-300 text-gray-400'
                }`}
              >
                {index < step ? <FiCheck size={16} /> : index + 1}
              </div>
              <span className="text-xs text-center">{title}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-1 bg-black rounded-full transition-all duration-300" 
            style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F5F5EE] min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <p className="text-gray-500 mt-2">
              Help us personalize your experience and connect you with the right opportunities
            </p>
          </div>
          
          {renderStepIndicator()}
          
          <form>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Back
                </button>
              ) : (
                <div></div> // Empty div to maintain layout
              )}
              
              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev + 1)}
                  className="px-6 py-2 bg-black text-white rounded-md flex items-center gap-2"
                >
                  Continue <FiArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-black text-white rounded-md"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserOnboardingForm;