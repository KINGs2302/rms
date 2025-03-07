"use client";
import React, { useEffect, useState } from "react";

function OrderMenu({ table }) {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", category: "All" }]);
  const [order, setOrder] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tableNumber, setTableNumber] = useState(table || "Unknown"); // Store table number

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

  const filteredMenu = selectedCategory === "All"
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

    console.log("Table Number:", tableNumber); // Print table number
    console.log("Order Details:", orderDetails); // Print order details

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

              {/* Quantity Counter */}
              <div className="flex items-center justify-center mt-3">
                <button
                  onClick={() => handleRemoveFromOrder(item)}
                  className="bg-gray-300 px-3 py-1 rounded-l-md text-lg"
                  disabled={!order[item.id]}
                >
                  -
                </button>
                <span className="px-4 py-1 bg-gray-100">{order[item.id] || 0}</span>
                <button
                  onClick={() => handleAddToOrder(item)}
                  className="bg-green-500 text-white px-3 py-1 rounded-r-md text-lg"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      {Object.keys(order).length > 0 && (
        <div className="bg-gray-100 p-5 fixed bottom-0 w-5/6 flex flex-col items-center shadow-md">
          <h3 className="text-xl font-semibold">Order Summary</h3>
          <div className="mt-2 w-3/4 max-h-40 overflow-y-auto">
            {Object.keys(order).map((itemId) => {
              const item = menus.find((menu) => menu.id == itemId);
              return (
                <div key={item.id} className="flex justify-between p-2 border-b">
                  <span>{item.item_name} x {order[itemId]}</span>
                  <span className="text-red-500 font-bold">{item.price * order[itemId]} Rs.</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={handlePlaceOrder}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg mt-3"
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderMenu;
