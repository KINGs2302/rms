"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./navbar/page";

export default function Dashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Dashboard");
  const [loginUser, setLoginUser] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      axios
        .get("https://restro-backend-0ozo.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.data.valid) {
            localStorage.removeItem("token");
            router.replace("/");
          } else {
            setLoginUser(localStorage.getItem("loginuser") || "User");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          router.replace("/");
        });
    }
  }, [router]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Navbar active={active} setActive={setActive} />
      <main className="flex flex-col p-5 justify-center items-center w-screen h-screen">
        <h1 className="text-3xl font-semibold">{active}</h1>
        <p>Welcome to the {active}, {loginUser}!</p>
      </main>
    </div>
  );
}
