
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';
import { AuthForm } from './AuthForm';
import { Page } from '../types';

const SignUpPage: React.FC = () => {
  const { signup } = useAuth();
  const { navigate } = useRouter();

  const handleSignUp = async (email: string, password: string) => {
    await signup(email, password);
    navigate(Page.Dashboard);
  };
  
  return (
    <AuthForm 
      formType="signup" 
      onSubmit={handleSignUp} 
      switchForm={() => navigate(Page.Login)} 
    />
  );
};

export default SignUpPage;
