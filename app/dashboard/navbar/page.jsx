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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
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
                className={`block p-2 rounded-md ${active === item ? "bg-gray-700" : "hover:bg-gray-800"
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
