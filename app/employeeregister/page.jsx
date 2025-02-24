"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../dashboard/navbar/page";

export default function EmployeeRegister() {
  const [active, setActive] = useState("Employee Register");
  const [employees, setEmployees] = useState([]);
  const [restaurantName, setRestaurantName] = useState(
    localStorage.getItem("restroname") || "N/A"
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    restro_name: restaurantName,
    role: 2, // Default: Public Customer
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "https://restro-backend-0ozo.onrender.com/api/users"
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/users",
        formData
      );
      alert("Employee registered successfully!");
      fetchEmployees(); // Refresh employee list
      setFormData({
        username: "",
        email: "",
        password: "",
        restro_name: restaurantName,
        role: 2,
      });
    } catch (error) {
      console.error("Error registering employee:", error);
      alert("Failed to register employee");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <Navbar active={active} setActive={setActive} />
      <main className="flex flex-col p-5 items-center w-screen">
        <h1 className="text-3xl font-semibold mb-5">{active}</h1>

        {/* Restaurant Name Section */}
        <div className="bg-white p-4 rounded-md shadow-md mb-5 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Restaurant Name</h2>
          <p className="text-gray-700">{restaurantName}</p>
        </div>

        {/* Employee Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow-md w-full max-w-md"
        >
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="1">Admin</option>
              <option value="2">Public Customer</option>
              <option value="3">Chef</option>
              <option value="4">Waiter</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Register Employee
          </button>
        </form>

        {/* Employee List */}
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Registered Employees</h2>
          <ul className="bg-white p-4 rounded-md shadow-md">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <li key={emp.email} className="p-2 border-b">
                  <p className="font-medium">{emp.username} ({emp.email})</p>
                  <p className="text-gray-600">Role: {getRoleName(emp.role)}</p>
                  <p className="text-gray-500">Restaurant: {emp.restro_name}</p>
                </li>
              ))
            ) : (
              <p className="text-gray-600">No employees registered yet.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

// Function to map role numbers to role names
function getRoleName(role) {
  const roles = {
    1: "Admin",
    2: "Public Customer",
    3: "Chef",
    4: "Waiter",
  };
  return roles[role] || "Unknown";
}
