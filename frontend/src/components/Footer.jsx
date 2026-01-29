import React from 'react';
import { FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => (
  <footer className="bg-black text-white px-10 py-12">
    <div className="grid md:grid-cols-3 gap-10 mb-10 text-sm">
      
      {/* Programs */}
      <div>
        <h4 className="font-bold mb-4">Programs</h4>
        <ul className="space-y-2">
          <li>Program</li>
          <li>Startup School</li>
          <li>Work at a Startup</li>
          <li>Co-Founder Matching</li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-bold mb-4">Company</h4>
        <ul className="space-y-2">
          <li>Blog</li>
          <li>Contact</li>
          <li>Press</li>
          <li>People</li>
          <li>Careers</li>
          <li>Privacy Policy</li>
          <li>Notice at Collection</li>
          <li>Security</li>
          <li>Terms of Use</li>
        </ul>
      </div>

      {/* Resources */}
      <div>
        <h4 className="font-bold mb-4">Resources</h4>
        <ul className="space-y-2">
          <li>Startup Directory</li>
          <li>Startup Library</li>
          <li>Investors</li>
          <li>SAFE</li>
          <li>Hacker News</li>
          <li>Launch</li>
          <li>Deals</li>
        </ul>
      </div>
    </div>

    {/* Footer bottom bar */}
    <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-6 text-xs">
      <p>© 2025 Tapro. All rights reserved.</p>
      
      <div className="flex space-x-4 text-lg mt-4 md:mt-0">
  <a href="#" aria-label="LinkedIn" className="hover:text-gray-400"><FaLinkedin /></a>
  <a href="#" aria-label="Twitter" className="hover:text-gray-400"><FaTwitter /></a>
  <a href="#" aria-label="Instagram" className="hover:text-gray-400"><FaInstagram /></a>
</div>
    </div>
  </footer>
);

export default Footer;
