"use client";
import React from 'react';
import { Shield, Truck, RotateCcw, Award, Lock, Phone, CheckCircle } from 'lucide-react';

interface TrustBadge {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface TrustBadgesProps {
  variant?: 'horizontal' | 'grid' | 'compact';
  showDescription?: boolean;
  className?: string;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = 'horizontal',
  showDescription = true,
  className = ''
}) => {
  const badges: TrustBadge[] = [
    {
      id: 'secure',
      icon: <Lock className="h-6 w-6" />,
      title: 'Secure Checkout',
      description: 'SSL encrypted payments',
      color: 'text-green-600'
    },
    {
      id: 'shipping',
      icon: <Truck className="h-6 w-6" />,
      title: 'Free Shipping',
      description: 'On orders over $50',
      color: 'text-blue-600'
    },
    {
      id: 'returns',
      icon: <RotateCcw className="h-6 w-6" />,
      title: '30-Day Returns',
      description: 'Easy returns & exchanges',
      color: 'text-purple-600'
    },
    {
      id: 'quality',
      icon: <Award className="h-6 w-6" />,
      title: 'Quality Guarantee',
      description: '100% authentic products',
      color: 'text-yellow-600'
    },
    {
      id: 'support',
      icon: <Phone className="h-6 w-6" />,
      title: '24/7 Support',
      description: 'Expert hair care advice',
      color: 'text-pink-600'
    },
    {
      id: 'verified',
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Verified Reviews',
      description: 'Real customer feedback',
      color: 'text-indigo-600'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {badges.slice(0, 4).map((badge) => (
          <div key={badge.id} className="flex items-center gap-2 text-sm text-gray-600">
            <div className={badge.color}>
              {badge.icon}
            </div>
            <span className="font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 ${className}`}>
        {badges.map((badge) => (
          <div key={badge.id} className="text-center group">
            <div className={`w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors ${badge.color}`}>
              {badge.icon}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {badge.title}
            </h3>
            {showDescription && (
              <p className="text-xs text-gray-600">
                {badge.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="flex items-center gap-3 group">
            <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors ${badge.color}`}>
              {badge.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {badge.title}
              </h3>
              {showDescription && (
                <p className="text-xs text-gray-600">
                  {badge.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
