"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../dashboard/navbar/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const router = useRouter();
  const [active, setActive] = useState("Profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const response = await axios.get(
          "https://restro-backend-0ozo.onrender.com/api/users/me?populate[role][fields]=name",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          setUser(response.data);
        } else {
          localStorage.removeItem("token");
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className="flex flex-col md:flex-row min-h-full bg-gray-100">
      <main className="flex flex-col justify-center items-center w-full h-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{active}</h1>
        {loading ? (
          <Skeleton className="w-full max-w-md h-40 rounded-lg" />
        ) : user ? (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold text-gray-900">Username:</span> {user.username}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold text-gray-900">Email:</span> {user.email}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold text-gray-900">Restaurant:</span> {user.restro_name}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <span className="font-semibold text-gray-900">Role:</span> {user.role.name}
              </p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-red-500">Failed to load profile</p>
        )}
      </main>
    </div>
  );
}
