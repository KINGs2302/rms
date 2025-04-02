"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdOutlineTableRestaurant } from "react-icons/md";
import { FaDownload } from "react-icons/fa";
import { Folder } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderPOS() {
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchOrders();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  const handleTableClick = (category, table) => {
    router.push(
      `/order-pos/order-menu?category=${category.name}&table=${table}`
    );
  };

  const handleEditOrder = (order) => {
    router.push(`/order-pos/order-menu-edit?orderId=${order.documentId}`);
  };

  return (
    <div className="w-full h-screen p-4 overflow-auto">
      <button
        className="absolute top-4 right-4 bg-gray-700 text-white p-2 rounded-md z-10 hover:bg-gray-700"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? "Exit Full Screen" : "Full Screen"}
      </button>

      {loading ? (
        <div>
          <Skeleton className="text-2xl font-bold mb-2 shadow-sm border rounded-md flex items-center gap-2 p-2 bg-gray-100">
            <Skeleton className="w-5 h-5 text-gray-600" />
            <Skeleton className="w-20 h-4 mt-2" />
          </Skeleton>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-2">
            {Array.from({ length: 28 }).map((_, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center justify-center w-24 h-32 border-2 rounded-lg shadow p-3 m-1"
              >
                <Skeleton className="absolute top-2 left-2 w-6 h-6 rounded-full" />
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="w-16 h-4 mt-2" />
                <Skeleton className="w-20 h-4 mt-1" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category.id} className="mb-6">
            <h2 className="text-2xl font-bold mb-2 shadow-sm border rounded-md flex items-center gap-2 p-2 bg-gray-100">
              <MdOutlineTableRestaurant className="w-5 h-5 text-gray-600" />
              <span className="text-gray-800">{category.name}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-2">
              {category.tables.map((table) => {
                const tableOrder = orders.find(
                  (order) =>
                    order.table_category === category.name &&
                    Number(order.table_number) === Number(table)
                );

                const tableColor = tableOrder
                  ? "bg-yellow-300"
                  : "bg-green-500";

                return (
                  <div
                    key={`${category.documentId}-${table}`}
                    className={`relative flex flex-col items-center justify-center w-24 h-32 border-2 rounded-lg shadow cursor-pointer p-3 m-1 ${tableColor} hover:shadow-lg transition-all`}
                    onClick={() =>
                      tableOrder
                        ? handleEditOrder(tableOrder)
                        : handleTableClick(category, table)
                    }
                  >
                    {tableOrder && (
                      <div className="absolute top-0 w-full text-center bg-yellow-500 text-white text-xs p-1 rounded-t-lg">
                        {tableOrder.time} Min
                      </div>
                    )}
                    <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-white text-black font-bold text-xs rounded-full border">
                      {table}
                    </div>
                    <MdOutlineTableRestaurant className="text-3xl text-white" />
                    <span className="text-sm font-medium mt-2">
                      Table {table}
                    </span>
                    {tableOrder && (
                      <div className="text-xs mt-2 text-center">
                        <p>Total: ₹{tableOrder.Total}</p>
                        <p>Bill: {tableOrder.Bill_Status}</p>
                      </div>
                    )}
                    {tableOrder && (
                      <button className="absolute bottom-[-20] bg-white p-2 rounded-md shadow-lg hover:bg-gray-100">
                        <FaDownload className="text-gray-600" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
