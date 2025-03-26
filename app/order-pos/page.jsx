"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { PencilSquareIcon } from "@heroicons/react/24/solid"; // Importing edit icon

export default function OrderPOS() {
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchOrders();
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
          let tableNo = 1;
          return {
            id: item.id,
            name: item.table_category,
            tables: Array.from({ length: item.no_of_table }, () => tableNo++),
            documentId: item.documentId,
          };
        });
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error("Error fetching table categories:", error);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(response);
      if (response.data?.data) {
        const unpaidOrders = response.data.data.filter(
          (order) => order.Bill_Status !== "Paid"
        );
        setOrders(unpaidOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Handle table click
  const handleTableClick = (category, table) => {
    router.push(
      `/order-pos/order-menu?category=${category.name}&table=${table}`
    );
  };

  // Handle order edit click
  const handleEditOrder = (order) => {
    router.push(`/order-pos/order-menu-edit?orderId=${order.documentId}`);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
              {category.tables.map((table) => {
                // Find if an order exists for this table
                const tableOrder = orders.find(
                  (order) =>
                   
                    order.table_category === category.name &&
                    Number(order.table_number) === Number(table)
                );

                // Determine table color
                const tableColor = tableOrder
                  ? "bg-yellow-300"
                  : "bg-green-300";

                return (
                  <div
                    key={`${category.documentId}-${table}`}
                    className={`flex flex-col items-center justify-center w-24 h-24 border-2 rounded-lg shadow cursor-pointer p-2 relative ${tableColor}`}
                    onClick={() => {
                      if (tableOrder) {
                        handleEditOrder(tableOrder); // If an order exists, open edit page
                      } else {
                        handleTableClick(category, table); // Otherwise, open add order page
                      }
                    }}
                  >
                    <span className="text-sm font-medium">Table {table}</span>

                    {/* Display order details if available */}
                    {tableOrder && (
                      <div className="text-xs mt-2 text-center">
                        <p>Total: ₹{tableOrder.Total}</p>
                        <p>Bill: {tableOrder.Bill_Status}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Suspense>
  );
}
