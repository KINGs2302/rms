"use client";
import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [loginUser, setLoginUser] = useState("User");
  const [userRole, setUserRole] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startDashboard = async () => {
      try {
        // Wait for 3 seconds before proceeding
        await new Promise((res) => setTimeout(res, 3000));

        if (typeof window !== "undefined") {
          setLoginUser(localStorage.getItem("loginuser") || "User");
          setUserRole(localStorage.getItem("role") || "");
        }

        const token = localStorage.getItem("token");
        const restro_name = localStorage.getItem("restroname");

        const response = await fetch(
          `https://restro-backend-0ozo.onrender.com/api/poses?filters[restro_name][$eq]=${restro_name}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    startDashboard();
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>⏳ Loading...</div>;
  if (error) return <div>{error}</div>;
  if (userRole !== "admin") {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "1.2rem" }}>
        ❌ Access Denied: Admins Only
      </div>
    );
  }

  const totalSales = orders.reduce((sum, order) => sum + order.Total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? (totalSales / totalOrders).toFixed(2) : 0;

  const monthlySales = {};
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.Total;
  });
  const sortedMonthlyKeys = Object.keys(monthlySales).sort(
    (a, b) => new Date(a + "-01") - new Date(b + "-01")
  );
  const monthlySalesData = {
    labels: sortedMonthlyKeys,
    datasets: [
      {
        label: "Monthly Sales (₹)",
        data: sortedMonthlyKeys.map((key) => monthlySales[key]),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const productSales = {};
  orders.forEach((order) => {
    order.order.forEach((item) => {
      productSales[item.item_name] = (productSales[item.item_name] || 0) + item.quantity;
    });
  });
  const sortedTopProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
  const topProductsLabels = sortedTopProducts.map(([name]) => name);
  const topProductsDataPoints = sortedTopProducts.map(([, qty]) => qty);
  const productColorsOptions = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
  ];
  const topProductsColors = topProductsLabels.map(
    (_, index) => productColorsOptions[index % productColorsOptions.length]
  );
  const topProductsData = {
    labels: topProductsLabels,
    datasets: [
      {
        label: "Quantity Sold",
        data: topProductsDataPoints,
        backgroundColor: topProductsColors,
      },
    ],
  };

  const billStatusCount = orders.reduce((acc, order) => {
    acc[order.Bill_Status] = (acc[order.Bill_Status] || 0) + 1;
    return acc;
  }, {});
  const billStatusLabels = Object.keys(billStatusCount);
  const billStatusDataPoints = Object.values(billStatusCount);
  const billStatusColors = billStatusLabels.map((status) =>
    status === "Paid" ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
  );
  const billStatusDataChart = {
    labels: billStatusLabels,
    datasets: [
      {
        label: "Bill Status Distribution",
        data: billStatusDataPoints,
        backgroundColor: billStatusColors,
      },
    ],
  };

  return (
    <div className="container">
      <h1>Welcome to Restaurant Dashboard</h1>
      <div className="kpi-container">
        <div className="kpi-card">
          <h3>Total Sales (₹)</h3>
          <p>{totalSales}</p>
        </div>
        <div className="kpi-card">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="kpi-card">
          <h3>Average Order Value (₹)</h3>
          <p>{avgOrderValue}</p>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <h2>Monthly Sales Analysis</h2>
          <Bar data={monthlySalesData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="chart-card">
          <h2>Top Products</h2>
          <Bar data={topProductsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="chart-card">
          <h2>Bill Status Distribution</h2>
          <Pie data={billStatusDataChart} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          margin-bottom: 40px;
          font-size: 2rem;
        }

        .kpi-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .kpi-card {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          width: 250px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart-section {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }

        .chart-card {
          background: #ffffff;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          flex: 1 1 300px;
          min-width: 300px;
          height: 400px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
          .kpi-card {
            width: 100%;
          }

          .chart-card {
            height: 350px;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.5rem;
          }

          .chart-card {
            padding: 10px;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
