// src/pages/WishlistDisplay.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  addedAt: string;
}

const mockWishlist: WishlistItem[] = [
  {
    id: "1",
    name: "Luxury Straight Hair Bundle",
    image: "/images/product1.jpg",
    price: 45000,
    addedAt: "2025-08-15",
  },
  {
    id: "2",
    name: "Deep Wave Closure",
    image: "/images/product2.jpg",
    price: 25000,
    addedAt: "2025-08-20",
  },
  {
    id: "3",
    name: "Body Wave Full Lace Wig",
    image: "/images/product3.jpg",
    price: 60000,
    addedAt: "2025-08-25",
  },
];

export default function WishlistDisplay() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWishlist.map((item) => (
          <Card
            key={item.id}
            className="shadow-md hover:shadow-lg transition-all rounded-2xl"
          >
            <CardContent className="p-4 flex flex-col">
              <Image
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
                width={100}
                height={100}
              />

              <h2 className="text-lg font-semibold mb-2">{item.name}</h2>
              <p className="text-sm text-gray-500 mb-1">
                Added on {new Date(item.addedAt).toLocaleDateString()}
              </p>
              <p className="font-bold text-lg mb-4">
                ₦{item.price.toLocaleString()}
              </p>

              <div className="flex gap-2 mt-auto">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  Remove
                </Button>
                <Button className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
