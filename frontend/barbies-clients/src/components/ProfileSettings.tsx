// src/pages/account/ProfileSettings.tsx
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";

export default function ProfileSettings() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      <p className="text-muted-foreground">
        Manage your personal information and account preferences.
      </p>

      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input id="firstName" placeholder="Enter your first name" />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input id="lastName" placeholder="Enter your last name" />
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <Label>Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>

            {/* Phone */}
            <div className="space-y-2 md:col-span-2">
              <Label>Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 md:col-span-2">
              <Label>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
