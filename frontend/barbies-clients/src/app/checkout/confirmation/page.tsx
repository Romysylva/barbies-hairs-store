"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../../../../../shared/components/ui/Card";
import { Button } from "../../../../../../shared/components/ui/Button";
import { Badge } from "../../../../../../shared/components/ui/Badge";
import {
  CheckCircle,
  Mail,
  Calendar,
  Truck,
  CreditCard,
  Home,
  ShoppingBag,
  Download,
  Phone,
} from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "#12345";

  // Mock order data - in real app this would be fetched using orderId
  const orderData = {
    orderId: orderId,
    orderNumber: `BH-${orderId}`,
    status: "confirmed",
    total: 79.97,
    items: [
      {
        id: "1",
        name: "Keratin Hair Treatment Shampoo",
        price: 24.99,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&h=100&fit=crop",
      },
      {
        id: "2",
        name: "Argan Oil Hair Mask",
        price: 34.99,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=100&h=100&fit=crop",
      },
      {
        id: "3",
        name: "Professional Hair Styling Cream",
        price: 19.99,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1583208828344-a4f1da00e81a?w=100&h=100&fit=crop",
      },
    ],
    shipping: {
      method: "Standard Shipping",
      cost: 5.99,
      estimatedDelivery: "5-7 business days",
      address: {
        name: "Jane Smith",
        line1: "123 Main Street",
        line2: "Apt 4B",
        city: "New York",
        state: "NY",
        zip: "10001",
      },
    },
    payment: {
      method: "Credit Card",
      last4: "4242",
    },
    placedAt: new Date().toISOString(),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order has been confirmed and will
            be processed shortly.
          </p>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Order Details</h2>
                  <Badge variant="success">Confirmed</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Order: {orderData.orderNumber}</span>
                  <span>•</span>
                  <span>Placed: {formatDate(orderData.placedAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 object-cover rounded-lg border border-border"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">
                      {orderData.shipping.address.name}
                    </p>
                    <p>{orderData.shipping.address.line1}</p>
                    {orderData.shipping.address.line2 && (
                      <p>{orderData.shipping.address.line2}</p>
                    )}
                    <p>
                      {orderData.shipping.address.city},{" "}
                      {orderData.shipping.address.state}{" "}
                      {orderData.shipping.address.zip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="font-medium">{orderData.shipping.method}</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery: {orderData.shipping.estimatedDelivery}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(orderData.shipping.cost)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{orderData.payment.method}</p>
                    <p className="text-sm text-muted-foreground">
                      Ending in {orderData.payment.last4}
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    Paid
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Order Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(orderData.total - orderData.shipping.cost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(orderData.shipping.cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(orderData.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">What happens next?</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Order Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll receive an email confirmation with your order details
                    and receipt.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Shipping Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll send you tracking information once your order ships.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Delivery</h4>
                  <p className="text-sm text-muted-foreground">
                    Your order will arrive within{" "}
                    {orderData.shipping.estimatedDelivery}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/dashboard/orders")}
            leftIcon={<ShoppingBag className="h-4 w-4" />}
          >
            View Order History
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/shop")}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Continue Shopping
          </Button>
        </div>

        {/* Support */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg text-center">
          <h4 className="font-semibold mb-2">Need Help?</h4>
          <p className="text-sm text-muted-foreground mb-4">
            If you have any questions about your order, don't hesitate to
            contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              support@barbieshair.com
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              1-800-BARBIES
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
