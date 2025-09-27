// src/pages/OrderHistoryPage.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "../../../../shared/components/ui/Badge";
import { Button } from "../../../../shared/components/ui/Button";
import Image from "next/image";

interface Order {
  id: string;
  date: string;
  total: number;
  status: "completed" | "cancelled" | "returned";
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}

const mockOrderHistory: Order[] = [
  {
    id: "1001",
    date: "2025-07-22",
    total: 220,
    status: "completed",
    items: [
      {
        id: "p1",
        name: "Luxury Straight Weave",
        price: 120,
        quantity: 1,
        image: "/images/weave1.jpg",
      },
      {
        id: "p2",
        name: "Body Wave Wig",
        price: 100,
        quantity: 1,
        image: "/images/weave2.jpg",
      },
    ],
  },
  {
    id: "1002",
    date: "2025-07-10",
    total: 80,
    status: "returned",
    items: [
      {
        id: "p3",
        name: "Curly Weave",
        price: 80,
        quantity: 1,
        image: "/images/weave3.jpg",
      },
    ],
  },
];

export interface OrderHistoryProps {
  limit?: number;
  showHeader?: boolean;
}

const statusColors: Record<Order["status"], string> = {
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  returned: "bg-yellow-500",
};

const OrderHistoryPage: React.FC<OrderHistoryProps> = ({
  limit,
  showHeader,
}) => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showHeader && <h1 className="text-2xl font-bold mb-6">Order History</h1>}

      <p>Showing {limit ?? "all"} orders</p>

      {mockOrderHistory.length === 0 ? (
        <p className="text-gray-500">You have no past orders yet.</p>
      ) : (
        <div className="space-y-6">
          {mockOrderHistory.map((order) => (
            <Card key={order.id} className="shadow-md rounded-2xl">
              <CardContent className="p-4">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    <Badge
                      className={`${statusColors[order.status]} text-white`}
                    >
                      {order.status}
                    </Badge>
                    <p className="font-medium">Total: ${order.total}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border rounded-lg p-3"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        width={64}
                        height={64}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  {order.status === "completed" && (
                    <Button variant="outline">Reorder</Button>
                  )}
                  <Button variant="secondary">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;

// ("use client");

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// type Order = {
//   _id: string;
//   createdAt: string;
//   totalPrice: number;
//   status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
// };

// export default function OrderHistoryPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const res = await fetch("/api/orders", { credentials: "include" });
//         if (!res.ok) throw new Error("Failed to fetch orders");
//         const data = await res.json();
//         setOrders(data.orders || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[60vh]">
//         <p className="text-gray-500">Loading your orders...</p>
//       </div>
//     );
//   }

//   if (!orders.length) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-[60vh] text-center">
//         <p className="text-gray-600">You haven’t placed any orders yet.</p>
//         <button
//           onClick={() => router.push("/products")}
//           className="mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition"
//         >
//           Shop Now
//         </button>
//       </div>
//     );
//   }

//   return (
//     <section className="max-w-5xl mx-auto px-4 py-8">
//       <h1 className="text-2xl font-semibold mb-6">Order History</h1>

//       <div className="overflow-x-auto border rounded-lg shadow-sm">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-700">
//             <tr>
//               <th className="px-4 py-3">Order ID</th>
//               <th className="px-4 py-3">Date</th>
//               <th className="px-4 py-3">Total</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr
//                 key={order._id}
//                 className="border-t hover:bg-gray-50 transition"
//               >
//                 <td className="px-4 py-3 font-mono">{order._id.slice(-6)}</td>
//                 <td className="px-4 py-3">
//                   {new Date(order.createdAt).toLocaleDateString()}
//                 </td>
//                 <td className="px-4 py-3 font-medium">
//                   ₦{order.totalPrice.toFixed(2)}
//                 </td>
//                 <td className="px-4 py-3 capitalize">{order.status}</td>
//                 <td className="px-4 py-3 text-right">
//                   <button
//                     onClick={() => router.push(`/orders/${order._id}`)}
//                     className="text-purple-600 hover:underline mr-2"
//                   >
//                     View
//                   </button>
//                   {order.status === "pending" && (
//                     <button className="text-red-600 hover:underline">
//                       Cancel
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </section>
//   );
// }
