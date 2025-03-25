"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";


import { useSearchParams } from "next/navigation";
import axios from "axios"; // ✅ Import Axios

function OrderMenus() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table");
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([
    { id: "all", category: "All" },
  ]);
  const [order, setOrder] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tableNumber, setTableNumber] = useState("Unknown");
  const router = useRouter();

  useEffect(() => {
    if (table) {
      setTableNumber(table);
    }
  }, [table]);

  useEffect(() => {
    const fetchData = async () => {
      const restro_name = localStorage.getItem("restroname");
      const token = localStorage.getItem("token");

      try {
        const [menuResponse, categoryResponse] = await Promise.all([
          fetch(
            `https://restro-backend-0ozo.onrender.com/api/menus?populate=*&filters[restro_name][$eq]=${restro_name}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `https://restro-backend-0ozo.onrender.com/api/categories?filters[restro_name][$eq]=${restro_name}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const menuData = await menuResponse.json();
        const categoryData = await categoryResponse.json();

        setMenus(menuData.data || []);
        setCategories([
          { id: "all", category: "All" },
          ...(categoryData.data || []),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredMenu =
    selectedCategory === "All"
      ? menus
      : menus.filter((item) => item.category.category === selectedCategory);

  const handleAddToOrder = (item) => {
    setOrder((prev) => ({
      ...prev,
      [item.id]: prev[item.id] ? prev[item.id] + 1 : 1,
    }));
  };

  const handleRemoveFromOrder = (item) => {
    setOrder((prev) => {
      const newOrder = { ...prev };
      if (newOrder[item.id] > 1) {
        newOrder[item.id] -= 1;
      } else {
        delete newOrder[item.id];
      }
      return newOrder;
    });
  };

  const handlePlaceOrder = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");
  
    try {
      // Fetch tables data
      const tableResponse = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/tables?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const tables = tableResponse.data?.data || [];
      
      // Determine table category dynamically
      let table_category = "General"; // Default category if not found
      for (const table of tables) {
        if (table.no_of_table && parseInt(table.no_of_table) >= parseInt(tableNumber)) {
          table_category = table.table_category;
          break;
        }
      }
  
      const orderDetails = Object.keys(order).map((itemId) => {
        const item = menus.find((menu) => menu.id == itemId);
        return {
          item_name: item.item_name,
          quantity: order[itemId],
          price: item.price * order[itemId],
          item_status: "Placed",
          special_request: "",
        };
      });
  
      const totalAmount = orderDetails.reduce(
        (total, item) => total + item.price,
        0
      );
  
      const orderPayload = {
        data: {
          restro_name,
          table_category, // Dynamically assigned category
          table_number: tableNumber,
          order: orderDetails,
          Total: totalAmount,
          Bill_Status: "Unpaid",
        },
      };
  
      const response = await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/poses",
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Order Placed Successfully:", response.data);
      alert("Order Placed Successfully!");
      router.push("/order-pos");
      
      setOrder({});
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };
  
  

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-full w-full">
        <div className="bg-gray-300 text-center py-2 text-lg font-semibold">
          Table Number: {tableNumber}
        </div>

        <div className="flex-grow flex">
          <aside className="w-1/6 bg-gray-200 h-full flex flex-col">
            <h2 className="text-xl p-5 text-right font-semibold text-gray-800">
              Categories
            </h2>
            <div className="flex-1 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 w-full text-right rounded-r-full transition-all duration-300 ${
                    selectedCategory === cat.category
                      ? "bg-gray-700 text-white text-xl font-bold border-blue-500 border-2"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          </aside>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 w-5/6 max-h-20">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-md text-center"
              >
                {item.image?.url && (
                  <img
                    src={item.image.url}
                    alt={item.item_name}
                    className="rounded-full mx-auto w-24 h-24"
                  />
                )}
                <h3 className="text-lg font-semibold mt-3">
                  {item.item_name} -{" "}
                  <span className="text-red-500 font-bold">
                    {item.price}/- Rs.
                  </span>
                </h3>
                <p className="text-gray-600">
                  Category: {item.category?.category}
                </p>

                <div className="flex justify-center items-center mt-2 space-x-3">
                  <button
                    className="bg-red-400 text-white px-3 py-1 rounded-lg"
                    onClick={() => handleRemoveFromOrder(item)}
                    disabled={!order[item.id]}
                  >
                    ➖
                  </button>
                  <span className="text-lg font-semibold">
                    {order[item.id] || 0}
                  </span>
                  <button
                    className="bg-green-400 text-white px-3 py-1 rounded-lg"
                    onClick={() => handleAddToOrder(item)}
                  >
                    ➕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 p-5">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <ul>
            {Object.keys(order).map((itemId) => {
              const item = menus.find((menu) => menu.id == itemId);
              return (
                <li key={itemId} className="flex justify-between text-lg">
                  <span>
                    {item.item_name} (x{order[itemId]})
                  </span>
                  <span className="font-semibold text-green-600">
                    {item.price * order[itemId]} Rs.
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-between text-xl font-bold mt-4 border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">
              {Object.keys(order).reduce((total, itemId) => {
                const item = menus.find((menu) => menu.id == itemId);
                return total + item.price * order[itemId];
              }, 0)}{" "}
              Rs.
            </span>
          </div>

          <div className="text-right mt-4">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default function OrderMenu() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderMenus />
    </Suspense>
  );
};
