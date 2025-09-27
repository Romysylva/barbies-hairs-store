"use client";
import React, { useState } from "react";
import { Truck, Clock, Shield, MapPin, Info, Check } from "lucide-react";
import { ShippingMethod } from "../types";

interface ShippingCalculatorProps {
  methods: ShippingMethod[];
  selected: string;
  onSelect: (methodId: string) => void;
  className?: string;
  showZipCodeInput?: boolean;
  zipCode?: string;
  onZipCodeChange?: (zipCode: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  methods,
  selected,
  onSelect,
  className = "",
  showZipCodeInput = false,
  zipCode = "",
  onZipCodeChange,
  loading = false,
  disabled = false,
}) => {
  const [localZipCode, setLocalZipCode] = useState(zipCode);
  const [zipCodeError, setZipCodeError] = useState("");

  // Get shipping method icon based on carrier or delivery time
  const getShippingIcon = (method: ShippingMethod) => {
    if (method.carrier.toLowerCase().includes("express") || method.estimatedDays <= 1) {
      return <Clock className="h-5 w-5 text-orange-600" />;
    }
    if (method.carrier.toLowerCase().includes("priority") || method.estimatedDays <= 3) {
      return <Truck className="h-5 w-5 text-blue-600" />;
    }
    return <Truck className="h-5 w-5 text-green-600" />;
  };

  // Format delivery estimate
  const formatDeliveryEstimate = (days: number) => {
    if (days === 0) return "Same day";
    if (days === 1) return "Next day";
    if (days <= 3) return `${days} business days`;
    return `${days}-${days + 2} business days`;
  };

  // Get delivery date range
  const getDeliveryDateRange = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    
    // Add business days (skip weekends)
    let addedDays = 0;
    const currentDate = new Date(today);
    
    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    startDate.setTime(currentDate.getTime());
    
    // Add 1-2 more business days for range
    addedDays = 0;
    while (addedDays < 2) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }
    
    endDate.setTime(currentDate.getTime());
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    if (days <= 1) {
      return startDate.toLocaleDateString('en-US', options);
    }
    
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const handleZipCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localZipCode.trim()) {
      setZipCodeError("Please enter a valid ZIP code");
      return;
    }
    
    // Basic ZIP code validation (US format)
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(localZipCode.trim())) {
      setZipCodeError("Please enter a valid ZIP code (e.g., 12345 or 12345-6789)");
      return;
    }
    
    setZipCodeError("");
    onZipCodeChange?.(localZipCode.trim());
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Shipping Options</h3>
        {methods.length > 0 && (
          <span className="text-sm text-gray-500">{methods.length} options available</span>
        )}
      </div>

      {/* ZIP Code Input */}
      {showZipCodeInput && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <form onSubmit={handleZipCodeSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Calculate shipping to your area
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  value={localZipCode}
                  onChange={(e) => setLocalZipCode(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    zipCodeError ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !localZipCode.trim()}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Calculate
              </button>
            </div>
            {zipCodeError && (
              <p className="text-sm text-red-600">{zipCodeError}</p>
            )}
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-pink-500 border-t-transparent"></div>
            <span>Calculating shipping options...</span>
          </div>
        </div>
      )}

      {/* No Methods Available */}
      {!loading && methods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium mb-2">No shipping options available</p>
          <p className="text-sm">
            {showZipCodeInput 
              ? "Please enter your ZIP code to see available shipping methods."
              : "Unable to calculate shipping for this location."}
          </p>
        </div>
      )}

      {/* Shipping Methods */}
      {!loading && methods.length > 0 && (
        <div className="space-y-3">
          {methods.map((method) => (
            <label
              key={method._id}
              className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                selected === method._id
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="shipping-method"
                value={method._id}
                checked={selected === method._id}
                onChange={(e) => !disabled && onSelect(e.target.value)}
                disabled={disabled}
                className="sr-only"
              />
              
              {/* Selection Indicator */}
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mr-4 mt-1 flex items-center justify-center ${
                selected === method._id
                  ? "border-pink-500 bg-pink-500"
                  : "border-gray-300"
              }`}>
                {selected === method._id && (
                  <Check className="h-2.5 w-2.5 text-white" />
                )}
              </div>

              {/* Method Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getShippingIcon(method)}
                    <span className="font-medium text-gray-900">
                      {method.name}
                    </span>
                    {method.cost === 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {method.cost === 0 ? "Free" : `$${method.cost.toFixed(2)}`}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {method.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Delivery: {formatDeliveryEstimate(method.estimatedDays)}
                    </span>
                    <span className="text-gray-500">
                      {getDeliveryDateRange(method.estimatedDays)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {method.carrier}
                    </span>
                    
                    {method.trackingIncluded && (
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Tracking included
                      </span>
                    )}
                    
                    {method.insuranceIncluded && (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Insured
                      </span>
                    )}
                    
                    {method.signatureRequired && (
                      <span className="text-orange-600">
                        Signature required
                      </span>
                    )}
                  </div>

                  {/* Restrictions */}
                  {method.restrictions && method.restrictions.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>Note:</strong> {method.restrictions.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Shipping Info */}
      {!loading && methods.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Shipping Information</p>
              <ul className="space-y-1 text-xs">
                <li>• Orders typically ship within 1-2 business days</li>
                <li>• Free shipping on orders over $75</li>
                <li>• Expedited shipping available for faster delivery</li>
                <li>• All shipments are fully insured and trackable</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
