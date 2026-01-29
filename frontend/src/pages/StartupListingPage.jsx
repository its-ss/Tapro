import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { FiArrowRight, FiArrowLeft, FiTrash2, FiPlus, FiCheck, FiUpload, FiInfo } from 'react-icons/fi';
import { getAuth } from 'firebase/auth';
import { API_ENDPOINTS } from '../config/api';


// Memoized form components to prevent unnecessary re-renders
const FormInput = memo(({ label, name, type = "text", required = false, placeholder = "", value, onChange, error = null, ...props }) => (
  <div className="mb-4">
    <label className="text-sm font-semibold block mb-1" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-3 rounded text-base ${
        error ? 'border-red-500' : 'border-gray-300'
      } focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent`}
      {...props}
    />
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));



// Memoized select component
const FormSelect = memo(({ label, name, options, required = false, value, onChange, error = null, ...props }) => (
  <div className="mb-4">
    <label className="text-sm font-semibold block mb-1" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-3 rounded text-base ${
        error ? 'border-red-500' : 'border-gray-300'
      } focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent`}
      {...props}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map(option => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));

// Memoized textarea component
const FormTextArea = memo(({ label, name, required = false, placeholder = "", rows = 3, value, onChange, error = null }) => (
  <div className="mb-4">
    <label className="text-sm font-semibold block mb-1" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={`w-full border px-3 py-3 rounded text-base ${
        error ? 'border-red-500' : 'border-gray-300'
      } focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent`}
    />
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));

const StartupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  
  // Define isLast and isFirst here, before they are used
  const isLast = step === 4;
  const isFirst = step === 0;
  
  const [formData, setFormData] = useState({
  about: "",
arr: "",
awards: [""],
cac: "",
category: [""],
createdAt: "",
email: "",
followers: [""],
founderId: "",
fundingRound: "",
goal: "",
growth: "",
currentInvestor: "",
location: "",
logoUrl: "",
ltv: "",
password: "",
posts: [
  {
    comments: "",
    content: "",
    date: "",
    id: 1,
    likes: ""
  }
],
problem: "",
raised: "",
registrationYear: "",
revenue: "",
similarStartups: [""],
solution: "",
tagline: "",
currentTeam: "",
teamSize: "",
updatedAt: "",
userBase: "",
valuation: "",
verified: false,
website: "",
team: [""],
investors: [""],
startupName:""
});

useEffect(() => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    setFormData((prev) => ({
      ...prev,
      email: user.email || "",
      founderId: user.uid || ""  // ✅ Include UID
    }));
  }
}, []);


  const [errors, setErrors] = useState({});

  // Use useCallback to prevent the function from being recreated on every render
  const validateCurrentStep = useCallback(() => {
    let newErrors = {};
    let isValid = true;

    switch (step) {
      case 0:
        if (!formData.startupName) {
          newErrors.startupName = 'Startup name is required';
          isValid = false;
        }
        if (!formData.tagline) {
          newErrors.tagline = 'Tagline is required';
          isValid = false;
        }
        if (!formData.category) {
          newErrors.category = 'Category is required';
          isValid = false;
        }
        break;
      case 1:
        if (!formData.about) {
          newErrors.about = 'About section is required';
          isValid = false;
        }
        if (!formData.problem) {
          newErrors.problem = 'Problem statement is required';
          isValid = false;
        }
        if (!formData.solution) {
          newErrors.solution = 'Solution description is required';
          isValid = false;
        }
        if (!formData.email) {
          newErrors.email = 'Business email is required';
          isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
        break;
      // Other steps validation can be added as needed
    }

    setErrors(newErrors);
    return isValid;
  }, [step, formData]);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    
    if (name === 'logo' && files && files[0]) {
      setFormData((prev) => ({ ...prev, logo: files[0] }));
      
      // Create a preview URL for the logo
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleTeamInputChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, currentTeam: e.target.value }));
  }, []);

  const handleInvestorInputChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, currentInvestor: e.target.value }));
  }, []);

  const addToList = useCallback((field, item) => {
    if (item.trim()) {
      setFormData((prev) => {
        const newField = [...prev[field], item];
        const resetField = field === 'team' ? 'currentTeam' : 'currentInvestor';
        return {
          ...prev,
          [field]: newField,
          [resetField]: ''
        };
      });
    }
  }, []);

  const removeFromList = useCallback((field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

const handleSubmit = useCallback(async () => {
  try {
    const response = await fetch(API_ENDPOINTS.startupSubmit, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    if (response.ok) {
      alert("Your startup has been successfully listed!");
      navigate("/explore");
    } else {
      alert("Submission failed: " + result.message);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("An error occurred while submitting the form.");
  }
}, [formData, navigate]);

  const handleNext = useCallback(() => {
    setShowErrors(true);
    
    if (validateCurrentStep()) {
      if (isLast) {
        handleSubmit();
      } else {
        setStep(prevStep => prevStep + 1);
        setShowErrors(false);
      }
    }
  }, [validateCurrentStep, isLast, handleSubmit]);

  const handlePrevious = useCallback(() => {
    setStep(prevStep => Math.max(0, prevStep - 1));
    setShowErrors(false);
  }, []);

  // Reset errors when step changes
  useEffect(() => {
    setErrors({});
    setShowErrors(false);
  }, [step]);

  const stepTitles = [
    "Basic Information",
    "About Your Startup",
    "Traction & Funding",
    "Key Metrics",
    "Team & Investors"
  ];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <FormInput 
              label="Startup Name" 
              name="startupName" 
              value={formData.startupName} 
              onChange={handleChange} 
              required 
              placeholder="e.g., TechFlow AI"
              error={showErrors ? errors.name : null}
            />
            <FormInput 
              label="Tagline" 
              name="tagline" 
              value={formData.tagline} 
              onChange={handleChange} 
              required 
              placeholder="e.g., AI-powered workflow automation"
              error={showErrors ? errors.tagline : null}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="Registration Year" 
                name="registrationYear" 
                value={formData.registrationYear} 
                onChange={handleChange} 
                placeholder="e.g., 2023"
                error={showErrors ? errors.registrationYear : null}
              />
              <FormInput 
                label="Location" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="e.g., New York, USA"
                error={showErrors ? errors.location : null}
              />
            </div>
            <FormSelect
              label="Sector / Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              error={showErrors ? errors.category : null}
              options={[
                "SaaS",
                "AI",
                "Fintech",
                "Healthcare",
                "Edtech",
                "E-commerce",
                "Climate Tech",
                "Hardware",
                "Marketplace",
                "Consumer",
                "Enterprise",
                "Other"
              ]}
            />
            <div className="mb-6">
              <label className="text-sm font-semibold block mb-1">Upload Logo</label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden"
                >
                  {previewLogo ? (
                    <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <FiUpload className="text-gray-400" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    name="logo"
                    id="logo-upload"
                    onChange={handleChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded inline-block hover:bg-gray-200 transition"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, 512x512px
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <FormTextArea
              label="About Us"
              name="about"
              value={formData.about}
              onChange={handleChange}
              required
              placeholder="Describe your startup in a few sentences"
              error={showErrors ? errors.about : null}
            />
            
            <FormTextArea
              label="Problem"
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              required
              placeholder="What problem does your startup solve?"
              error={showErrors ? errors.problem : null}
            />
            
            <FormTextArea
              label="Solution"
              name="solution"
              value={formData.solution}
              onChange={handleChange}
              required
              placeholder="How does your product or service solve this problem?"
              error={showErrors ? errors.solution : null}
            />
            
            <FormInput
              label="Website Link"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="e.g., https://example.com"
              error={showErrors ? errors.website : null}
            />
            
            <FormInput
              label="Business Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g., contact@example.com"
              error={showErrors ? errors.email : null}
            />
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Monthly Revenue"
                name="revenue"
                value={formData.revenue}
                onChange={handleChange}
                placeholder="e.g., $10,000"
                error={showErrors ? errors.revenue : null}
              />
              
              <FormInput
                label="Active Users"
                name="users"
                value={formData.users}
                onChange={handleChange}
                placeholder="e.g., 1,000"
                error={showErrors ? errors.users : null}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Raised Amount"
                name="raised"
                value={formData.raised}
                onChange={handleChange}
                placeholder="e.g., $500,000"
                error={showErrors ? errors.raised : null}
              />
              
              <FormInput
                label="Goal Amount"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="e.g., $2,000,000"
                error={showErrors ? errors.goal : null}
              />
            </div>
            
            <FormSelect
              label="Funding Round"
              name="fundingRound"
              value={formData.fundingRound}
              onChange={handleChange}
              error={showErrors ? errors.fundingRound : null}
              options={[
                "Pre-seed",
                "Seed",
                "Series A",
                "Series B",
                "Series C+",
                "Bootstrapped"
              ]}
            />
            
            <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <FiInfo className="text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Why this information matters</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Sharing accurate traction and funding information helps investors gauge your 
                    startup's current stage and potential. This information is only shown to 
                    verified investors.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Annual Recurring Revenue"
                name="arr"
                value={formData.arr}
                onChange={handleChange}
                placeholder="e.g., $120,000"
                error={showErrors ? errors.arr : null}
              />
              
              <FormInput
                label="Monthly Growth"
                name="growth"
                value={formData.growth}
                onChange={handleChange}
                placeholder="e.g., 15%"
                error={showErrors ? errors.growth : null}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Customer Acquisition Cost"
                name="cac"
                value={formData.cac}
                onChange={handleChange}
                placeholder="e.g., $50"
                error={showErrors ? errors.cac : null}
              />
              
              <FormInput
                label="Lifetime Value"
                name="ltv"
                value={formData.ltv}
                onChange={handleChange}
                placeholder="e.g., $500"
                error={showErrors ? errors.ltv : null}
              />
            </div>
            
            <FormSelect
              label="Team Size"
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              error={showErrors ? errors.teamSize : null}
              options={[
                "1-5",
                "6-10",
                "11-20",
                "21-50",
                "50+"
              ]}
            />
            
            <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <FiInfo className="text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Private information</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    These key metrics are only shown to investors who express interest in your startup
                    and after you approve their request. They help investors understand your business
                    model and unit economics.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h4 className="text-sm font-semibold mb-2">Team Members</h4>
            <div className="mb-6">
              <div className="flex gap-2 mb-2">
                <input
                  id="currentTeam"
                  type="text"
                  className="flex-1 border border-gray-300 px-4 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={formData.currentTeam}
                  onChange={handleTeamInputChange}
                  placeholder="Add team member name and role"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addToList('team', formData.currentTeam);
                  }}
                  className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition"
                  disabled={!formData.currentTeam.trim()}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Example: Jane Smith - CTO, John Doe - CEO
              </p>
              
              {formData.team.length > 0 ? (
                <ul className="text-sm text-gray-700 space-y-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
                  {formData.team.map((member, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="flex items-center">
                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-xs">
                          {i+1}
                        </span>
                        {member}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromList('team', i)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Remove team member"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 text-sm">No team members added yet</p>
                </div>
              )}
            </div>
            
            <h4 className="text-sm font-semibold mb-2">Existing Investors (if any)</h4>
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <input
                  id="currentInvestor"
                  type="text"
                  className="flex-1 border border-gray-300 px-4 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  value={formData.currentInvestor}
                  onChange={handleInvestorInputChange}
                  placeholder="Add investor name"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addToList('investors', formData.currentInvestor);
                  }}
                  className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition"
                  disabled={!formData.currentInvestor.trim()}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Example: TechStars, Y Combinator, Angel Investor Name
              </p>
              
              {formData.investors.length > 0 ? (
                <ul className="text-sm text-gray-700 space-y-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
                  {formData.investors.map((investor, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-2 rounded">
                      <span className="flex items-center">
                        <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-xs">
                          {i+1}
                        </span>
                        {investor}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromList('investors', i)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Remove investor"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 text-sm">No investors added yet</p>
                </div>
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#F5F5EE] min-h-screen flex flex-col">
      <Header active="List Startup" />
      <main className="flex-grow flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-lg shadow-md">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-center">Startup Listing</h2>
            <div className="flex items-center justify-center mt-2">
              <div className="h-1 w-16 bg-black rounded-full"></div>
            </div>
          </div>
          
          {/* Steps Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {stepTitles.map((title, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${index === step ? 'text-black' : 'text-gray-400'}`}
                  style={{ width: `${100 / stepTitles.length}%` }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 border-2 ${
                      index < step ? 'bg-black text-white border-black' : 
                      index === step ? 'border-black text-black' : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {index < step ? <FiCheck size={16} /> : index + 1}
                  </div>
                  <span className="text-xs text-center hidden md:block">
                    {title}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-4 hidden md:block">
              <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded-full"></div>
              <div 
                className="absolute top-0 left-0 h-1 bg-black rounded-full transition-all duration-300" 
                style={{ width: `${(step / (stepTitles.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Current Step Title */}
          <h3 className="text-lg font-medium mb-6">
            Step {step + 1}: {stepTitles[step]}
          </h3>
          
          {/* Form Fields */}
          <div className="mb-6">
            {renderStep()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handlePrevious}
              className={`px-4 py-2 border border-gray-300 rounded flex items-center gap-2 transition ${
                isFirst ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              disabled={isFirst}
            >
              <FiArrowLeft size={16} /> Previous
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-black text-white rounded flex items-center gap-2 hover:bg-gray-800 transition"
            >
              {isLast ? 'Submit' : 'Continue'} {!isLast && <FiArrowRight size={16} />}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StartupForm;