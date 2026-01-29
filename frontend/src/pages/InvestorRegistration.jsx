import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/HeaderTapro';
import Footer from '../components/Footer';
import { FiArrowRight, FiArrowLeft, FiCheck, FiInfo, FiDollarSign, FiUser, FiBriefcase, FiTarget, FiFileText, FiMapPin } from 'react-icons/fi';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 

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
      className={`w-full border px-3 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-black ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));

const FormSelect = memo(({ label, name, options, required = false, placeholder = "Select an option", value, onChange, error = null }) => (
  <div className="mb-4">
    <label className="text-sm font-semibold block mb-1" htmlFor={name}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full border px-3 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-black ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={typeof option === 'object' ? option.value : option}>
          {typeof option === 'object' ? option.label : option}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));

const FormTextArea = memo(({ label, name, required = false, rows = 4, placeholder = "", value, onChange, error = null }) => (
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
      className={`w-full border px-3 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-black ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    ></textarea>
    {error && (
      <p className="text-red-500 text-xs mt-1">{error}</p>
    )}
  </div>
));

const MultiSelectButtons = memo(({ options, selected, onChange, error }) => (
  <div className="mb-4">
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1 rounded-full text-sm border ${
            selected.includes(option)
              ? 'bg-black text-white border-black'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
));

const InvestorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  
  const [formData, setFormData] = useState({
  about: "",
  accredited: "",
  achienevemt: [""],
  activeInvestment: "",
  assets: "",
  availableForMentoring: false,
  avgInvestment: "",
  createdAt: "",
  email: "",
  followers: [''],
  following: [''],
  founderTestimonials: [
    {
      name: "",
      role: "",
      company: "",
      testimonial: "",
      image: ""
    }
  ],
  fullName: "",
  investmentAmount: "",
  investmentCriteria: {
    stagePreference: [],
    checkSize: "",
    geography: "",
    leadOrFollow: "",
    commitmentLevel: "",
    decisionTimeframe: ""
  },
  investmentPhilosophy: "",
  investmentType: [],
  investments: "",
investorId: "",
  investorType: "",
  linkedinProfile: "",
  location: "",
  metrics: {
    aum: "",
    experience: "",
    averageInvestment: "",
    successfulExits: "",
    currentPortfolioSize: "",
    returnRate: ""
  },
  phone: "",
  portfolio: [
    {
      name: "",
      stage: "",
      sector: "",
      year: ""
    }
  ],
  portfolioValue: "",
  posts: [
    {
      id: null,
      content: "",
      date: "",
      likes: 0,
      comments: 0,
      tag: ""
    }
  ],
  preference: [],
  profileImage: "",
  requirements: "",
  savedInvestors: [],
  savedPosts: [],
  savedStartups: [],
  timeline: "",
  title: "",
  valueAdd: "",
  verified: false,
  website: "",
  yearlyInvestments: ""
});

  // Multiple selection options
  const preferences = ['SaaS', 'AI', 'Fintech', 'Healthcare', 'Edtech', 'Web3', 'Climate Tech', 'Consumer', 'Enterprise', 'Hardware', 'Other'];
  const investmentTypes = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

  // Use useCallback to prevent the function from being recreated on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const toggleMultiSelect = useCallback((field, value) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
    
    // Clear error for this field when user makes a selection
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate the current step
  const validateStep = useCallback(() => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 0: // Personal Information
        if (!formData.fullName.trim()) {
          stepErrors.fullName = 'Full name is required';
          isValid = false;
        }
        if (!formData.phone.trim()) {
          stepErrors.phone = 'Phone number is required';
          isValid = false;
        }
        if (!formData.email.trim()) {
          stepErrors.email = 'Email is required';
          isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          stepErrors.email = 'Please enter a valid email address';
          isValid = false;
        }
        if (!formData.password) {
          stepErrors.password = 'Password is required';
          isValid = false;
        } else if (formData.password.length < 8) {
          stepErrors.password = 'Password must be at least 8 characters';
          isValid = false;
        }
        if (formData.password !== formData.confirmPassword) {
          stepErrors.confirmPassword = 'Passwords do not match';
          isValid = false;
        }
        break;
      
      case 1: // Investment Experience
        if (!formData.assets) {
          stepErrors.assets = 'Please select the number of investments';
          isValid = false;
        }
        if (formData.preference.length === 0) {
          stepErrors.preference = 'Please select at least one investment preference';
          isValid = false;
        }
        if (!formData.investorType) {
          stepErrors.investorType = 'Please select your investor type';
          isValid = false;
        }
        if (!formData.metrics.experience) {
          stepErrors.experience = 'Years of experience is required';
          isValid = false;
        }
        break;
      
      case 2: // Investment Details
        if (formData.investmentType.length === 0) {
          stepErrors.investmentType = 'Please select at least one investment type';
          isValid = false;
        }
        if (!formData.timeline) {
          stepErrors.timeline = 'Please select an investment timeline';
          isValid = false;
        }
        if (!formData.accredited) {
          stepErrors.accredited = 'Please indicate if you are an accredited investor';
          isValid = false;
        }
        if (!formData.investmentAmount) {
          stepErrors.investmentAmount = 'Investment amount is required';
          isValid = false;
        }
        break;
        
      // Further validations for other steps
    }

    setErrors(stepErrors);
    return isValid;
  }, [step, formData]);

  const handleNext = useCallback(() => {
    setShowErrors(true);
    
    if (validateStep()) {
      setStep(current => current + 1);
      setShowErrors(false);
      window.scrollTo(0, 0);
    }
  }, [validateStep]);

  const handlePrevious = useCallback(() => {
    setStep(current => Math.max(0, current - 1));
    setShowErrors(false);
  }, []);

const handleSubmit = useCallback(async () => {
  try {
    // Step 1: Register user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    const user = userCredential.user;

    // Step 2: Clean data before sending to backend (remove password)
    const { password, confirmPassword, ...cleanFormData } = formData;

    // Step 3: Add Firebase UID and timestamp
    const payload = {
      ...cleanFormData,
      investorId: user.uid,
      createdAt: new Date().toISOString()
    };

    // Step 4: Send to backend
    const response = await fetch("http://localhost:5000/api/investor/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Submission failed");
    }
    setStep(7);

  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred: " + error.message);
  }
}, [formData]);


  // Step titles for progress indicator
  const stepTitles = [
    "Account Information",
    "Investment Experience",
    "Investment Details",
    "Portfolio Information",
    "About You",
    "Contact Information",
    "Investment Criteria",
    "Completed"
  ];

  // Step icons for better visualization
  const stepIcons = [
    <FiUser key="user" />,
    <FiBriefcase key="briefcase" />,
    <FiDollarSign key="dollar" />,
    <FiTarget key="target" />,
    <FiFileText key="file" />,
    <FiMapPin key="map" />,
    <FiInfo key="info" />,
    <FiCheck key="check" />
  ];

  // Render the steps
  const renderStep = () => {
    switch (step) {
      case 0: // Personal Information
        return (
          <>
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
              <p className="text-sm text-blue-800">
                Create your investor account to connect with promising startups and explore investment opportunities.
              </p>
            </div>
            
            <FormInput 
              label="Full Name" 
              name="fullName" 
              required 
              placeholder="Your full name" 
              value={formData.fullName}
              onChange={handleChange}
              error={showErrors ? errors.fullName : null}
            />
            
            <FormInput 
              label="Phone Number" 
              name="phone" 
              required 
              placeholder="Your contact number" 
              value={formData.phone}
              onChange={handleChange}
              error={showErrors ? errors.phone : null}
            />
            
            <FormInput 
              label="Business Email" 
              name="email" 
              type="email" 
              required 
              placeholder="Your business email address" 
              value={formData.email}
              onChange={handleChange}
              error={showErrors ? errors.email : null}
            />
            
            <FormInput 
              label="Password" 
              name="password" 
              type="password" 
              required 
              placeholder="Create a password (min. 8 characters)" 
              value={formData.password}
              onChange={handleChange}
              error={showErrors ? errors.password : null}
            />
            
            <FormInput 
              label="Confirm Password" 
              name="confirmPassword" 
              type="password" 
              required 
              placeholder="Confirm your password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              error={showErrors ? errors.confirmPassword : null}
            />
          </>
        );
      
      case 1: // Investment Experience
        return (
          <>
            <FormSelect 
              label="Number of Previous Investments" 
              name="assets" 
              required 
              options={['1-5', '6-10', '11-20', '21-50', '50+']} 
              placeholder="Select number of investments"
              value={formData.assets}
              onChange={handleChange}
              error={showErrors ? errors.assets : null}
            />
            
            <div className="mb-4">
              <label className="text-sm font-semibold block mb-1">
                Investment Preferences <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Select the sectors you're interested in investing</p>
              <MultiSelectButtons 
                options={preferences} 
                selected={formData.preference} 
                onChange={(value) => toggleMultiSelect('preference', value)} 
                error={showErrors ? errors.preference : null}
              />
            </div>
            
            <FormSelect 
              label="Type of Investor" 
              name="investorType" 
              required 
              options={['Angel', 'Venture Capitalist', 'Corporate', 'Family Office', 'Other']} 
              placeholder="Select investor type"
              value={formData.investorType}
              onChange={handleChange}
              error={showErrors ? errors.investorType : null}
            />
            
            <FormInput 
  label="Years of Investment Experience" 
  name="metrics.experience" 
  required 
  placeholder="e.g., 5" 
  value={formData.metrics.experience}
  onChange={(e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        experience: value
      }
    }));
    if (errors.experience) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.experience;
        return newErrors;
      });
    }
  }}
  error={showErrors ? errors.experience : null}
/>

          </>
        );
      
      case 2: // Investment Details
        return (
          <>
            <div className="mb-4">
              <label className="text-sm font-semibold block mb-1">
                Investment Stage Interest <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Select all that apply</p>
              <MultiSelectButtons 
                options={investmentTypes} 
                selected={formData.investmentType} 
                onChange={(value) => toggleMultiSelect('investmentType', value)} 
                error={showErrors ? errors.investmentType : null}
              />
            </div>
          
            <FormSelect 
              label="Investment Timeline" 
              name="timeline" 
              required 
              options={['1-3 months', '3-6 months', '6-12 months', '12+ months']} 
              placeholder="Select investment timeline"
              value={formData.timeline}
              onChange={handleChange}
              error={showErrors ? errors.timeline : null}
            />
          
            <FormSelect 
              label="Are you an accredited investor?" 
              name="accredited" 
              required 
              options={['Yes', 'No']} 
              placeholder="Select option"
              value={formData.accredited}
              onChange={handleChange}
              error={showErrors ? errors.accredited : null}
            />
          
            <div className="mb-4">
              <label className="text-sm font-semibold block mb-1" htmlFor="investmentAmount">
                Investment Amount <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center border rounded text-base ${
                showErrors && errors.investmentAmount ? 'border-red-500' : 'border-gray-300'
              }`}>
                <span className="px-3 py-2 bg-gray-50 border-r">₹</span>
                <input
                  id="investmentAmount"
                  type="number"
                  name="investmentAmount"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 focus:outline-none"
                />
              </div>
              {showErrors && errors.investmentAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.investmentAmount}</p>
              )}
            </div>
          </>
        );
      
      case 3: // Portfolio Information
        return (
          <>
            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
              <p className="text-sm text-gray-700">
                This information helps startups understand your investment capacity and track record.
              </p>
            </div>
            
            <FormInput 
              label="Average Investment Size" 
              name="avgInvestment" 
              placeholder="e.g., ₹10,00,000" 
              value={formData.avgInvestment}
              onChange={handleChange}
              error={showErrors ? errors.avgInvestment : null}
            />
            
            <FormInput 
              label="Total Portfolio Value" 
              name="portfolioValue" 
              placeholder="e.g., ₹5,00,00,000" 
              value={formData.portfolioValue}
              onChange={handleChange}
              error={showErrors ? errors.portfolioValue : null}
            />
            
            <FormInput 
              label="Yearly Investment Budget" 
              name="yearlyInvestments" 
              placeholder="e.g., ₹50,00,000" 
              value={formData.yearlyInvestments}
              onChange={handleChange}
              error={showErrors ? errors.yearlyInvestments : null}
            />
            
            <FormInput 
              label="Number of Active Investments" 
              name="activeInvestment" 
              placeholder="e.g., 12" 
              value={formData.activeInvestment}
              onChange={handleChange}
              error={showErrors ? errors.activeInvestment : null}
            />
          </>
        );
      
      case 4: // About You
        return (
          <>
            <FormTextArea 
              label="About" 
              name="about" 
              required 
              rows={4} 
              placeholder="Share your background, experience, and investment philosophy"
              value={formData.about}
              onChange={handleChange}
              error={showErrors ? errors.about : null}
            />
            
            <FormTextArea 
              label="Value Add" 
              name="valueAdd" 
              rows={4} 
              placeholder="How do you help the startups you invest in? (e.g., mentorship, network, expertise)"
              value={formData.valueAdd}
              onChange={handleChange}
              error={showErrors ? errors.valueAdd : null}
            />
          </>
        );
      
      case 5: // Contact Information
        return (
          <>
            <FormInput 
              label="Location" 
              name="location" 
              required 
              placeholder="City, Country" 
              value={formData.location}
              onChange={handleChange}
              error={showErrors ? errors.location : null}
            />
            
            <FormInput 
              label="Website" 
              name="website" 
              placeholder="https://example.com (optional)" 
              value={formData.website}
              onChange={handleChange}
              error={showErrors ? errors.website : null}
            />
            
            <FormInput 
              label="LinkedIn Profile" 
              name="linkedinProfile" 
              placeholder="linkedin.com/in/yourprofile" 
              value={formData.linkedinProfile}
              onChange={handleChange}
              error={showErrors ? errors.linkedinProfile : null}
            />
          </>
        );
      
      case 6: // Investment Criteria
        return (
          <>
            <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
              <p className="text-sm text-gray-700">
                Define your investment criteria to help us connect you with the right startups.
              </p>
            </div>
            
            <FormTextArea 
              label="Investment Requirements" 
              name="requirements" 
              rows={6} 
              placeholder="Describe your specific investment criteria, deal size preferences, and what you look for in potential investments"
              value={formData.requirements}
              onChange={handleChange}
              error={showErrors ? errors.requirements : null}
            />
          </>
        );
      
      case 7: // Completion
        return (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank you for signing up!</h3>
            <p className="text-gray-600 mb-6">
              We're thrilled to have you on board and excited to connect you with innovative startups.
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              Explore Opportunities
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#F5F5EE] min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-lg shadow-md">
          {/* Progress Header */}
          {step < 7 && (
            <>
              <h2 className="text-2xl font-semibold text-center">Investor Registration</h2>
              <p className="text-gray-500 text-center mt-2 mb-6">
                Step {step + 1} of 7: {stepTitles[step]}
              </p>
            
              {/* Progress Bar */}
              <div className="mb-8 px-4">
                <div className="relative pt-8">
                  <div className="flex items-center justify-between mb-2">
                    {stepTitles.slice(0, 7).map((title, index) => (
                      <div 
                        key={index} 
                        className={`absolute top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          index < step ? 'bg-black text-white' : 
                          index === step ? 'bg-white text-black border-2 border-black' : 
                          'bg-gray-200 text-gray-500'
                        }`}
                        style={{ left: `calc(${(index / 6) * 100}% - ${index > 0 ? '16px' : '0px'})` }}
                      >
                        {stepIcons[index]}
                      </div>
                    ))}
                  </div>
                  <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                    <div 
                      className="h-full bg-black rounded-full transition-all duration-300"
                      style={{ width: `${(step / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form Content */}
          <div className="mb-6">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          {step < 7 && (
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  <FiArrowLeft size={16} /> Previous
                </button>
              ) : (
                <div></div> // Empty div to maintain layout
              )}
              
              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-black text-white rounded flex items-center gap-2 hover:bg-gray-800 transition"
                >
                  Next <FiArrowRight size={16} />
                </button>
              ) : (
                step === 6 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    Submit
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InvestorRegistration;