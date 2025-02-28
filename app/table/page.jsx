"use client";

import { useState, useEffect } from "react";
import Navbar from "../dashboard/navbar/page";

export default function table() {
  const [active, setActive] = useState("Table");
  return (
    <>
      <div className="md:w-64">
        <Navbar active={active} setActive={setActive} />
      </div>
      <div>table</div>
    </>
  );
}
