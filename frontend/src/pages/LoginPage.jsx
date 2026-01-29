import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm';

const LoginPage = () => (
  <div className="bg-[#F5F5EE] min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow flex items-center justify-center">
      <AuthForm type="login" />
    </main>
    <Footer />
  </div>
);

export default LoginPage;
