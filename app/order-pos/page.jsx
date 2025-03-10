"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function OrderPOS() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/tables?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        const formattedCategories = response.data.data.map((item) => {
          let tableNo = 1; // Start table number from 1 for each category
          return {
            id: item.id,
            name: item.table_category, // Category Name
            tables: Array.from({ length: item.no_of_table }, () => tableNo++), // Assign unique table numbers
            documentId: item.documentId,
          };
        });
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching table categories:", error);
    }
  };

  const handleTableClick = (category, table) => {
    router.push(`/order-pos/order-menu?category=${category.name}&table=${table}`);
  };

  return (
    <div className="w-full h-screen p-4 overflow-auto">
      {categories.map((category) => (
        <div key={category.id} className="mb-6">
          {/* Category Name */}
          <h2 className="text-lg font-semibold mb-2">{category.name}</h2>

          {/* Table Cards Container */}
          <div
            className={`grid grid-cols-2 md:grid-cols-5 gap-4 p-2 ${
              category.tables.length > 5 ? "overflow-y-auto max-h-60" : ""
            }`}
          >
            {category.tables.map((table) => (
              <div
                key={`${category.documentId}-${table}`}
                className="flex flex-col items-center justify-center w-24 h-24 border-2 rounded-lg shadow bg-white cursor-pointer"
                onClick={() => handleTableClick(category, table)}
              >
                <span className="text-sm font-medium">
                  {category.name} - Table {table}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
