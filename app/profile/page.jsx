"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FaUser, FaEnvelope, FaUtensils, FaUserShield } from "react-icons/fa";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <main className="flex flex-1 flex-col justify-center items-center p-4 md:p-8 md:w-screen md:max-w-md mx-auto md:h-full ">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile</h1>
        {loading ? (
          <Skeleton className="w-full max-w-md h-40 rounded-lg" />
        ) : user ? (
          <Card className="w-full max-w-md bg-white shadow-lg rounded-lg">
            <CardHeader className="bg-gray-900 text-white rounded-t-lg p-4">
              <CardTitle className="text-xl">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUser className="w-6 h-6 text-gray-900 mr-2" />
                  <span className="font-semibold text-gray-900">Username:</span>
                </div>
                <span className="text-lg font-medium text-gray-700">{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaEnvelope className="w-6 h-6 text-gray-900 mr-2" />
                  <span className="font-semibold text-gray-900">Email:</span>
                </div>
                <span className="text-lg font-medium text-gray-700">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUtensils className="w-6 h-6 text-gray-900 mr-2" />
                  <span className="font-semibold text-gray-900">Restaurant:</span>
                </div>
                <span className="text-lg font-medium text-gray-700">{user.restro_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaUserShield className="w-6 h-6 text-gray-900 mr-2" />
                  <span className="font-semibold text-gray-900">Role:</span>
                </div>
                <span className="text-lg font-medium text-gray-700">{user.role.name}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-red-500">Failed to load profile</p>
        )}
      </main>
    </div>
  );
}