"use client";
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Truck, 
  CreditCard, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  User,
  Mail,
  Phone,
  Lock
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { cn } from '../utils';
import { CartItem } from '../cart/CartSidebar';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  name: string;
  details?: string;
  icon?: string;
}

interface CheckoutData {
  items: CartItem[];
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod;
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
}

interface CheckoutFlowProps {
  items: CartItem[];
  onComplete: (data: CheckoutData) => Promise<void>;
  onBack?: () => void;
  loading?: boolean;
  className?: string;
}

const checkoutSteps = [
  { id: 'shipping', title: 'Shipping', icon: Truck },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'review', title: 'Review', icon: Check },
];

const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, estimatedDays: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, estimatedDays: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, estimatedDays: '1 business day' },
];

const paymentMethods: PaymentMethod[] = [
  { id: 'card', type: 'card', name: 'Credit/Debit Card' },
  { id: 'paypal', type: 'paypal', name: 'PayPal' },
  { id: 'apple_pay', type: 'apple_pay', name: 'Apple Pay' },
  { id: 'google_pay', type: 'google_pay', name: 'Google Pay' },
];

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  items,
  onComplete,
  onBack,
  loading = false,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(shippingMethods[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = selectedShippingMethod.price;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) newErrors.email = 'Email is invalid';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone is required';
    if (!shippingAddress.address1.trim()) newErrors.address1 = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    if (selectedPaymentMethod.type !== 'card') return true;

    const newErrors: Record<string, string> = {};
    
    if (!cardDetails.number.trim()) newErrors.cardNumber = 'Card number is required';
    if (!cardDetails.expiry.trim()) newErrors.cardExpiry = 'Expiry date is required';
    if (!cardDetails.cvc.trim()) newErrors.cardCvc = 'CVC is required';
    if (!cardDetails.name.trim()) newErrors.cardName = 'Cardholder name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateShipping()) return;
    if (currentStep === 1 && !validatePayment()) return;
    
    if (currentStep < checkoutSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleComplete = async () => {
    const checkoutData: CheckoutData = {
      items,
      shipping: shippingAddress,
      paymentMethod: selectedPaymentMethod,
      shippingMethod: selectedShippingMethod
    };
    
    await onComplete(checkoutData);
  };

  const renderShippingStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Shipping Information</h2>
        <p className="text-muted-foreground">Enter your shipping address and contact details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          value={shippingAddress.firstName}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
          error={errors.firstName}
          required
          leftIcon={<User className="h-4 w-4" />}
        />
        <Input
          label="Last Name"
          value={shippingAddress.lastName}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
          error={errors.lastName}
          required
          leftIcon={<User className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email Address"
          type="email"
          value={shippingAddress.email}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
          leftIcon={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Phone Number"
          type="tel"
          value={shippingAddress.phone}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
          error={errors.phone}
          required
          leftIcon={<Phone className="h-4 w-4" />}
        />
      </div>

      <Input
        label="Street Address"
        value={shippingAddress.address1}
        onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
        error={errors.address1}
        required
        leftIcon={<MapPin className="h-4 w-4" />}
      />

      <Input
        label="Apartment, suite, etc. (optional)"
        value={shippingAddress.address2}
        onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
        leftIcon={<MapPin className="h-4 w-4" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          value={shippingAddress.city}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
          error={errors.city}
          required
        />
        <Input
          label="State"
          value={shippingAddress.state}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
          error={errors.state}
          required
        />
        <Input
          label="ZIP Code"
          value={shippingAddress.zipCode}
          onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
          error={errors.zipCode}
          required
        />
      </div>

      {/* Shipping Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Method</h3>
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <Card
              key={method.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selectedShippingMethod.id === method.id && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => setSelectedShippingMethod(method)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                      selectedShippingMethod.id === method.id 
                        ? 'border-primary bg-primary' 
                        : 'border-border'
                    )}>
                      {selectedShippingMethod.id === method.id && (
                        <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.estimatedDays}</p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatPrice(method.price)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
        <p className="text-muted-foreground">Choose how you'd like to pay for your order</p>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedPaymentMethod.id === method.id && 'ring-2 ring-primary bg-primary/5'
            )}
            onClick={() => setSelectedPaymentMethod(method)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                  selectedPaymentMethod.id === method.id 
                    ? 'border-primary bg-primary' 
                    : 'border-border'
                )}>
                  {selectedPaymentMethod.id === method.id && (
                    <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
                <span className="font-medium">{method.name}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card Details Form */}
      {selectedPaymentMethod.type === 'card' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Card Details</h3>
            
            <Input
              label="Card Number"
              value={cardDetails.number}
              onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
              error={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              required
              leftIcon={<CreditCard className="h-4 w-4" />}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                error={errors.cardExpiry}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVC"
                value={cardDetails.cvc}
                onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                error={errors.cardCvc}
                placeholder="123"
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>

            <Input
              label="Cardholder Name"
              value={cardDetails.name}
              onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
              error={errors.cardName}
              placeholder="John Doe"
              required
              leftIcon={<User className="h-4 w-4" />}
            />
          </CardContent>
        </Card>
      )}

      {/* Digital Wallet Message */}
      {selectedPaymentMethod.type !== 'card' && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You will be redirected to {selectedPaymentMethod.name} to complete your payment securely.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Order</h2>
        <p className="text-muted-foreground">Please review your order before completing your purchase</p>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Order Items ({items.length})</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 object-cover rounded-lg border border-border"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                {item.variant && (
                  <p className="text-sm text-muted-foreground">{item.variant}</p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Shipping Address</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
            <p>{shippingAddress.address1}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
            <p className="pt-2 text-muted-foreground">{shippingAddress.email}</p>
            <p className="text-muted-foreground">{shippingAddress.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Payment Method</h3>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{selectedPaymentMethod.name}</p>
            {selectedPaymentMethod.type === 'card' && cardDetails.number && (
              <p className="text-sm text-muted-foreground">•••• •••• •••• {cardDetails.number.slice(-4)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Shipping Method</h3>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{selectedShippingMethod.name}</p>
            <p className="text-sm text-muted-foreground">{selectedShippingMethod.estimatedDays}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderShippingStep();
      case 1:
        return renderPaymentStep();
      case 2:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto p-4', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {checkoutSteps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const StepIcon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-green-100 text-green-700',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}>
                    <StepIcon className="h-4 w-4" />
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                  {index < checkoutSteps.length - 1 && (
                    <div className={cn(
                      'h-px w-16 mx-4',
                      isCompleted ? 'bg-green-300' : 'bg-border'
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div>{renderStep()}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div>
              {currentStep > 0 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
              ) : onBack ? (
                <Button
                  variant="outline"
                  onClick={onBack}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Back to Cart
                </Button>
              ) : null}
            </div>

            <div>
              {currentStep < checkoutSteps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  loading={loading}
                  size="lg"
                  className="font-medium"
                >
                  Complete Order
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Order Summary</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Secure 256-bit SSL encryption</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
