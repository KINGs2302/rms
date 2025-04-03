"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X, Home, Layout, List, Table, ShoppingCart, DollarSign, Users, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar({ setActive }) {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActiveState] = useState("Dashboard"); // Local state for active item
  const router = useRouter();

  useEffect(() => {
    const savedActive = localStorage.getItem("active");
    if (savedActive) {
      setActiveState(savedActive);
    }
  }, []);

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
    admin: [
      { label: "Dashboard", icon: <Home /> },
      { label: "Kitchen", icon: <Layout /> },
      { label: "Menu", icon: <List /> },
      { label: "Table", icon: <Table /> },
      { label: "Order POS", icon: <ShoppingCart /> },
      { label: "Billing", icon: <DollarSign /> },
      { label: "Staff", icon: <Users /> },
      { label: "Profile", icon: <User /> },
      { label: "Settings", icon: <Settings /> }
    ],
    chef: [
      { label: "Dashboard", icon: <Home /> },
      { label: "Kitchen", icon: <Layout /> },
      { label: "Profile", icon: <User /> }
    ],
    waiter: [
      { label: "Dashboard", icon: <Home /> },
      { label: "Kitchen", icon: <Layout />},
      { label: "Order POS", icon: <ShoppingCart /> },
      { label: "Profile", icon: <User /> }
    ]
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

  const handleSetActive = (item) => {
    setActiveState(item);
    localStorage.setItem("active", item); // Save active state to localStorage
    setIsOpen(false);
  };

  if (loading) {
    const skeletonCount = roleLinks[userRole]?.length || 9;
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="space-y-3 p-5 my-10">
          {[...Array(skeletonCount)].map((_, index) => (
            <Skeleton key={index} className="h-4 w-52 bg-slate-400 p-4 rounded-md" />
          ))}
        </div>
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
          {links.map(({ label, icon }) => (
            <li key={label}>
              <Link
                href={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center p-2 rounded-md text-lg font-medium ${active === label ? "bg-gray-700" : "hover:bg-gray-800"
                  }`}
                onClick={() => handleSetActive(label)}
              >
                <span className="mr-3">{icon}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          onClick={handleLogout}
          className="w-full mt-5 p-2 bg-red-500 hover:bg-red-600 rounded-md text-lg font-medium"
        >
          Logout
        </button>
      </aside>
    </>
  );
}