"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ForgotPasswordPageProps {
  onResetPassword: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string;
  loginUrl?: string;
  onSuccess?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onResetPassword,
  loading = false,
  error,
  loginUrl = '/login',
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) return;

    try {
      await onResetPassword(email);
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent password reset instructions to your email address
            </p>
          </div>

          {/* Success Card */}
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                If an account with <strong>{email}</strong> exists, you will receive an email with instructions to reset your password.
              </p>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Didn't receive the email?</strong>
                  <br />
                  Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                Try Different Email
              </Button>

              <Link 
                href={loginUrl}
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Forgot Password</h1>
          <p className="text-muted-foreground">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        {/* Reset Password Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Reset Password</h2>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Global Error */}
              {error && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                fullWidth
                autoFocus
              />

              {/* Instructions */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  We'll send you an email with a link to reset your password. 
                  Make sure to check your spam folder if you don't see it in your inbox.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={!email.trim()}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>

              <div className="flex items-center justify-center gap-4 text-sm">
                <Link 
                  href={loginUrl}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Instructions */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Demo Mode:</strong> Password reset emails are simulated. 
            In a real app, this would integrate with your email service.
          </p>
        </div>
      </div>
    </div>
  );
};
