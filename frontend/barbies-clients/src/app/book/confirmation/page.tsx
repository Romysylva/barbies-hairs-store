"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardContent,
} from "../../../../../../shared/components/ui/Card";
import { Button } from "../../../../../../shared/components/ui/Button";
import { Badge } from "../../../../../../shared/components/ui/Badge";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Home,
  CalendarCheck,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "BK-12345";

  // Mock booking data
  const bookingData = {
    bookingId: bookingId,
    status: "confirmed",
    services: [
      { name: "Wash & Blow Dry", duration: 45, price: 35 },
      { name: "Deep Conditioning Treatment", duration: 30, price: 25 },
    ],
    date: "2024-02-15",
    time: "14:00",
    stylist: {
      name: "Sophia Martinez",
      title: "Senior Hair Stylist",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b6461f49?w=100&h=100&fit=crop&crop=face",
    },
    salon: {
      name: "Barbie's Hair Salon",
      address: "123 Beauty Avenue, New York, NY 10001",
      phone: "(555) 123-HAIR",
    },
    notes: "Looking for a natural look with volume",
    totalPrice: 60,
    totalDuration: 75,
    bookedAt: new Date().toISOString(),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
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

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const { date: formattedDate, time: formattedTime } = formatDateTime(
    bookingData.date,
    bookingData.time
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-muted-foreground text-lg">
            {` Your appointment has been successfully booked. We can't wait to see
            you!`}
          </p>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Appointment Details</h2>
                  <Badge variant="success">Confirmed</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Booking ID: {bookingData.bookingId}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date & Time */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Date & Time</h4>
                    <p className="text-muted-foreground">{formattedDate}</p>
                    <p className="text-primary font-medium">{formattedTime}</p>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Duration</h4>
                    <p className="text-muted-foreground">
                      Approximately {formatDuration(bookingData.totalDuration)}
                    </p>
                  </div>
                </div>

                {/* Stylist */}
                <div className="flex items-center gap-4">
                  <Image
                    src={bookingData.stylist.avatar}
                    alt={bookingData.stylist.name}
                    className=" rounded-full object-cover border-2 border-border"
                    width={48}
                    height={48}
                  />
                  <div>
                    <h4 className="font-semibold">
                      {bookingData.stylist.name}
                    </h4>
                    <p className="text-muted-foreground">
                      {bookingData.stylist.title}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{bookingData.salon.name}</h4>
                    <p className="text-muted-foreground">
                      {bookingData.salon.address}
                    </p>
                    <p className="text-primary font-medium">
                      {bookingData.salon.phone}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {bookingData.notes && (
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Special Requests</h4>
                      <p className="text-muted-foreground">
                        {bookingData.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Selected Services</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingData.services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(service.duration)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(bookingData.totalPrice)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="justify-start"
                  onClick={() => {
                    // Add to calendar functionality
                    const event = {
                      title: "Hair Appointment at Barbie's",
                      start: `${bookingData.date}T${bookingData.time}:00`,
                      description: `Services: ${bookingData.services.map((s) => s.name).join(", ")}`,
                    };
                    // In a real app, this would create a calendar event
                    alert("Calendar event would be created here");
                  }}
                >
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(`
                      Appointment Details:
                      Date: ${formattedDate}
                      Time: ${formattedTime}
                      Stylist: ${bookingData.stylist.name}
                      Location: ${bookingData.salon.address}
                      Booking ID: ${bookingData.bookingId}
                    `);
                    alert("Appointment details copied to clipboard");
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Share Details
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="justify-start"
                  onClick={() => router.push("/dashboard/bookings")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Need Help?</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Need to reschedule or have questions about your appointment?
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="justify-start"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Salon
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="justify-start"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What to Expect */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold">What to Expect</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Arrive Early</h4>
                <p className="text-sm text-muted-foreground">
                  Please arrive 10-15 minutes before your appointment for
                  check-in.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Consultation</h4>
                <p className="text-sm text-muted-foreground">
                  Your stylist will discuss your hair goals and preferences.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Enjoy Your Service</h4>
                <p className="text-sm text-muted-foreground">
                  Relax and enjoy your professional hair service experience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/dashboard")}
            leftIcon={<Home className="h-4 w-4" />}
          >
            Back to Dashboard
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/book")}
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Book Another Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
