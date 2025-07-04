"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);

    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const fetchOrders = async () => {
    setSecondsLeft(30); // Reset timer

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

      let filteredOrders = fetchedOrders.filter((order) => order.Bill_Status !== "Paid");

      if (userRole === "waiter") {
        filteredOrders = filteredOrders.filter((order) =>
          order.order.some((item) => item.item_status === "Prepared")
        );
      }

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
        prevOrders
          .map((order) =>
            order.documentId === documentId ? updatedOrder : order
          )
          .filter((order) =>
            order.order.some((item) =>
              userRole === "waiter"
                ? item.item_status === "Prepared"
                : item.item_status !== "Served"
            )
          )
      );
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const getStatusOptions = () => {
    switch (userRole) {
      case "admin":
        return ["Ordered", "Preparing", "Prepared", "Served"];
      case "chef":
        return ["Ordered", "Preparing", "Prepared"];
      case "waiter":
        return ["Prepared", "Served"];
      default:
        return [];
    }
  };

  const getRowClass = (status) => {
    if (status === "Preparing") return "bg-green-200";
    if (status === "Prepared") return "bg-yellow-200";
    return "";
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div className="p-5 w-full h-screen flex flex-col items-center bg-gray-100 overflow-hidden relative">

      {/* Fullscreen Toggle Button */}
      <div className="fixed top-4 right-4 z-50 sm:top-4 sm:right-4 top-2 right-2">
        <button
          onClick={toggleFullscreen}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-md transition-all text-xs sm:text-sm font-medium"
        >
          {isFullscreen ? "Exit Full Screen" : "Full Screen"}
        </button>
      </div>


      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
        Kitchen Orders
      </h1>

      {/* Timer UI */}
      <div className="w-full max-w-5xl mb-4">
        <div className="text-sm text-gray-600 mb-1">
          Refreshing in {secondsLeft}s
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      {/* Orders Table or Loading */}
      {loading ? (
        <div className="w-full max-w-5xl space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-lg text-gray-600">No orders available</p>
      ) : (
        <div className="w-full max-w-5xl overflow-auto max-h-[70vh] border rounded-lg shadow">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">Bill No.</th>
                <th className="border px-4 py-2">Table</th>
                <th className="border px-4 py-2">Item Name</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Request</th>
                <th className="border px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) =>
                order.order
                  .filter((item) => {
                    if (item.item_status === "Served") return false;
                    if (userRole === "waiter") return item.item_status === "Prepared";
                    return true;
                  })
                  .map((item, index) => (
                    <tr
                      key={`${order.documentId}-${index}`}
                      className={`border-t ${getRowClass(item.item_status)}`}
                    >
                      <td className="border px-4 py-2">{order.Bill_no}</td>
                      <td className="border px-4 py-2">
                        {order.table_category} - {order.table_number}
                      </td>
                      <td className="border px-4 py-2">{item.item_name}</td>
                      <td className="border px-4 py-2">{item.quantity}</td>
                      <td className="border px-4 py-2">
                        {item.special_request || "None"}
                      </td>
                      <td className="border px-4 py-2">
                        <select
                          className="p-1 border rounded-md"
                          value={item.item_status}
                          onChange={(e) =>
                            updateItemStatus(order.documentId, index, e.target.value)
                          }
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
