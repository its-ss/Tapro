import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm';

const RegisterPage = () => (
  <div className="bg-[#F5F5EE] min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow flex items-center justify-center">
      <AuthForm type="register" />
    </main>
    <Footer />
  </div>
);

export default RegisterPage;
