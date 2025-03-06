"use client";

import { useState, useEffect } from "react";
import Navbar from "../dashboard/navbar/page";

export default function OrderPOS() {
  const [active, setActive] = useState("Kitchen");

  useEffect(() => {
    // Function to enter fullscreen mode
    const enterFullScreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen(); // Firefox
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(); // Chrome, Safari, Opera
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen(); // IE/Edge
      }
    };

    // Enter fullscreen when the component mounts
    enterFullScreen();
  }, []);

  return (
    <>
      <div className="md:w-64">
      </div>
      <div>order-pos</div>
    </>
  );
}
