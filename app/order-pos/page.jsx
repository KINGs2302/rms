"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");
  
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data?.data) {
        // Filter out orders where Bill_Status is "Paid"
        const unpaidOrders = response.data.data.filter(order => order.Bill_Status !== "Paid");
        setOrders(unpaidOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  

  const handleTableClick = (category, table) => {
    router.push(`/order-pos/order-menu?category=${category.name}&table=${table}`);
  };

  // Define the handleEditOrder function
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

      {/* Orders Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Placed Orders</h2>
        {orders.map((order) => (
          <div key={order.id} className="mb-6 p-4 border rounded-lg shadow">
            <h3 className="text-md font-semibold">
              Table: {order.table_category} - {order.table_number}
            </h3>
            <ul className="mt-2">
              {order.order.map((item, index) => (
                <li key={index} className="flex justify-between mt-2">
                  <span>{item.item_name} ({item.quantity})</span>
                  <span>{item.item_status}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <span>Total: ${order.Total}</span>
              <span>Bill Status: {order.Bill_Status}</span>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => handleEditOrder(order)}
              >
                Edit Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </Suspense>
  );
}