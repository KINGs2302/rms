"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

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
      console.log(response);
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

  return (
    <div className="p-5 w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Kitchen Orders</h1>
      {loading ? (
        <div className="w-full max-w-5xl space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-lg text-gray-600">No orders available</p>
      ) : (
        <div className="overflow-x-auto w-full max-w-5xl">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Bill No.</th>
                <th className="border px-4 py-2">Item Name</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Request</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.order.map((item, index) => (
                  <tr key={`${order.documentId}-${index}`} className="border-t">
                    <td className="border px-4 py-2">{order.Bill_no}</td>
                    <td className="border px-4 py-2">{item.item_name}</td>
                    <td className="border px-4 py-2">{item.quantity}</td>
                    <td className="border px-4 py-2">{item.special_request || "None"}</td>
                    <td className="border px-4 py-2">
                      <select
                        className="p-1 border rounded-md"
                        value={item.item_status}
                        onChange={(e) => updateItemStatus(order.documentId, index, e.target.value)}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Prepared">Prepared</option>
                        <option value="Ordered">Ordered</option>
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