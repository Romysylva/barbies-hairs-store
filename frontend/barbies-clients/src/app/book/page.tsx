"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../../shared/components/layout/DashboardLayout";
import {
  ServiceSelector,
  Service,
} from "../../../../../shared/components/booking/ServiceSelector";
import { DateTimePicker } from "../../../../../shared/components/booking/DateTimePicker";
import {
  StaffSelector,
  Staff,
} from "../../../../../shared/components/booking/StaffSelector";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../../../../shared/components/ui/Card";
import { Button } from "../../../../../shared/components/ui/Button";
import { Badge } from "../../../../../shared/components/ui/Badge";
import { Input } from "../../../../../shared/components/ui/Input";
import {
  Calendar,
  Clock,
  User,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { cn } from "../../../../../shared/components/utils";

const mockServices: Service[] = [
  {
    id: "1",
    name: "Wash & Blow Dry",
    description: "Professional hair washing and blow-dry styling",
    duration: 45,
    price: 35,
    category: "Styling",
    rating: 4.8,
    reviewCount: 124,
    features: ["Scalp massage", "Premium products", "Heat protection"],
    staffIds: ["1", "2", "3"],
    isPopular: true,
    image:
      "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=300&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Cut & Style",
    description: "Professional haircut with styling",
    duration: 60,
    price: 55,
    category: "Cutting",
    rating: 4.9,
    reviewCount: 89,
    features: ["Consultation", "Precision cutting", "Styling"],
    staffIds: ["1", "2"],
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Hair Color",
    description: "Full hair coloring service with premium products",
    duration: 120,
    price: 85,
    category: "Coloring",
    rating: 4.7,
    reviewCount: 67,
    features: ["Color consultation", "Premium dyes", "Aftercare"],
    staffIds: ["1", "3"],
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=300&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Highlights",
    description: "Professional highlighting with foil technique",
    duration: 90,
    price: 75,
    category: "Coloring",
    rating: 4.6,
    reviewCount: 45,
    features: ["Foil highlights", "Color matching", "Toning"],
    staffIds: ["2", "3"],
    image:
      "https://images.unsplash.com/photo-1605980842-5e1d1a7b4b1a?w=300&h=200&fit=crop",
  },
  {
    id: "5",
    name: "Deep Conditioning Treatment",
    description: "Intensive hair treatment for damaged or dry hair",
    duration: 30,
    price: 25,
    category: "Treatment",
    rating: 4.9,
    reviewCount: 156,
    features: ["Keratin treatment", "Moisture restoration", "Heat therapy"],
    staffIds: ["1", "2", "3"],
    isPopular: true,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop",
  },
  {
    id: "6",
    name: "Bridal Package",
    description: "Complete bridal hair and makeup package",
    duration: 180,
    price: 150,
    category: "Special",
    rating: 5.0,
    reviewCount: 23,
    features: ["Trial session", "Day-of styling", "Touch-up kit"],
    staffIds: ["1"],
    image:
      "https://images.unsplash.com/photo-1594736797933-d0eb9cd34584?w=300&h=200&fit=crop",
  },
];

const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Sophia Martinez",
    title: "Senior Hair Stylist",
    bio: "With over 8 years of experience, Sophia specializes in color transformations and bridal styling.",
    rating: 4.9,
    reviewCount: 234,
    experience: 8,
    specialties: ["Color", "Bridal", "Cutting"],
    serviceIds: ["1", "2", "3", "5", "6"],
    availability: {
      monday: ["09:00", "10:00", "14:00", "15:00"],
      tuesday: ["09:00", "10:30", "13:00", "14:30"],
      wednesday: ["09:00", "11:00", "14:00", "16:00"],
      thursday: ["10:00", "11:30", "13:00", "15:30"],
      friday: ["09:00", "10:00", "14:00", "15:00"],
      saturday: ["09:00", "11:00", "13:00", "15:00"],
    },
    isTopRated: true,
    languages: ["English", "Spanish"],
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b6461f49?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Emma Thompson",
    title: "Hair Colorist",
    bio: "Emma is passionate about creative color work and has trained with top colorists in Europe.",
    rating: 4.8,
    reviewCount: 189,
    experience: 6,
    specialties: ["Highlights", "Balayage", "Creative Color"],
    serviceIds: ["1", "2", "4", "5"],
    availability: {
      monday: ["10:00", "11:30", "15:00", "16:30"],
      tuesday: ["09:00", "10:00", "14:00", "15:00"],
      wednesday: ["10:30", "12:00", "15:00", "16:30"],
      thursday: ["09:00", "10:30", "14:30", "16:00"],
      friday: ["09:30", "11:00", "15:30", "17:00"],
      saturday: ["10:00", "12:00", "14:00", "16:00"],
    },
    languages: ["English"],
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Isabella Chen",
    title: "Hair Stylist",
    bio: "Isabella brings 5 years of experience in modern cuts and styling techniques.",
    rating: 4.7,
    reviewCount: 156,
    experience: 5,
    specialties: ["Modern Cuts", "Styling", "Treatments"],
    serviceIds: ["1", "3", "4", "5"],
    availability: {
      monday: ["09:00", "11:00", "13:30", "15:00"],
      tuesday: ["10:00", "11:30", "14:00", "16:00"],
      wednesday: ["09:30", "11:00", "14:30", "16:00"],
      thursday: ["09:00", "10:00", "13:00", "15:30"],
      friday: ["10:30", "12:00", "14:00", "15:30"],
      saturday: ["09:00", "10:30", "13:30", "15:00"],
    },
    languages: ["English", "Mandarin"],
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
];

const bookingSteps = [
  { id: "services", title: "Services", icon: User },
  { id: "datetime", title: "Date & Time", icon: Calendar },
  { id: "staff", title: "Stylist", icon: User },
  { id: "details", title: "Details", icon: MessageSquare },
  { id: "confirm", title: "Confirm", icon: Check },
];

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices((prev) => [...prev, serviceId]);
  };

  const handleServiceRemove = (serviceId: string) => {
    setSelectedServices((prev) => prev.filter((id) => id !== serviceId));
  };

  const handleNext = () => {
    if (currentStep < bookingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In real app, this would create the booking
      console.log("Booking created:", {
        services: selectedServices,
        date: selectedDate,
        time: selectedTime,
        staff: selectedStaff,
        notes,
      });

      // Redirect to confirmation page
      router.push("/book/confirmation");
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedServices.length > 0;
      case 1:
        return selectedDate && selectedTime;
      case 2:
        return selectedStaff;
      case 3:
        return true; // Notes are optional
      default:
        return false;
    }
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = mockServices.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = mockServices.find((s) => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ServiceSelector
            services={mockServices}
            selectedServices={selectedServices}
            onServiceSelect={handleServiceSelect}
            onServiceRemove={handleServiceRemove}
            categories={[
              "Styling",
              "Cutting",
              "Coloring",
              "Treatment",
              "Special",
            ]}
          />
        );
      case 1:
        return (
          <DateTimePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />
        );
      case 2:
        return (
          <StaffSelector
            staff={mockStaff}
            selectedStaff={selectedStaff}
            onStaffSelect={setSelectedStaff}
            selectedServices={selectedServices}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Additional Details
              </h2>
              <p className="text-muted-foreground">
                Share any special requests or preferences for your appointment
              </p>
            </div>

            <div className="max-w-2xl">
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes or Special Requests
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about your hair goals, any allergies, or special requests..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This information helps our stylists prepare for your appointment
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Confirm Your Booking
              </h2>
              <p className="text-muted-foreground">
                Please review your appointment details before confirming
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Selected Services</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedServices.map((serviceId) => {
                    const service = mockServices.find(
                      (s) => s.id === serviceId
                    );
                    if (!service) return null;
                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDuration(service.duration)}
                          </p>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between font-semibold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Appointment Details</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDate?.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {selectedTime &&
                          (() => {
                            const [hours, minutes] = selectedTime.split(":");
                            const hour = parseInt(hours);
                            const period = hour >= 12 ? "PM" : "AM";
                            const displayHour =
                              hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                            return `${displayHour}:${minutes} ${period}`;
                          })()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Stylist</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedStaff === "any"
                          ? "Any available stylist"
                          : mockStaff.find((s) => s.id === selectedStaff)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        Approximately {formatDuration(getTotalDuration())}
                      </p>
                    </div>
                  </div>

                  {notes && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Book Your Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule your perfect hair appointment with our expert stylists
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {bookingSteps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.id}
                    className="flex items-center flex-shrink-0"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full transition-all whitespace-nowrap",
                        isActive && "bg-primary text-primary-foreground",
                        isCompleted && "bg-green-100 text-green-700",
                        !isActive &&
                          !isCompleted &&
                          "bg-muted text-muted-foreground"
                      )}
                    >
                      <StepIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">{step.title}</span>
                    </div>
                    {index < bookingSteps.length - 1 && (
                      <div
                        className={cn(
                          "h-px w-12 mx-4 flex-shrink-0",
                          isCompleted ? "bg-green-300" : "bg-border"
                        )}
                      />
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
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                )}
              </div>

              <div>
                {currentStep < bookingSteps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleBooking}
                    loading={loading}
                    disabled={!canProceed()}
                    size="lg"
                    className="font-medium"
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="xl:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <h3 className="text-lg font-semibold">Booking Summary</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Services */}
                {selectedServices.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Services</h4>
                    <div className="space-y-2">
                      {selectedServices.map((serviceId) => {
                        const service = mockServices.find(
                          (s) => s.id === serviceId
                        );
                        if (!service) return null;
                        return (
                          <div
                            key={service.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="truncate pr-2">
                              {service.name}
                            </span>
                            <span className="font-medium">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                {selectedDate && selectedTime && (
                  <div className="pt-3 border-t border-border">
                    <h4 className="font-medium text-sm mb-1">Date & Time</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {selectedTime &&
                        (() => {
                          const [hours, minutes] = selectedTime.split(":");
                          const hour = parseInt(hours);
                          const period = hour >= 12 ? "PM" : "AM";
                          const displayHour =
                            hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          return `${displayHour}:${minutes} ${period}`;
                        })()}
                    </p>
                  </div>
                )}

                {/* Stylist */}
                {selectedStaff && (
                  <div className="pt-3 border-t border-border">
                    <h4 className="font-medium text-sm mb-1">Stylist</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedStaff === "any"
                        ? "Any available stylist"
                        : mockStaff.find((s) => s.id === selectedStaff)?.name}
                    </p>
                  </div>
                )}

                {/* Totals */}
                {selectedServices.length > 0 && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Duration</span>
                      <span>{formatDuration(getTotalDuration())}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
