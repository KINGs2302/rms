"use client";

import { useState, useEffect } from "react";
import Navbar from "../dashboard/navbar/page";

export default function billing() {
  const [active, setActive] = useState("Billing");
  return (
    <>
      <div className="md:w-64">
        <Navbar active={active} setActive={setActive} />
      </div>
      <div>Billing</div>
    </>
  );
}
