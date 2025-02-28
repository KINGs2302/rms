"use client";
import { useState } from "react";

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const loginUser = typeof window !== "undefined" ? localStorage.getItem("loginuser") || "User" : "User";

  return (
    <>
      <h1 className="text-3xl font-semibold">{active}</h1>
      <p>Welcome to the {active}, {loginUser}!</p>
    </>
  );
}
