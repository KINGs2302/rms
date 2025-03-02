"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loginUser, setLoginUser] = useState("User");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoginUser(localStorage.getItem("loginuser") || "User");
    }
  }, []);

  return (
    <>
      <h1 className="text-3xl font-semibold">{active}</h1>
      <p>Welcome to the {active}, {loginUser}!</p>
    </>
  );
}
