"use client";

import { useState, useEffect } from "react";
import Navbar from "../dashboard/navbar/page";

export default function kitchen() {
  const [active, setActive] = useState("Kitchen");
  return (
    <>
      <div className="md:w-64">
        <Navbar active={active} setActive={setActive} />
      </div>
      <div>kitchen</div>
    </>
  );
}
