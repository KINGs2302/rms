"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ active, setActive }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch role from localStorage (Simulating API delay)
  useEffect(() => {
    const checkRole = async () => {
      let role;
      while (!role) {
        role = localStorage.getItem("role");
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait & check again
      }
      setUserRole(role);
      setLoading(false);
    };
    checkRole();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/");
  };

  const roleLinks = {
    admin: ["Dashboard", "Kitchen", "Menu", "Table", "Order POS", "Billing", "Staff", "Profile", "Settings"],
    chef: ["Dashboard", "Kitchen", "Profile"],
    waiter: ["Dashboard", "Order POS", "Profile"],
  };

  const links = roleLinks[userRole] || [];

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // 🔄 Show Loading Spinner until role is fetched
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <div className="loader"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed md:relative w-64 h-full bg-gray-900 text-white p-5 z-50 transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <button
          className="md:hidden absolute top-4 right-4"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-5">Dashboard</h2>

        <ul className="space-y-3">
          {links.map((item) => (
            <li key={item}>
              <Link
                href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                className={`block p-2 rounded-md ${
                  active === item ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
                onClick={() => {
                  setActive(item);
                  setIsOpen(false);
                }}
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
    </>
  );
}
