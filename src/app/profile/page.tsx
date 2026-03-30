"use client";

import { UserButton, UserProfile, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { LogOut, Mail, MapPin, Phone, Settings, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderHistory } from "./_components/OrderHistory";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header showSearch={false} />
        <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
          <div className="h-48 w-full bg-muted animate-pulse rounded-2xl" />
          <div className="h-96 w-full bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view your profile
          </h1>
          <Button onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header showSearch={false} />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Profile Header */}
          <section>
            <Card className="border-none shadow-lg overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/30">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-background shadow-xl"
                    />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-1">
                      {user.fullName || user.username || "Marketplace User"}
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>{user.primaryEmailAddress?.emailAddress}</span>
                      </div>
                      {user.primaryPhoneNumber && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>{user.primaryPhoneNumber.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <Button variant="outline" className="gap-2 font-semibold">
                      <Settings className="h-4 w-4" /> Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tabbed Content (Mocked as simple vertical stack for now) */}
          <div className="grid grid-cols-1 gap-8">
            <OrderHistory />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
