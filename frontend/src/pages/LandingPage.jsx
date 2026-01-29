import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="bg-[#F5F5EE] min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 px-6">
          <h1 className="text-4xl font-bold mb-4">Connecting Startups with Investors</h1>
          <p className="text-lg mb-8">Join Tapro to find the perfect investment opportunities for your startup.</p>
          <button
            className="bg-black text-white px-6 py-3 rounded text-lg hover:bg-gray-800"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </section>

        {/* Top Companies */}
        <section className="text-center px-6 mb-20">
          <h2 className="text-2xl font-semibold mb-8">Top Tapro Companies</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {["brex", "deel", "rippling", "reddit.png", "gusto", "flexport", "dropbox"].map((company, idx) => (
              <div
                key={idx}
                className="bg-white px-6 py-4 rounded shadow-sm w-[120px] h-[60px] flex items-center justify-center"
              >
                <span className="text-sm font-medium capitalize">{company}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-[#F5F5EE] py-16 px-10">
          <h2 className="text-2xl font-semibold mb-10">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-md shadow hover:shadow-md transition text-left">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-bold mb-2">Step 1: Sign Up</h3>
              <p>Create your profile and showcase your startup.</p>
            </div>

            <div className="bg-white p-6 rounded-md shadow hover:shadow-md transition text-left">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="font-bold mb-2">Step 2: Explore Opportunities</h3>
              <p>Browse through a variety of investment opportunities.</p>
            </div>

            <div className="bg-white p-6 rounded-md shadow hover:shadow-md transition text-left">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="font-bold mb-2">Step 3: Connect</h3>
              <p>Connect with investors and pitch your startup.</p>
            </div>
          </div>
        </section>

        {/* Why Tapro */}
        <section className="bg-white py-16 px-10 text-center mb-20">
          <h2 className="text-2xl font-semibold mb-5">Why Tapro?</h2>

          <h2 className="text-2xl mb-10">Access a large network of investors</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-md shadow hover:shadow-md transition text-left">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-bold mb-2 text-lg">Early-Stage Support</h3>
              <p>We help founders at their earliest stages regardless of their ages.</p>
            </div>

            <div className="bg-white p-6 rounded-md shadow hover:shadow-md transition text-left">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-bold mb-2 text-lg">Fundraising Advantage</h3>
              <p>We give startups a huge fundraising advantage.</p>
            </div>

            <div className="bg-white p-6 rounded-md shadow hover:shadow-md transition text-left">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="font-bold mb-2 text-lg">Success Rate</h3>
              <p>We improve the success rate of your startups.</p>
            </div>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="bg-white py-16 px-10 mb-20">
          <h2 className="text-2xl font-semibold text-center mb-10">Meet Our Team</h2>
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { name: 'Devarshi Tiwari', role: 'Intern', company: 'Klyrot Labs' },
              { name: 'Suyash Shukla', role: 'Developer', company: 'Klyrot Labs' },
            ].map((member, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-gray-300 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h4 className="font-medium">{member.name}</h4>
                <p className="text-sm">{member.role}</p>
                <p className="text-sm">{member.company}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;