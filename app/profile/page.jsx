"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../dashboard/navbar/page";


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
          "https://restro-backend-0ozo.onrender.com/api/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data) {
          setUser(response.data); // Assuming response.data contains user details directly
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Navbar active={active} setActive={setActive} />
      <main className="flex flex-col p-5 justify-center items-center w-screen h-screen">
        <h1 className="text-3xl font-semibold">{active}</h1>
        {loading ? (
          <p className="text-lg text-gray-500">Loading profile...</p>
        ) : user ? (
          <div className="bg-white p-5 rounded-md shadow-md">
            <p className="text-lg font-medium">Username: {user.username}</p>
            <p className="text-lg font-medium">Email: {user.email}</p>
            <p className="text-lg font-medium">Restaurant: {user.restro_name}</p>
            <p className="text-lg font-medium">Role: {user.role}</p>
          </div>
        ) : (
          <p className="text-red-500">Failed to load profile</p>
        )}
      </main>
    </div>
  );
}
