"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar({ active, setActive, userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loginuser");
    localStorage.removeItem("restroname");
    router.replace("/"); // ✅ Smoother navigation
  };

  // Define role-based navigation in an object for cleaner code
  const roleLinks = {
    admin: ["Dashboard", "Kitchen", "Menu", "Table", "Order POS", "Billing", "Staff", "Profile", "Settings"],
    chef: ["Dashboard", "Kitchen", "Profile", "Settings"],
    waiter: ["Dashboard", "Menu", "Table", "Profile", "Settings"],
  };

  const links = roleLinks[userRole] || [];

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Hamburger Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-full bg-gray-900 text-white p-5 z-50 transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <button className="md:hidden absolute top-4 right-4" onClick={() => setIsOpen(false)}>
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
