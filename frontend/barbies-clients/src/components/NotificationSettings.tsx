// src/pages/account/NotificationSettings.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Separator } from "@/components/ui/Sepaarator";

export default function NotificationSettings() {
  const notifications = [
    {
      id: "email",
      label: "Email Notifications",
      description: "Get order updates, promotions, and alerts via email.",
      enabled: true,
    },
    {
      id: "sms",
      label: "SMS Notifications",
      description: "Receive important updates through text messages.",
      enabled: false,
    },
    {
      id: "push",
      label: "Push Notifications",
      description: "Stay updated with instant notifications on your device.",
      enabled: true,
    },
    {
      id: "offers",
      label: "Special Offers",
      description: "Be the first to know about sales, discounts, and deals.",
      enabled: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Manage Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {notifications.map((item, index) => (
            <div key={item.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch defaultChecked={item.enabled} />
              </div>
              {index !== notifications.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
