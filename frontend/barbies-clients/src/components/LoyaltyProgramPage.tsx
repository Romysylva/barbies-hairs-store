"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function LoyaltyProgramPage() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-muted-foreground">
          Track your points, rewards, and membership benefits.
        </p>
      </div>

      {/* Tabs for Sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="benefits">Tier Benefits</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
        </TabsList>

        {/* Loyalty Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current Tier</span>
                <Badge variant="secondary">Gold Member</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Points</span>
                <span className="text-lg font-semibold">2,450 pts</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Progress to next tier:
                </p>
                <Progress value={70} />
                <p className="text-xs text-muted-foreground mt-1">
                  1,050 points to Platinum
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "₦5,000 Voucher", points: 1000 },
                { title: "Free Shipping", points: 500 },
                { title: "Exclusive Hair Kit", points: 2000 },
              ].map((reward, i) => (
                <Card key={i} className="p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{reward.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reward.points} pts
                    </p>
                  </div>
                  <Button className="mt-4 w-full">Redeem</Button>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tier Benefits */}
        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Tier Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { tier: "Silver", perks: ["5% discount", "Birthday gift"] },
                {
                  tier: "Gold",
                  perks: ["10% discount", "Free shipping", "Priority support"],
                },
                {
                  tier: "Platinum",
                  perks: [
                    "15% discount",
                    "Exclusive gifts",
                    "VIP events",
                    "Free styling sessions",
                  ],
                },
              ].map((tier, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-semibold mb-2">{tier.tier}</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {tier.perks.map((perk, idx) => (
                      <li key={idx}>{perk}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  date: "Aug 25, 2025",
                  activity: "Order #1234",
                  points: "+250",
                },
                {
                  date: "Aug 10, 2025",
                  activity: "Redeemed Free Shipping",
                  points: "-500",
                },
                {
                  date: "Jul 30, 2025",
                  activity: "Order #1199",
                  points: "+180",
                },
              ].map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="text-sm font-medium">{entry.activity}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.date}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      entry.points.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.points}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
