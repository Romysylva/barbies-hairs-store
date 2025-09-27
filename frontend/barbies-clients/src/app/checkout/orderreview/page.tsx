/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OrderReview({ cart, address, payment }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create order payload
      const orderData = {
        cart,
        address,
        payment,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error("Failed to place order");
      }

      const data = await res.json();

      // Redirect to success page with orderId
      router.push(`/checkout/success?orderId=${data._id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order summary */}
      <h2 className="text-xl font-semibold text-gray-900">Review Your Order</h2>

      {/* TODO: Add your cart items, address, and payment details here */}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full mt-4"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </Button>
    </div>
  );
}

// ("use client");
// import React from "react";
// import { useCart } from "@/context/CartContext";

// interface OrderReviewProps {
//   address: any;
//   payment: any;
//   onBack: () => void;
//   onPlaceOrder: () => void;
// }

// const OrderReview: React.FC<OrderReviewProps> = ({
//   address,
//   payment,
//   onBack,
//   onPlaceOrder,
// }) => {
//   const { cartItems, cartTotal } = useCart();

//   return (
//     <div className="space-y-6">
//       <h2 className="text-xl font-bold">Order Review</h2>

//       <div className="border rounded p-4">
//         <h3 className="font-medium">Shipping Address</h3>
//         <p>{address.name}</p>
//         <p>{address.email}</p>
//         <p>{address.phone}</p>
//         <p>{address.address}</p>
//       </div>

//       <div className="border rounded p-4">
//         <h3 className="font-medium">Payment Method</h3>
//         <p>{payment.method}</p>
//       </div>

//       <div className="border rounded p-4">
//         <h3 className="font-medium">Cart Items</h3>
//         <ul className="space-y-2">
//           {cartItems.map((item) => (
//             <li key={item._id} className="flex justify-between">
//               <span>{item.name} × {item.quantity}</span>
//               <span>${(item.price * item.quantity).toFixed(2)}</span>
//             </li>
//           ))}
//         </ul>
//         <div className="font-bold mt-2">Total: ${cartTotal.toFixed(2)}</div>
//       </div>

//       <div className="flex justify-between">
//         <button
//           onClick={onBack}
//           className="px-6 py-2 rounded border"
//         >
//           Back
//         </button>
//         <button
//           onClick={onPlaceOrder}
//           className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//         >
//           Place Order
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderReview;
