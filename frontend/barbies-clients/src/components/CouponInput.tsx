"use client";
import React, { useState } from "react";
import { Tag, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Coupon, AppliedCoupon } from "../types";

interface CouponInputProps {
  onApplyCoupon?: (coupon: AppliedCoupon) => void;
  onRemoveCoupon?: (couponId: string) => void;
  appliedCoupons?: AppliedCoupon[];
  cartSubtotal?: number;
  disabled?: boolean;
  className?: string;
}

interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}

const CouponInput: React.FC<CouponInputProps> = ({
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupons = [],
  cartSubtotal = 0,
  disabled = false,
  className = "",
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  // Mock coupon validation - replace with actual API call
  const validateCoupon = async (code: string): Promise<CouponValidationResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock coupons for demonstration
    const mockCoupons: Coupon[] = [
      {
        _id: "1",
        code: "SAVE10",
        name: "10% Off Everything",
        description: "Get 10% off your entire order",
        type: "percentage",
        value: 10,
        minimumAmount: 25,
        maximumDiscount: 50,
        usageLimit: 1000,
        usageCount: 245,
        userUsageLimit: 1,
        validFrom: "2024-01-01T00:00:00.000Z",
        validTo: "2024-12-31T23:59:59.000Z",
        isActive: true,
        firstTimeCustomerOnly: false,
        autoApply: false,
      },
      {
        _id: "2",
        code: "FREESHIP",
        name: "Free Shipping",
        description: "Free shipping on any order",
        type: "free_shipping",
        value: 0,
        minimumAmount: 0,
        usageLimit: undefined,
        usageCount: 500,
        userUsageLimit: undefined,
        validFrom: "2024-01-01T00:00:00.000Z",
        validTo: "2024-12-31T23:59:59.000Z",
        isActive: true,
        firstTimeCustomerOnly: false,
        autoApply: false,
      },
      {
        _id: "3",
        code: "SAVE20",
        name: "$20 Off",
        description: "Get $20 off orders over $100",
        type: "fixed_amount",
        value: 20,
        minimumAmount: 100,
        usageLimit: 500,
        usageCount: 123,
        userUsageLimit: 1,
        validFrom: "2024-01-01T00:00:00.000Z",
        validTo: "2024-12-31T23:59:59.000Z",
        isActive: true,
        firstTimeCustomerOnly: false,
        autoApply: false,
      },
    ];

    const coupon = mockCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    
    if (!coupon) {
      return {
        isValid: false,
        message: "Invalid coupon code. Please check and try again.",
      };
    }

    if (!coupon.isActive) {
      return {
        isValid: false,
        message: "This coupon is no longer active.",
      };
    }

    if (new Date() < new Date(coupon.validFrom)) {
      return {
        isValid: false,
        message: "This coupon is not yet valid.",
      };
    }

    if (new Date() > new Date(coupon.validTo)) {
      return {
        isValid: false,
        message: "This coupon has expired.",
      };
    }

    if (coupon.minimumAmount && cartSubtotal < coupon.minimumAmount) {
      return {
        isValid: false,
        message: `Minimum order amount of $${coupon.minimumAmount.toFixed(2)} required for this coupon.`,
      };
    }

    // Check if coupon is already applied
    if (appliedCoupons.some(ac => ac.coupon._id === coupon._id)) {
      return {
        isValid: false,
        message: "This coupon has already been applied.",
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (cartSubtotal * coupon.value) / 100;
      if (coupon.maximumDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else if (coupon.type === "fixed_amount") {
      discountAmount = Math.min(coupon.value, cartSubtotal);
    }

    return {
      isValid: true,
      coupon,
      discountAmount,
      message: `Coupon applied! You saved $${discountAmount.toFixed(2)}.`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim() || isValidating) return;

    setIsValidating(true);
    setValidationMessage("");
    setMessageType("");

    try {
      const result = await validateCoupon(couponCode.trim());
      
      if (result.isValid && result.coupon && result.discountAmount !== undefined) {
        const appliedCoupon: AppliedCoupon = {
          coupon: result.coupon,
          discountAmount: result.discountAmount,
          appliedAt: new Date().toISOString(),
        };
        
        onApplyCoupon?.(appliedCoupon);
        setCouponCode("");
        setMessageType("success");
        setValidationMessage(result.message || "Coupon applied successfully!");
      } else {
        setMessageType("error");
        setValidationMessage(result.message || "Failed to apply coupon.");
      }
    } catch (error) {
      setMessageType("error");
      setValidationMessage("An error occurred while validating the coupon. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = (couponId: string) => {
    onRemoveCoupon?.(couponId);
    setValidationMessage("");
    setMessageType("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Applied Coupons */}
      {appliedCoupons.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Applied Coupons</h4>
          {appliedCoupons.map((appliedCoupon) => (
            <div
              key={appliedCoupon.coupon._id}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-1 bg-green-100 rounded">
                  <Tag className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-900">
                    {appliedCoupon.coupon.code}
                  </div>
                  <div className="text-sm text-green-700">
                    {appliedCoupon.coupon.name} • -$
                    {appliedCoupon.discountAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveCoupon(appliedCoupon.coupon._id)}
                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                title="Remove coupon"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Input Form */}
      <div>
        <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700 mb-2">
          Coupon Code
        </label>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              id="coupon-code"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              disabled={disabled || isValidating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={disabled || isValidating || !couponCode.trim()}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Tag className="h-4 w-4" />
                Apply
              </>
            )}
          </button>
        </form>
      </div>

      {/* Validation Message */}
      {validationMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            messageType === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {messageType === "success" ? (
            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          )}
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Available Coupons Hint */}
      {appliedCoupons.length === 0 && !validationMessage && (
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Available coupons:</p>
          <p>• SAVE10 - 10% off orders over $25</p>
          <p>• SAVE20 - $20 off orders over $100</p>
          <p>• FREESHIP - Free shipping on any order</p>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
