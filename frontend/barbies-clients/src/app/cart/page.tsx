"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Coupon, AppliedCoupon, ShippingMethod } from "../../types";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Gift,
  Truck,
  Shield,
  Tag,
  ArrowRight,
  ArrowLeft,
  Heart,
  Trash2,
  Lock,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProductRecommendations from "../../components/ProductRecommendations";
import CouponInput from "../../components/CouponInput";
import ShippingCalculator from "../../components/ShippingCalculator";

const CartPage: React.FC = () => {
  const {
    items,
    savedItems,
    totalItems,
    subtotal,
    taxes,
    shipping,
    discounts,
    totalAmount,
    appliedCoupons,
    updateQuantity,
    removeFromCart,
    moveToSaved,
    moveToCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    updateShipping,
  } = useCart();

  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  useEffect(() => {
    if (items.length > 0) {
      fetchShippingMethods();
      fetchAvailableCoupons();
    }
  }, [items]);

  const fetchShippingMethods = async () => {
    try {
      const response = await fetch("/api/shipping/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
            weight: item.product.weight || 0,
          })),
          destination: user?.addresses?.find(
            (addr) => addr.isDefault && addr.type === "shipping"
          ),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShippingMethods(data.methods);
        if (data.methods.length > 0 && !selectedShipping) {
          setSelectedShipping(data.methods[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await fetch("/api/coupons/available", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product._id,
            categoryId: item.product.category._id,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          userId: user?._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableCoupons(data.coupons);
      }
    } catch (error) {
      console.error("Error fetching available coupons:", error);
    }
  };

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    setLoading(true);
    await updateQuantity(productId, newQuantity);
    setLoading(false);
  };

  const handleRemoveItem = async (productId: string) => {
    setLoading(true);
    await removeFromCart(productId);
    setLoading(false);
  };

  const handleMoveToSaved = async (productId: string) => {
    setLoading(true);
    await moveToSaved(productId);
    setLoading(false);
  };

  const handleMoveToCart = async (productId: string) => {
    setLoading(true);
    await moveToCart(productId);
    setLoading(false);
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      setLoading(true);
      await clearCart();
      setLoading(false);
    }
  };

  const handleCouponApply = async (appliedCoupon: AppliedCoupon) => {
    setLoading(true);
    try {
      await applyCoupon(appliedCoupon.coupon.code);
      setCouponCode("");
    } catch (error) {
      console.error("Error applying coupon:", error);
    }
    setLoading(false);
  };

  const handleCouponRemove = async (couponId: string) => {
    setLoading(true);
    await removeCoupon(couponId);
    setLoading(false);
  };

  const handleShippingChange = async (methodId: string) => {
    setSelectedShipping(methodId);
    setLoading(true);
    await updateShipping(methodId);
    setLoading(false);
  };

  if (items.length === 0 && savedItems?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {`Looks like you haven't added any products to your cart yet. Start
              shopping to find your perfect hair care products!`}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-8 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Cart Items */}
            {items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={
                            item.product.imageCover
                              ? `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${item.product.imageCover}`
                              : "/placeholder.jpg"
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product._id}`}
                          className="text-lg font-medium text-gray-900 hover:text-pink-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>

                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.category?.name}
                          {item.selectedAttributes &&
                            Object.entries(item.selectedAttributes).map(
                              ([key, value]) => (
                                <span key={key} className="ml-2">
                                  • {key}: {value}
                                </span>
                              )
                            )}
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-semibold text-gray-900">
                            ${item.price?.toFixed(2)}
                          </span>

                          {item.product.priceDiscount &&
                            item.product.priceDiscount < item.product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item.product.price.toFixed(2)}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product._id,
                                item.quantity - 1
                              )
                            }
                            disabled={loading}
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.product._id,
                                item.quantity + 1
                              )
                            }
                            disabled={
                              loading || item.quantity >= item.product.quantity
                            }
                            className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${item.price?.toFixed(2)} each
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleMoveToSaved(item.product._id)}
                          disabled={loading}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                          title="Save for later"
                        >
                          <Heart className="h-3 w-3" />
                          Save
                        </button>

                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          disabled={loading}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                          title="Remove from cart"
                        >
                          <X className="h-3 w-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved for Later */}
            {savedItems?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Saved for Later
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={
                            item.product.imageCover
                              ? `${process.env.NEXT_PUBLIC_UPLOADS_URL}/uploads/products/${item.product.imageCover}`
                              : "/placeholder.jpg"
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleMoveToCart(item.product._id)}
                            className="text-xs text-pink-600 hover:text-pink-700"
                          >
                            Move to Cart
                          </button>

                          <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Products */}
            <ProductRecommendations
              type="cart_cross_sell"
              title="You might also like"
              cartItems={items}
            />
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${subtotal?.toFixed(2)}</span>
                </div>

                {appliedCoupons?.length > 0 && (
                  <div className="space-y-2">
                    {appliedCoupons.map((appliedCoupon) => (
                      <div
                        key={appliedCoupon.coupon._id}
                        className="flex justify-between text-green-600"
                      >
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {appliedCoupon.coupon.name}
                        </span>
                        <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span>${taxes?.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Input */}
              <CouponInput
                onApplyCoupon={handleCouponApply}
                appliedCoupons={appliedCoupons}
                onRemoveCoupon={handleCouponRemove}
                cartSubtotal={subtotal}
                disabled={loading}
                className="mb-6"
              />

              {/* Shipping Calculator */}
              {shippingMethods.length > 0 && (
                <ShippingCalculator
                  methods={shippingMethods}
                  selected={selectedShipping}
                  onSelect={handleShippingChange}
                  className="mb-6"
                />
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
                <Lock className="h-4 w-4 text-green-600" />
                <span>Secure checkout with SSL encryption</span>
              </div>

              {/* Checkout Button */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center">
                    <Link
                      href="/login"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      Sign in
                    </Link>{" "}
                    for faster checkout
                  </p>
                )}
              </div>

              {/* Estimated Delivery */}
              {estimatedDelivery && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Truck className="h-4 w-4" />
                    <span>Estimated delivery: {estimatedDelivery}</span>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-xs text-gray-600">
                    <Shield className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <span>Secure Payment</span>
                  </div>

                  <div className="text-xs text-gray-600">
                    <Truck className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <span>Free Shipping</span>
                  </div>

                  <div className="text-xs text-gray-600">
                    <Gift className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
