"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Navbar from "../dashboard/navbar/page";

export default function EmployeeRegister() {
  const [active, setActive] = useState("Staff");
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: 3,
  });

  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [updateData, setUpdateData] = useState({
    username: "",
    email: "",
    password: "",
    status: "Active",
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

  const updateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: updateData.username,
        email: updateData.email,
        ...(updateData.password && { password: updateData.password }),
        blocked: updateData.status === "Deactive",
      };

      await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/users/${selectedEmployee.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Employee updated successfully!");
      setShowUpdateDialog(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee");
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://restro-backend-0ozo.onrender.com/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Employee deleted successfully!");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");
      if (!token || !restro_name) {
        alert("Missing authentication details. Please log in again.");
        return;
      }
      const updatedFormData = { ...formData, restro_name };
      await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/users",
        updatedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Employee registered successfully!");
      fetchEmployees();
      setFormData({ username: "", email: "", password: "", role: 3 });
    } catch (error) {
      console.error("Error registering employee:", error);
      alert("Failed to register employee");
    }
  };

  function groupEmployeesByRole(employees) {
    const roleMap = { 1: "Admin", 3: "Chef", 4: "Waiter" };
    const sortedEmployees = [...employees].sort((a, b) => {
      if (a.blocked === b.blocked) {
        return a.username.localeCompare(b.username);
      }
      return a.blocked ? 1 : -1;
    });
    return sortedEmployees.reduce((acc, emp) => {
      const roleName = roleMap[emp.role?.id] || "Unknown";
      if (!acc[roleName]) acc[roleName] = [];
      acc[roleName].push(emp);
      return acc;
    }, {});
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <div className="fixed top-0 left-0 h-full w-full md:w-64 bg-white shadow-md">
        <Navbar active={active} setActive={setActive} />
      </div>

      <main className="w-full flex-1 p-5 ml-0 md:ml-64 flex gap-5">
        {/* Employee Registration Form */}
        <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/3 h-fit sticky top-5">
          <h2 className="text-2xl font-semibold mb-4">Register Employee</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md mb-3"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md mb-3"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md mb-3"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md mb-3"
            >
              <option value="3">Chef</option>
              <option value="4">Waiter</option>
            </select>
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded-md"
            >
              Register
            </button>
          </form>
        </div>

        {/* Employee List */}
        <div className="w-full md:w-2/3 overflow-y-auto max-h-[100vh] p-2 bg-gray-100 rounded-md">
          {Object.entries(groupEmployeesByRole(employees)).map(
            ([role, emps]) => (
              <div
                key={role}
                className="bg-white p-4 rounded-md shadow-md mb-4"
              >
                <h3 className="text-xl font-semibold mb-3">{role}</h3>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Username</th>
                      <th className="border p-2">Email</th>
                      <th className="border p-2">Status</th>
                      {role !== "Admin" && (
                        <th className="border p-2">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {emps.length > 0 ? (
                      emps.map((emp) => (
                        <tr key={emp.id} className="text-center">
                          <td className="border p-2">{emp.username}</td>
                          <td className="border p-2">{emp.email}</td>
                          <td className="border p-2">
                            <div className="flex items-center gap-1 justify-center">
                              <span
                                className={`w-3 h-3 rounded-full ${
                                  emp.blocked ? "bg-red-500" : "bg-green-500"
                                }`}
                              ></span>
                              <span>{emp.blocked ? "Deactive" : "Active"}</span>
                            </div>
                          </td>
                          {role !== "Admin" && (
                            <td className="border p-2">
                              <div className="flex justify-center gap-3">
                                <PencilIcon
                                  className="w-5 h-5 text-blue-500 cursor-pointer"
                                  onClick={() => openUpdateDialog(emp)}
                                />
                                <TrashIcon
                                  className="w-5 h-5 text-red-500 cursor-pointer"
                                  onClick={() => deleteEmployee(emp.id)}
                                />
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={role !== "Admin" ? "4" : "3"}
                          className="border p-2 text-gray-600"
                        >
                          No employees in this role.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>

      {/* Update Dialog */}
      {showUpdateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Update Employee</h2>
            {selectedEmployee && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={updateData.username}
                    onChange={handleUpdateChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={updateData.email}
                    onChange={handleUpdateChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Password{" "}
                    <span className="text-xs text-gray-500">
                      (Leave blank to keep current)
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={updateData.password}
                    onChange={handleUpdateChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={updateData.status}
                    onChange={handleUpdateChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactive">Deactive</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowUpdateDialog(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={updateEmployee}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
