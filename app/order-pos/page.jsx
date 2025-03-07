"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function OrderPOS() {
  const [categorie, setCategorie] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchcategorie();
  }, []);

  // Fetch categories from API
  const fetchcategorie = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/tables?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        const formattedcategorie = response.data.data.map((item) => ({
          id: item.id,
          name: item.table_category, // Category Name
          tables: Array.from({ length: item.no_of_table }, (_, i) => i + 1), // Table Numbers
          documentId: item.documentId,
        }));
        setCategorie(formattedcategorie);
      }
    } catch (error) {
      console.error("Error fetching table categories:", error);
    }
  };

  const handleTableClick = (category, table) => {
    // Navigate with category & table as query parameters
    router.push(`/order-pos/order-menu?category=${category.name}&table=${table}`);
  };

  return (
    <div className="w-full h-screen p-4 overflow-auto">
      <div className="grid grid-cols-2 md:grid-cols-8 gap-4 p-2">
        {categorie.map((category) => (
          <div
            key={category.id}
            className={
              category.tables.length > 5 ? "overflow-y-auto max-h-60 w-max flex justify-between" : ""
            }
          >
            {category.tables.map((table) => (
              <div
                key={`${category.documentId}-${table}`}
                className="flex flex-col items-center justify-center w-20 h-20 border-2 rounded-lg shadow bg-white m-2 cursor-pointer"
                onClick={() => handleTableClick(category, table)}
              >
                <span className="text-sm font-medium">{category.name}:- table-{table}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
