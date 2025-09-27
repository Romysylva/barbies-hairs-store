"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterPage as SharedRegisterPage } from '../../../../../shared/components/auth/RegisterPage';
import { useAuth } from '@/context/AuthContext';

export default function ClientRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    location: string;
    phone?: string;
    avatar?: File;
    preferences?: {
      theme?: string;
      notification?: boolean;
      language?: string;
    };
  }) => {
    try {
      setLoading(true);
      setError('');
      await register(userData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SharedRegisterPage
      onRegister={handleRegister}
      loading={loading}
      error={error}
      loginUrl="/login"
    />
  );
}
