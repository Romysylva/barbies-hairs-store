"use client";
import React, { useState } from 'react';
import { Product } from '../types';
import { 
  X, 
  Link as LinkIcon, 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';

interface ShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const productUrl = `${window.location.origin}/products/${product._id}`;
  const shareText = `Check out this amazing hair product: ${product.name}`;
  const shareImage = product.images?.[0] || product.imageCover || '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this hair product: ${product.name}`);
    const body = encodeURIComponent(`Hi!\n\nI thought you might be interested in this hair product:\n\n${product.name}\n${product.description}\n\nCheck it out: ${productUrl}\n\nBest regards!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      onClick: shareViaFacebook,
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      onClick: shareViaTwitter,
      bgColor: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: shareViaWhatsApp,
      bgColor: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      onClick: shareViaEmail,
      bgColor: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Share Product</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <img
                src={product.images?.[0] || product.imageCover || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600">
                ${(product.priceDiscount || product.price).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Share Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={productUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Options */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Share via Social Media</h3>
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-colors ${option.bgColor} ${option.textColor}`}
                >
                  {option.icon}
                  <span className="font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native Share (if supported) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Or</h3>
              <button
                onClick={() => {
                  navigator.share({
                    title: product.name,
                    text: shareText,
                    url: productUrl,
                  }).catch((error) => {
                    console.error('Error sharing:', error);
                  });
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LinkIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Share via Device</span>
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Sharing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share with friends to get their opinion</li>
              <li>• Save to your social media for later</li>
              <li>• Email to yourself as a reminder</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
