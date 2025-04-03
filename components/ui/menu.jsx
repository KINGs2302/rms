import React from "react";

export function Menu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function MenuButton({ children, className, ...props }) {
  return (
    <button className={`px-4 py-2 bg-gray-600 text-white rounded-md ${className}`} {...props}>
      {children}
    </button>
  );
}

export function MenuItem({ children, onClick }) {
  return (
    <div
      className="cursor-pointer px-4 py-2 hover:bg-gray-200"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
