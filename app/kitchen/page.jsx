"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchOrders();
    const role = localStorage.getItem("role"); // Fetch role from localStorage
    setUserRole(role);
  }, []);

  const fetchOrders = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let fetchedOrders = response.data?.data || [];

      fetchedOrders = fetchedOrders.map((order) => ({
        ...order,
        order: order.order.map((item) => ({
          ...item,
          item_status: item.item_status || "Ordered",
        })),
      }));

      const filteredOrders = fetchedOrders.filter(
        (order) =>
          order.Bill_Status !== "Paid" &&
          order.order.some((item) => item.item_status !== "Placed")
      );

      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (documentId, itemIndex, newStatus) => {
    const token = localStorage.getItem("token");
    const orderToUpdate = orders.find((order) => order.documentId === documentId);
    if (!orderToUpdate) return;

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

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.documentId === documentId ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  // Define available statuses based on user role
  const getStatusOptions = () => {
    switch (userRole) {
      case "admin":
        return ["Ordered", "Preparing", "Prepared", "Placed"];
      case "chef":
        return ["Ordered", "Preparing", "Prepared"];
      case "waiter":
        return ["Prepared", "Placed"];
      default:
        return [];
    }
  };

  return (
    <div className="p-5 h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Kitchen Orders</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders available</p>
      ) : (
        <div className="overflow-x-auto w-full max-w-full h-full flex justify-center items-center">
          <table className="min-w-full bg-white border border-gray-300 h-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Bill No.</th>
                <th className="border px-4 py-2">Table </th>
                <th className="border px-4 py-2">Item Name</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Request</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.order
                  .filter((item) => item.item_status !== "Placed") // Exclude "Placed" items
                  .map((item, index) => (
                    <tr key={`${order.documentId}-${index}`} className="border-t">
                      <td className="border px-4 py-2">{order.Bill_no}</td>
                      <td className="border px-4 py-2">{order.table_category} - {order.table_number}</td>
                      <td className="border px-4 py-2">{item.item_name}</td>
                      <td className="border px-4 py-2">{item.quantity}</td>
                      <td className="border px-4 py-2">{item.special_request || "None"}</td>
                      <td className="border px-4 py-2">
                        <select
                          className="p-1 border rounded-md"
                          value={item.item_status}
                          onChange={(e) => updateItemStatus(order.documentId, index, e.target.value)}
                        >
                          {getStatusOptions().map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default KitchenPage;
