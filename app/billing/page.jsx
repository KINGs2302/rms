"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaReceipt, FaHistory, FaSpinner } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

function Billing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false); // Toggle for paid/unpaid orders

  useEffect(() => {
    fetchOrders();
  }, [showHistory]); // Fetch orders when toggle changes

  const fetchOrders = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");
    const billStatus = showHistory ? "Paid" : "Unpaid"; // Toggle between paid/unpaid

    try {
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}&filters[Bill_Status][$eq]=${billStatus}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (documentId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/poses/${documentId}`,
        { data: { Bill_Status: "Paid" } },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove paid order from state
      setOrders((prevOrders) => prevOrders.filter((order) => order.documentId !== documentId));

      // Generate PDF receipt
      generateReceipt(documentId);
    } catch (error) {
      console.error("Error updating bill status:", error);
    }
  };

  const generateReceipt = (documentId) => {
    const order = orders.find((order) => order.documentId === documentId);
    if (!order) return;

    const doc = new jsPDF();
    
    // Restaurant Details
    doc.setFontSize(14);
    doc.text("Restro Mate", 80, 10);
    doc.setFontSize(10);
    doc.text("123, Your Restaurant Address, City - 000000", 55, 20);
    doc.text("GSTIN: 24AALUPP0436C1Z7", 75, 25);
    doc.text("Phone: +91 0000000000", 75, 30);
    
    doc.setFontSize(12);
    doc.text(`Bill No: ${order.Bill_no}`, 10, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, 45);
    doc.text(`Table: ${order.table_number} (${order.table_category})`, 10, 50);
    doc.text("Cashier: John Doe", 10, 55);

    // Table Headers
    autoTable(doc, {
      startY: 65,
      head: [["Item", "Qty", "Rate", "Amount"]],
      body: order.order.map((item) => [
        item.item_name,
        item.quantity,
        `₹${item.price}`,
        `₹${item.price * item.quantity}`,
      ]),
      theme: "grid",
    });

    // Subtotal Calculation
    let subTotal = order.order.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let gst = (subTotal * 5) / 100; // 5% GST
    let grandTotal = subTotal + gst;

    doc.setFontSize(12);
    doc.text(`Subtotal: ₹${subTotal.toFixed(2)}`, 120, doc.lastAutoTable.finalY + 10);
    doc.text(`GST (5%): ₹${gst.toFixed(2)}`, 120, doc.lastAutoTable.finalY + 20);
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 120, doc.lastAutoTable.finalY + 30);

    // FSSAI & Footer
    doc.setFontSize(10);
    doc.text("FSSAI Lic No. 10719004000281", 10, doc.lastAutoTable.finalY + 40);
    doc.text("Thanks for visiting!", 75, doc.lastAutoTable.finalY + 50);

    doc.save(`Bill_${order.Bill_no}.pdf`);
  };

  return (
    <div className="p-5 h-full w-full flex flex-col items-center bg-gray-100 overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Billing Section</h1>

      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? (
          <>
            <FaHistory className="mr-2" /> Show Unpaid Bills
          </>
        ) : (
          <>
            <FaHistory className="mr-2" /> Show Paid Bills (History)
          </>
        )}
      </button>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full p-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="w-full h-40 rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-lg text-gray-600">No {showHistory ? "paid" : "unpaid"} orders available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full p-5">
          {orders.map((order) => (
            <div key={order.documentId} className="bg-white p-4 rounded-lg shadow-md max-h-96 overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-800">
                Table {order.table_number} ({order.table_category})
              </h2>
              <p className="text-gray-600">Bill No: {order.Bill_no}</p>
              <p className="text-gray-600">Total: ₹{order.Total}</p>
              <p className="text-gray-600">
                Bill Status: 
                <span className={`font-semibold ${order.Bill_Status === "Unpaid" ? "text-red-500" : "text-green-500"}`}>
                  {order.Bill_Status}
                </span>
              </p>
              <ul className="mt-2 space-y-2">
                {order.order.map((item, index) => (
                  <li key={index} className="border-b py-2">
                    <p className="font-semibold">{item.item_name}</p>
                    <p className="text-gray-600">₹{item.price} x {item.quantity}</p>
                    <p className="text-sm text-gray-500">Request: {item.special_request || "None"}</p>
                  </li>
                ))}
              </ul>
              {!showHistory && (
                <button
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                  onClick={() => markAsPaid(order.documentId)}
                >
                  <FaReceipt className="mr-2" /> Mark as Paid & Download Receipt
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Billing;