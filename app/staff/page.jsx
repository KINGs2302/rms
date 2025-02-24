"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Navbar from "../dashboard/navbar/page";

export default function EmployeeRegister() {
  const [active, setActive] = useState("Employee Register");
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: 3,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/users?filters[restro_name][$eq]=${restro_name}&populate[role][fields]=name`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname"); // Get restro_name from localStorage

      if (!token) {
        alert("Authentication token missing. Please log in.");
        return;
      }

      if (!restro_name) {
        alert("Restaurant name is missing. Please check your settings.");
        return;
      }

      // Include restro_name in formData
      const updatedFormData = { ...formData, restro_name };

      await axios.post("https://restro-backend-0ozo.onrender.com/api/users", updatedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Employee registered successfully!");
      fetchEmployees();

      // Reset form data
      setFormData({ username: "", email: "", password: "", role: 3 });
    } catch (error) {
      console.error("Error registering employee:", error.response?.data || error.message);
      alert("Failed to register employee");
    }
  };


  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <div className="fixed top-0 left-0 h-full w-full md:w-64 bg-white shadow-md">
        <Navbar active={active} setActive={setActive} />
      </div>

      <main className="w-full flex-1 p-5 ml-0 md:ml-64 flex gap-5">
        {/* Employee Registration Form - Sticky Left Side */}
        <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/3 h-fit sticky top-5">
          <h2 className="text-2xl font-semibold mb-4">Register Employee</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className="w-full p-2 border rounded-md mb-3" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded-md mb-3" />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded-md mb-3" />
            <select name="role" value={formData.role} onChange={handleChange} required className="w-full p-2 border rounded-md mb-3">
              <option value="3">Chef</option>
              <option value="4">Waiter</option>
            </select>
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md">Register</button>
          </form>
        </div>

        {/* Scrollable Employee List Tables - Right Side */}
        <div className="w-full md:w-2/3 overflow-y-auto max-h-[100vh] p-2 bg-gray-100 rounded-md">
          {Object.entries(groupEmployeesByRole(employees)).map(([role, emps]) => (
            <div key={role} className="bg-white p-4 rounded-md shadow-md mb-4">
              <h3 className="text-xl font-semibold mb-3">{role}</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Username</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Status</th>
                    {role !== "Admin" && <th className="border p-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {emps.length > 0 ? (
                    emps.map((emp) => (
                      <tr key={emp.email} className="text-center">
                        <td className="border p-2">{emp.username}</td>
                        <td className="border p-2">{emp.email}</td>
                        <td className="border p-2">{emp.blocked ? "Blocked" : "Active"}</td>
                        {role !== "Admin" && (
                          <td className="border p-2 flex justify-center gap-3">
                            <PencilIcon className="w-5 h-5 text-blue-500 cursor-pointer" />
                            <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={role !== "Admin" ? "4" : "3"} className="border p-2 text-gray-600">
                        No employees in this role.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          ))}
        </div>
      </main>


    </div>
  );
}

function groupEmployeesByRole(employees) {
  const roleMap = { 1: "Admin", 3: "Chef", 4: "Waiter" };
  return employees.reduce((acc, emp) => {
    const roleName = roleMap[emp.role?.id] || "Unknown";
    if (!acc[roleName]) acc[roleName] = [];
    acc[roleName].push(emp);
    return acc;
  }, {});
}
