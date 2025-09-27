"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, MapPin, Edit, Trash } from "lucide-react";
import { Button } from "../../../../shared/components/ui/Button";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
}

export default function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      fullName: "Promise Sylva",
      phone: "+234 810 123 4567",
      street: "123 Ikot Ekpene Road",
      city: "Uyo",
      state: "Akwa Ibom",
      postalCode: "520001",
      isDefault: true,
    },
    {
      id: "2",
      fullName: "Jane Doe",
      phone: "+234 902 222 3333",
      street: "45 Marina Street",
      city: "Lagos",
      state: "Lagos",
      postalCode: "101001",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Address>({
    id: "",
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (formData.id) {
      // edit existing
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === formData.id ? formData : addr))
      );
    } else {
      // add new
      setAddresses((prev) => [
        ...prev,
        { ...formData, id: String(Date.now()) },
      ]);
    }
    setFormData({
      id: "",
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
    });
    setShowForm(false);
  };

  const handleEdit = (addr: Address) => {
    setFormData(addr);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-500" />
            Address Book
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Address
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <div className="p-4 border rounded-xl space-y-3 bg-gray-50">
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
              />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
              <Input
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street Address"
              />
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
              <Input
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
              />
              <div className="flex gap-3">
                <Button onClick={handleSave} className="w-full">
                  Save
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((addr) => (
              <Card
                key={addr.id}
                className={`p-4 border rounded-xl shadow-sm ${
                  addr.isDefault ? "border-purple-500" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{addr.fullName}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                    <p className="text-sm">{addr.street}</p>
                    <p className="text-sm">
                      {addr.city}, {addr.state}, {addr.postalCode}
                    </p>
                    {addr.isDefault && (
                      <span className="text-xs text-purple-600 font-medium">
                        Default Address
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(addr)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(addr.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
