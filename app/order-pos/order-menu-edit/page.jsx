"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios"; // ✅ Import Axios
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { FaPlus, FaMinus, FaCheck, FaEdit } from "react-icons/fa"; // ✅ Import icons from react-icons
import { Skeleton } from "@/components/ui/skeleton";

function OrderMenuEdits() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", category: "All" }]);
  const [order, setOrder] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tableNumber, setTableNumber] = useState("Unknown");
  const [tableCategory, setTableCategory] = useState("Unknown"); // ✅ Add tableCategory state
  const [existingOrder, setExistingOrder] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Add loading state
  const router = useRouter();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (orderId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        const orderData = response.data.data;
        setExistingOrder(orderData);
        setOrder(
          orderData.order.reduce((acc, item) => {
            acc[item.item_name] = {
              quantity: item.quantity,
              item_status: item.item_status,
              price: item.price,
              special_request: item.special_request,
            };
            return acc;
          }, {})
        );
        setTableNumber(orderData.table_number);
        setTableCategory(orderData.table_category); // ✅ Set tableCategory from API response
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to fetch order details.");
    } finally {
      setLoading(false); // ✅ Set loading to false after data is fetched
    }
  };

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
      } finally {
        setLoading(false); // ✅ Set loading to false after data is fetched
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
      [item.item_name]: {
        quantity: prev[item.item_name] ? prev[item.item_name].quantity + 1 : 1,
        item_status: "Ordered",
        price: item.price,
        special_request: "",
      },
    }));
  };


  const handlePayBill = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");

    try {
      const tableResponse = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/tables?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tables = tableResponse.data?.data || [];
      const matchedTable = tables.find(
        (table) => table.no_of_table.toString() === tableNumber.toString()
      );

      const table_category = matchedTable ? matchedTable.table_category : tableCategory;

      const orderDetails = Object.keys(order).map((itemId) => {
        const item = menus.find((menu) => menu.item_name === itemId);
        if (!item) {
          console.error(`Menu item not found for: ${itemId}`);
          return null;
        }
        return {
          item_name: item.item_name,
          quantity: order[itemId].quantity,
          price: item.price * order[itemId].quantity,
          item_status: "Paid",
          special_request: order[itemId].special_request || "",
        };
      }).filter(Boolean); // Remove null values

      if (orderDetails.length === 0) {
        alert("No valid items in order.");
        return;
      }

      const totalAmount = orderDetails.reduce((total, item) => total + item.price, 0);

      const updatedOrderPayload = {
        data: {
          restro_name,
          table_category,
          table_number: tableNumber,
          order: orderDetails,
          Total: totalAmount,
          Bill_Status: "Paid",
        },
      };

      // Update the Bill Status in the database
      const response = await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/poses/${orderId}`,
        updatedOrderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Bill Paid Successfully:", response.data);

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Header - Styled with a background
      doc.setFillColor(240, 248, 255); // Light blue background
      doc.rect(0, 0, pageWidth, 60, "F");

      // Restaurant Name
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0); // Black text
      doc.text(restro_name, contentWidth / 2 + margin, 30, { align: "center" });

      // Address and Contact
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("101- abc park, xyz road,", contentWidth / 2 + margin, 45, { align: "center" });
      doc.text("pqr city, gujarat-123456", contentWidth / 2 + margin, 52, { align: "center" });
      doc.text("(Mob): 0000000000", contentWidth / 2 + margin, 59, { align: "center" });

      // Bill Details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Reset text color
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 75);
      doc.text(`Table: ${tableNumber}`, contentWidth - 80 + margin, 75);
      doc.text("Cashier: System", margin, 82);
      doc.text(`Bill-No. : ${response.data.data.Bill_no}`, contentWidth - 80 + margin, 82);

      // Table Headers
      autoTable(doc, {
        startY: 90,
        head: [["Item", "Qty", "Price", "Amount"]],
        body: Object.keys(order).map((itemName) => [
          itemName,
          order[itemName].quantity,
          `₹${order[itemName].price.toFixed(2)}`,
          `₹${(order[itemName].price * order[itemName].quantity).toFixed(2)}`,
        ]),
        theme: "grid",
        styles: { font: "helvetica", fontSize: 12, cellPadding: 8, textColor: [0, 0, 0] },
        headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 248, 248] },
      });

      let finalY = doc.lastAutoTable.finalY + 15;

      // Total Calculation
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Sub Total: ₹${totalAmount.toFixed(2)}`, contentWidth - 120 + margin, finalY);
      doc.setFont("helvetica", "normal");
      doc.text(`SGST: ₹${(totalAmount * 0.025).toFixed(2)} (2.5%)`, contentWidth - 120 + margin, finalY + 8);
      doc.text(`CGST: ₹${(totalAmount * 0.025).toFixed(2)} (2.5%)`, contentWidth - 120 + margin, finalY + 16);

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Grand Total: ₹${(totalAmount + totalAmount * 0.05).toFixed(2)}`, contentWidth - 120 + margin, finalY + 35);

      // Footer
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100); // Gray text
      doc.text("Thanks for Visiting!", contentWidth / 2 + margin, finalY + 50, { align: "center" });

      doc.save(`Table-${tableNumber}-Bill.pdf`);

      setOrder({});
      router.push("/order-pos");
    } catch (error) {
      console.error("Error paying the bill:", error);
      toast.error("Failed to pay bill. Please try again.");
    }
  };

  const handleRemoveFromOrder = (item) => {
    setOrder((prev) => {
      const newOrder = { ...prev };
      if (newOrder[item.item_name] && newOrder[item.item_name].quantity > 1) {
        newOrder[item.item_name].quantity -= 1;
      } else {
        delete newOrder[item.item_name];
      }
      return newOrder;
    });
  };

  const handleUpdateOrder = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");

    const orderDetails = Object.keys(order).map((itemName) => {
      const item = order[itemName];
      return {
        item_name: itemName,
        quantity: item.quantity,
        price: item.price,
        item_status: item.item_status,
        special_request: item.special_request,
      };
    });

    const totalAmount = orderDetails.reduce((total, item) => total + item.price * item.quantity, 0);

    const orderPayload = {
      data: {
        restro_name,
        table_category: tableCategory, // ✅ Use tableCategory dynamically
        table_number: tableNumber,
        order: orderDetails,
        Total: totalAmount,
        Bill_Status: "Unpaid",
      },
    };

    try {
      const response = await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/poses/${orderId}`,
        orderPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Order Updated Successfully:", response.data);
      toast.success("Order Updated Successfully!");
      router.push("/order-pos");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order. Please try again.");
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-full w-full">
        <ToastContainer />
        <div className="bg-gray-300 text-center py-2 text-lg font-semibold">
          Table Number: {tableNumber} | Table Category: {tableCategory} {/* ✅ Display tableCategory */}
        </div>

        <div className="flex-grow flex">
          <aside className="w-1/6 bg-gray-200 h-full flex flex-col">
            <h2 className="text-xl p-5 text-right font-semibold text-gray-800">Categories</h2>
            <div className="flex-1 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 w-full text-right rounded-r-full transition-all duration-300 ${selectedCategory === cat.category
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-5 w-5/6 max-h-20">
            {loading ? (
             Array.from({ length: 8 }).map((_, index) => (
                               <div
                                 key={index}
                                 className=" p-5 rounded-2xl shadow-md text-center min-h-60"
                               >
                                 <Skeleton key={index} height={96} width={96} className=" rounded-2xl" />
                                 <Skeleton height={20} width="80%" className="mt-3" />
                                 <Skeleton height={15} width="60%" />
                                 <Skeleton height={30} width="50%" className="mt-2" />
                               </div>
                             ))
            ) : (
              filteredMenu.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-md text-center">
                  {item.image?.url && (
                    <img src={item.image.url} alt={item.item_name} className="rounded-full mx-auto w-24 h-24" />
                  )}
                  <h3 className="text-lg font-semibold mt-3 truncate">
                    {item.item_name} {" "}
                  </h3>
                  <p> price:- <span className="text-red-500 font-bold">{item.price}/- Rs.</span></p>
                  <p className="text-gray-600">Category: {item.category?.category}</p>

                  <div className="flex justify-center items-center mt-2 space-x-3">
                    <button
                      className="bg-red-400 text-white px-3 py-1 rounded-lg"
                      onClick={() => handleRemoveFromOrder(item)}
                      disabled={!order[item.item_name]}
                    >
                      <FaMinus /> {/* ✅ Add icon */}
                    </button>
                    <span className="text-lg font-semibold">{order[item.item_name]?.quantity || 0}</span>
                    <button
                      className="bg-green-400 text-white px-3 py-1 rounded-lg"
                      onClick={() => handleAddToOrder(item)}
                    >
                      <FaPlus /> {/* ✅ Add icon */}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-5">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <ul>
            {Object.keys(order).map((itemName) => {
              const item = order[itemName];
              return (
                <li key={itemName} className="flex justify-between text-lg">
                  <span>
                    {itemName} (x{item.quantity})
                  </span>
                  <span className="font-semibold text-green-600">
                    {item.price * item.quantity} Rs.
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-between text-xl font-bold mt-4 border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">
              {Object.keys(order).reduce((total, itemName) => {
                const item = order[itemName];
                return total + item.price * item.quantity;
              }, 0)}{" "}
              Rs.
            </span>
          </div>

          <div className="text-right mt-4 flex justify-end space-x-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center"
              onClick={handlePayBill}
            >
              <FaCheck className="mr-2" /> Pay the Bill {/* ✅ Add icon */}
            </button>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center"
              onClick={handleUpdateOrder}
            >
              <FaEdit className="mr-2" /> Update Order {/* ✅ Add icon */}
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

export default function OrderMenuEdit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderMenuEdits />
    </Suspense>
  );
}