
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';
import { AuthForm } from './AuthForm';
import { Page } from '../types';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { navigate } = useRouter();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate(Page.Dashboard);
  };
  
  return (
    <AuthForm 
      formType="login" 
      onSubmit={handleLogin} 
      switchForm={() => navigate(Page.SignUp)} 
    />
  );
};

export default LoginPage;
