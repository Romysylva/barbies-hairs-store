"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thank you for your order!
        </h1>

        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. We’ll send you an update when
          it’s on the way.
        </p>

        {orderId && (
          <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg mb-6">
            <p className="text-sm">Order ID:</p>
            <p className="font-mono font-semibold">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/profile/orders"
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
