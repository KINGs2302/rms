"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Fetched Orders:", response.data);
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (documentId, itemIndex, newStatus) => {
    const token = localStorage.getItem("token");

    // Find the order being updated
    const orderToUpdate = orders.find((order) => order.documentId === documentId);
    if (!orderToUpdate) return;

    // Clone and update the item's status
    const updatedOrder = { ...orderToUpdate };
    updatedOrder.order[itemIndex].item_status = newStatus;

    try {
      await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/poses/${documentId}`,
        {
          data: {
            restro_name: updatedOrder.restro_name,
            table_category: updatedOrder.table_category,
            table_number: updatedOrder.table_number,
            order: updatedOrder.order,
            Total: updatedOrder.Total,
            Bill_Status: updatedOrder.Bill_Status,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update UI with new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.documentId === documentId ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.documentId}
              className="bg-white p-4 rounded-lg shadow-md max-h-96 overflow-y-auto"
            >
              <h2 className="text-xl font-semibold">
                Table {order.table_number} ({order.table_category})
              </h2>
              <p className="text-gray-600">Bill No: {order.Bill_no}</p>
              <p className="text-gray-600">Total: ₹{order.Total}</p>
              <p className="text-gray-600">
                Bill Status:{" "}
                <span
                  className={`font-semibold ${
                    order.Bill_Status === "Unpaid" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {order.Bill_Status}
                </span>
              </p>

              <ul className="mt-2 space-y-2">
                {order.order.map((item, index) => (
                  <li key={index} className="border-b py-2 flex flex-col">
                    <p className="font-semibold">{item.item_name}</p>
                    <p className="text-gray-600">
                      ₹{item.price} x {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Request: {item.special_request || "None"}
                    </p>

                    {/* Status Dropdown */}
                    <label className="text-sm font-semibold mt-2">
                      Status:
                      <select
                        className="ml-2 p-1 border rounded-md"
                        value={item.item_status}
                        onChange={(e) => updateItemStatus(order.documentId, index, e.target.value)}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Prepared">Prepared</option>
                        <option value="Ordered">Ordered</option>
                      </select>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenPage;
