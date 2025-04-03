"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaReceipt } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";

function Billing() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchBillNo, setSearchBillNo] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [showHistory, startDate, endDate]);

  const fetchOrders = async () => {
    const restro_name = localStorage.getItem("restroname");
    const token = localStorage.getItem("token");
    const billStatus = showHistory ? "Paid" : "Unpaid";
    let filterQuery = "";

    const formatDate = (date) => {
      const [year, month, day] = date.split("-");
      return `${year}-${month}-${day}`;
    };
    
    if (startDate && endDate) {
      var formattedStartDate = new Date(startDate).toISOString().split("T")[0];
      var formattedEndDate = new Date(endDate).toISOString().split("T")[0];
      console.log(formattedStartDate);
      formattedStartDate=formatDate(formattedStartDate);
      console.log(formattedStartDate);
      formattedEndDate=formatDate(formattedEndDate);
      
      filterQuery = `&filters[updatedAt][$gte]=${formattedStartDate}&filters[updatedAt][$lte]=${formattedEndDate}T23:59:59.999Z`;
    }
  
    try {
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}&filters[Bill_Status][$eq]=${billStatus}${filterQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
      const sortedOrders = (response.data?.data || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = (order) => {
    const doc = new jsPDF();
    doc.text("Restaurant Receipt", 20, 20);
    doc.text(`Bill No: ${order.Bill_no}`, 20, 30);
    doc.text(`Table No: ${order.table_number}`, 20, 40);
    doc.text(`Category: ${order.table_category}`, 20, 50);
    doc.text(`Total Amount: ₹${order.Total}`, 20, 60);
    doc.text(`Status: ${order.Bill_Status}`, 20, 70);
    
    if (order.items && Array.isArray(order.items)) {
      autoTable(doc, {
        startY: 80,
        head: [["Item", "Quantity", "Price"]],
        body: order.items.map(item => [item.name, item.quantity, `₹${item.price}`])
      });
    } else {
      doc.text("No item details available", 20, 80);
    }
    
    doc.save(`Receipt_${order.Bill_no}.pdf`);
  };

  const filteredOrders = searchBillNo
    ? orders.filter(order => order.Bill_no.toString().includes(searchBillNo))
    : orders;

  return (
    <div className="p-5 h-full w-full flex flex-col items-center bg-gray-100 overflow-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Billing Section</h1>

      <div className="flex gap-4 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Show Unpaid Bills" : "Show Paid Bills (History)"}
        </button>
        <div className="flex gap-2">
          <input
            type="date"
            className="border rounded-md px-2 py-1"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate(""); // Reset endDate if it's before startDate
              }
            }}
            
          />
          <input
            type="date"
            className="border rounded-md px-2 py-1"
            value={endDate}
            min={startDate} // Ensures endDate can't be before startDate
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by Bill No."
        className="border rounded-md px-2 py-1 mb-4 w-1/3"
        value={searchBillNo}
        onChange={(e) => setSearchBillNo(e.target.value)}
      />

      {loading ? (
        <Skeleton className="w-full h-40 rounded-lg" />
      ) : filteredOrders.length === 0 ? (
        <p className="text-lg text-gray-600">No {showHistory ? "paid" : "unpaid"} orders available</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3">Bill No.</th>
              <th className="p-3">Table No.</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.documentId} className="border-b">
                <td className="p-3 text-center">{order.Bill_no}</td>
                <td className="p-3 text-center">{order.table_number}</td>
                <td className="p-3 text-center">{order.table_category}</td>
                <td className="p-3 text-center">₹{order.Total}</td>
                <td
                  className={`p-3 text-center font-semibold ${
                    order.Bill_Status === "Unpaid" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {order.Bill_Status}
                </td>
                <td className="p-3 text-center">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                    onClick={() => generateReceipt(order)}
                  >
                    <FaReceipt className="mr-2" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Billing;
