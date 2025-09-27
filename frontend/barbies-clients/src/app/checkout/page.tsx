"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  Address,
  PaymentMethod,
  ShippingMethod,
  EnhancedOrder,
} from "../../types";
import {
  CreditCard,
  Truck,
  MapPin,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  Gift,
  User,
  Phone,
  Mail,
  AlertCircle,
  Shield,
} from "lucide-react";
import CheckoutSteps from "../../components/CheckoutSteps";
import AddressForm from "../../components/AddressForm";
import PaymentForm from "../../components/PaymentForm";
import OrderReview from "../../components/OrderReview";
import LoadingSpinner from "../../components/LoadingSpinner";

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation";

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [shippingAddress, setShippingAddress] =
    useState<Partial<Address> | null>(null);
  const [billingAddress, setBillingAddress] = useState<Partial<Address> | null>(
    null
  );
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingMethod | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [guestInfo, setGuestInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

  // Available Options
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Order
  const [placedOrder, setPlacedOrder] = useState<EnhancedOrder | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useCart } from "../../context/CartContext";
// import { useAuth } from "../../context/AuthContext";
// import {
//   Address,
//   PaymentMethod,
//   ShippingMethod,
//   EnhancedOrder,
// } from "../../types";
// import {
//   CreditCard,
//   Truck,
//   MapPin,
//   Check,
//   ArrowLeft,
//   ArrowRight,
//   Lock,
//   Gift,
//   User,
//   Phone,
//   Mail,
//   AlertCircle,
//   Shield,
// } from "lucide-react";
// import LoadingSpinner from "../../components/LoadingSpinner";

// type CheckoutStep = "shipping" | "payment" | "review" | "confirmation";

// const CheckoutPage: React.FC = () => {
//   const router = useRouter();
//   const { items, totalAmount, clearCart } = useCart();
//   const { user, isAuthenticated } = useAuth();

//   const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Form Data
//   const [shippingAddress, setShippingAddress] =
//     useState<Partial<Address> | null>(null);
//   const [billingAddress, setBillingAddress] = useState<Partial<Address> | null>(
//     null
//   );
//   const [useSameAddress, setUseSameAddress] = useState(true);
//   const [selectedShipping, setSelectedShipping] =
//     useState<ShippingMethod | null>(null);
//   const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
//     null
//   );
//   const [guestInfo, setGuestInfo] = useState({
//     email: "",
//     firstName: "",
//     lastName: "",
//     phone: "",
//   });
//   const [orderNotes, setOrderNotes] = useState("");
//   const [isGift, setIsGift] = useState(false);
//   const [giftMessage, setGiftMessage] = useState("");
//   const [agreeToTerms, setAgreeToTerms] = useState(false);
//   const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);

//   // Available Options
//   const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
//   const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

//   // Order
//   const [placedOrder, setPlacedOrder] = useState<EnhancedOrder | null>(null);

//   // Redirect if cart is empty
//   useEffect(() => {
//     if (items.length === 0) {
//       router.push("/cart");
//     }
//   }, [items, router]);

//   const placeOrder = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const orderData = {
//         items: items.map((item) => ({
//           productId: item.product._id,
//           quantity: item.quantity,
//           price: item.price,
//         })),
//         shippingAddress,
//         billingAddress: useSameAddress ? shippingAddress : billingAddress,
//         shippingMethod: selectedShipping,
//         paymentMethod: selectedPayment,
//         guestInfo: !isAuthenticated ? guestInfo : undefined,
//         orderNotes,
//         isGift,
//         giftMessage: isGift ? giftMessage : undefined,
//         subscribeNewsletter,
//       };

//       const response = await fetch("/api/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(isAuthenticated && {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           }),
//         },
//         body: JSON.stringify(orderData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to place order");
//       }

//       const data = await response.json();
//       setPlacedOrder(data.order);
//       setCurrentStep("confirmation");

//       // Clear cart after successful order
//       await clearCart();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to place order");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (items.length === 0) {
//     return null; // Will redirect
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">
//             Secure Checkout
//           </h1>
//           <p className="text-gray-600">
//             Complete your purchase safely and securely
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
//             <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
//             <span className="text-red-700">{error}</span>
//           </div>
//         )}

//         {/* Simple Order Summary and Place Order */}
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Order Summary
//           </h2>

//           <div className="space-y-4 mb-6">
//             {items.map((item) => (
//               <div key={item._id} className="flex items-center gap-4 py-2">
//                 <div className="w-12 h-12 bg-gray-200 rounded"></div>
//                 <div className="flex-1">
//                   <h3 className="font-medium text-gray-900">
//                     {item.product.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
//                 </div>
//                 <span className="font-medium text-gray-900">
//                   ${(item.price * item.quantity).toFixed(2)}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <div className="border-t pt-4 mb-6">
//             <div className="flex justify-between text-xl font-semibold text-gray-900">
//               <span>Total</span>
//               <span>${totalAmount.toFixed(2)}</span>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={agreeToTerms}
//                 onChange={(e) => setAgreeToTerms(e.target.checked)}
//                 className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
//               />
//               <span className="text-sm text-gray-700">
//                 I agree to the Terms and Conditions
//               </span>
//             </label>

//             <button
//               onClick={placeOrder}
//               disabled={loading || !agreeToTerms}
//               className="w-full bg-pink-600 text-white py-3 px-4 rounded-md font-medium hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <LoadingSpinner size="small" color="white" />
//                   <span>Processing...</span>
//                 </>
//               ) : (
//                 <>
//                   <Lock className="h-4 w-4" />
//                   <span>Place Order - ${totalAmount.toFixed(2)}</span>
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Order Confirmation */}
//         {currentStep === "confirmation" && placedOrder && (
//           <div className="mt-8 bg-white rounded-lg shadow-sm border p-6 text-center">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Check className="h-8 w-8 text-green-600" />
//             </div>

//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               Order Confirmed!
//             </h2>
//             <p className="text-gray-600 mb-4">
//               Thank you for your purchase. Your order #{placedOrder.orderNumber}{" "}
//               has been placed successfully.
//             </p>

//             <div className="flex gap-4 justify-center">
//               <button
//                 onClick={() => router.push(`/orders/${placedOrder._id}`)}
//                 className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
//               >
//                 View Order
//               </button>

//               <button
//                 onClick={() => router.push("/products")}
//                 className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
//               >
//                 Continue Shopping
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CheckoutPage;
