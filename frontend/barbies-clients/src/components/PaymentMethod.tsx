"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, PlusCircle, Trash2, Edit } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  type: string;
  cardNumber: string;
  expiry: string;
  isDefault?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "Visa",
    cardNumber: "**** **** **** 1234",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: "2",
    type: "Mastercard",
    cardNumber: "**** **** **** 5678",
    expiry: "08/25",
  },
];

export default function PaymentMethods() {
  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <Button className="flex items-center gap-2">
          <PlusCircle size={18} /> Add Payment Method
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className="shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard size={20} className="text-purple-600" />
                {method.type}
                {method.isDefault && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700">{method.cardNumber}</p>
              <p className="text-sm text-gray-500">Expiry: {method.expiry}</p>
              <div className="flex items-center gap-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Edit size={14} /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
