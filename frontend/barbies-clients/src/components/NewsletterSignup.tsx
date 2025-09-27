"use client";
import React, { useState } from 'react';
import { Mail, Check, X, Gift, Sparkles } from 'lucide-react';

interface NewsletterSignupProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  title = "Stay in the Loop",
  subtitle = "Get exclusive offers, hair care tips, and new product updates delivered to your inbox.",
  placeholder = "Enter your email address",
  className = '',
  variant = 'default'
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      setStatus('error');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          source: 'homepage'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 5000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to subscribe. Please try again.');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again later.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-pink-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <Mail className="h-5 w-5 text-pink-600" />
          <h3 className="font-semibold text-gray-900">Newsletter</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || status === 'success'}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isLoading ? 'Signing up...' : status === 'success' ? 'Done!' : 'Sign Up'}
          </button>
        </form>
        
        {status === 'error' && (
          <p className="text-red-600 text-xs mt-2">{errorMessage}</p>
        )}
        {status === 'success' && (
          <p className="text-green-600 text-xs mt-2">Successfully subscribed!</p>
        )}
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className={`bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-8 text-white ${className}`}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-8 w-8" />
            <Sparkles className="h-8 w-8" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-lg opacity-90 mb-6">{subtitle}</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mb-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span>✨ Exclusive offers</span>
              <span>💡 Hair care tips</span>
              <span>🎁 Early access</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || status === 'success'}
              className="px-6 py-3 bg-white text-pink-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'Signing up...'
              ) : status === 'success' ? (
                <>
                  <Check className="h-4 w-4" />
                  Subscribed!
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </form>
          
          {status === 'error' && (
            <div className="flex items-center justify-center gap-2 mt-3 text-red-200">
              <X className="h-4 w-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}
          
          <p className="text-xs opacity-75 mt-4">
            No spam, unsubscribe at any time. Privacy policy applies.
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      <div className="max-w-lg mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="h-8 w-8 text-pink-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <Gift className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <span className="text-gray-700">Exclusive Offers</span>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Sparkles className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="text-gray-700">Beauty Tips</span>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Check className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-gray-700">New Products</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || status === 'success'}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Subscribing...'
            ) : status === 'success' ? (
              <>
                <Check className="h-4 w-4" />
                Subscribed!
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        
        {status === 'error' && (
          <div className="flex items-center justify-center gap-2 mt-3 text-red-600">
            <X className="h-4 w-4" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex items-center justify-center gap-2 mt-3 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-sm">Welcome to our community! Check your inbox.</span>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-4">
          By subscribing, you agree to our privacy policy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSignup;
