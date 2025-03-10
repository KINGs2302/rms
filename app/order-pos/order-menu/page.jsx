"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function OrderMenu() {
  const searchParams = useSearchParams();
  const table = searchParams.get("table"); // Extract table number from URL
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", category: "All" }]);
  const [order, setOrder] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tableNumber, setTableNumber] = useState("Unknown");

  useEffect(() => {
    console.log("Received table prop:", table);
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
        setCategories([{ id: "all", category: "All" }, ...(categoryData.data || [])]);
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

  const handlePlaceOrder = () => {
    const orderDetails = Object.keys(order).map((itemId) => {
      const item = menus.find((menu) => menu.id == itemId);
      return {
        id: item.id,
        name: item.item_name,
        quantity: order[itemId],
        price: item.price * order[itemId],
      };
    });

    console.log("Table Number:", tableNumber);
    console.log("Order Details:", orderDetails);

    alert("Order Placed Successfully!");
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Table Number Display */}
      <div className="bg-gray-300 text-center py-2 text-lg font-semibold">
        Table Number: {tableNumber}
      </div>

      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Sidebar Categories */}
        <aside className="w-1/6 bg-gray-200 h-full flex flex-col">
          <h2 className="text-xl p-5 text-right font-semibold text-gray-800">Categories</h2>
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

        {/* Menu Items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 w-5/6 max-h-20">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-md text-center">
              {item.image?.url && (
                <img src={item.image.url} alt={item.item_name} className="rounded-full mx-auto w-24 h-24" />
              )}
              <h3 className="text-lg font-semibold mt-3">
                {item.item_name} - <span className="text-red-500 font-bold">{item.price}/- Rs.</span>
              </h3>
              <p className="text-gray-600">Category: {item.category?.category}</p>

              {/* Add & Remove Buttons */}
              <div className="flex justify-center items-center mt-2 space-x-3">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-lg"
                  onClick={() => handleAddToOrder(item)}
                >
                  ➕
                </button>
                <span className="text-lg font-semibold">{order[item.id] || 0}</span>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  onClick={() => handleRemoveFromOrder(item)}
                  disabled={!order[item.id]}
                >
                  ➖
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary & Place Order Button */}
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
  );
}

export default OrderMenu;
