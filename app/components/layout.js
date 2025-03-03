"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import Navbar from "../dashboard/navbar/page";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current route
  const [active, setActive] = useState("Dashboard");
  const [loginUser, setLoginUser] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ Prevent SSR issues

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/"); // Redirect to login if no token
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://restro-backend-0ozo.onrender.com/api/users/me?populate=role",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data || !response.data.role) {
          localStorage.removeItem("token");
          router.replace("/");
        } else {
          const user = response.data;
          setLoginUser(user.username || "User");
          setUserRole(user.role.name);
          localStorage.setItem("role", user.role.name);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        localStorage.removeItem("token");
        router.replace("/");
      }
    };

    fetchUser();
  }, [pathname]); // ✅ Stable dependency (only pathname)

  // Hide Navbar on login page
  const hideNavbar = pathname === "/";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {!hideNavbar && (
        <div>
          <Navbar active={active} setActive={setActive} userRole={userRole} />
        </div>
      )}
      <main className="flex flex-col justify-center items-center w-full h-full">
        {children}
      </main>
    </div>
  );
}
