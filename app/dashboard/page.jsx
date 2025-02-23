"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        router.replace("/");
        return;
      }
  
      try {
        const response = await axios.get(
          "https://restro-backend-0ozo.onrender.com/api/auth/local",
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (!response.data.valid) {
          localStorage.removeItem("token");
          router.replace("/");
        }
      } catch (error) {
        localStorage.removeItem("token");
        router.replace("/");
      }
    };
  
    verifyToken();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("loginuser");
    localStorage.removeItem("token");
    router.replace("/"); // Redirect to login page
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-semibold mb-5">Dashboard</h2>
        <ul className="space-y-3">
          {[
            "Dashboard",
            "Profile",
            "Kitchen",
            "Item Menu",
            "Employee Register",
            "Category",
            "Table",
            "Billing",
            "Setting",
            "Order POS",
          ].map((item) => (
            <li key={item}>
              <Link
                href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                className={`block p-2 rounded-md ${
                  active === item ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
                onClick={() => setActive(item)}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className="w-full mt-5 p-2 bg-red-500 hover:bg-red-600 rounded-md"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-5">
        <h1 className="text-3xl font-semibold">{active}</h1>
        <p>Welcome to the {active} page!</p>
      </main>
    </div>
  );
}
