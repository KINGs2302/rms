"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Navbar from "../dashboard/navbar/page";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function EmployeeRegister() {
  const [active, setActive] = useState("Employee Register");
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: 3,
  });

  // State for update dialog
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [updateData, setUpdateData] = useState({
    username: "",
    email: "",
    password: "",
    status: "Active", // Active or Deactive
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

  // Update employee details including status
  const updateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const token = localStorage.getItem("token");

      // Build the payload
      const payload = {
        username: updateData.username,
        email: updateData.email,
        // Only include password if provided
        ...(updateData.password && { password: updateData.password }),
        // "blocked" is true if status is Deactive, false if Active
        blocked: updateData.status === "Deactive",
      };

      await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/users/${selectedEmployee.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Employee updated successfully!");
      setShowUpdateDialog(false);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    }
  };

  const deleteemployee = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://restro-backend-0ozo.onrender.com/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`${response.data.username} Employee deleted successfully!`);
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

      if (!token) {
        toast.error("Authentication token missing. Please log in.");
        return;
      }
      if (!restro_name) {
        toast.error("Restaurant name is missing. Please check your settings.");
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

      toast.success("Employee registered successfully!");
      fetchEmployees();
      setFormData({ username: "", email: "", password: "", role: 3 });
    } catch (error) {
      console.error("Error registering employee:", error.response?.data || error.message);
      toast.error("Failed to register employee");
    }
  };

  // Open update dialog and pre-fill updateData with selected employee's details.
  const openUpdateDialog = (employee) => {
    setSelectedEmployee(employee);
    setUpdateData({
      username: employee.username,
      email: employee.email,
      password: "", // Leave blank to keep current password
      status: employee.blocked ? "Deactive" : "Active",
    });
    setShowUpdateDialog(true);
  };

  // Update change handler for update dialog
  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  // Group employees by role and sort them as requested.
  const groupedEmployees = groupEmployeesByRole(employees);

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <ToastContainer />
      {/* Left sidebar (Navigation) */}
      <div className="fixed top-0 left-0 h-full w-full md:w-64 bg-white shadow-md">
        <Navbar active={active} setActive={setActive} />
      </div>

      {/* Main content area */}
      <main className="w-full flex-1 p-5 ml-0 md:ml-64 flex gap-5">
        {/* Employee Registration Form (Sticky on the left side) */}
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
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded-md">
              Register
            </button>
          </form>
        </div>

        {/* Right side: Admin, Chef, Waiter sections */}
        <div className="flex-1 overflow-y-auto max-h-[100vh] space-y-6 pr-2">
          {/* Admin Section */}
          <SectionHeader title="Admin" />
          <EmployeeTable
            employees={groupedEmployees["Admin"] || []}
            openUpdateDialog={openUpdateDialog}
            deleteemployee={deleteemployee}
            role="Admin"
          />

          {/* Chef Section */}
          <SectionHeader title="Chef" />
          <EmployeeTable
            employees={groupedEmployees["Chef"] || []}
            openUpdateDialog={openUpdateDialog}
            deleteemployee={deleteemployee}
            role="Chef"
          />

          {/* Waiter Section */}
          <SectionHeader title="Waiter" />
          <EmployeeTable
            employees={groupedEmployees["Waiter"] || []}
            openUpdateDialog={openUpdateDialog}
            deleteemployee={deleteemployee}
            role="Waiter"
          />
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
                    Password <span className="text-xs text-gray-500">(Leave blank to keep current)</span>
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
              <button onClick={() => setShowUpdateDialog(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button onClick={updateEmployee} className="px-4 py-2 bg-blue-500 text-white rounded-md">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** --- Helper Components & Functions --- **/

// Displays a header for each section (Admin, Chef, Waiter).
function SectionHeader({ title }) {
  return (
    <h2 className="text-xl font-semibold mb-2 border-b pb-1">{title}</h2>
  );
}

// Renders a table for a specific role (Admin, Chef, Waiter).
function EmployeeTable({ employees, openUpdateDialog, deleteemployee, role }) {
  return (
    <div className="bg-white rounded-md shadow-md overflow-x-auto">
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
          {employees.length > 0 ? (
            employees.map((emp) => (
              <tr key={emp.email} className="text-center">
                <td className="border p-2">{emp.username}</td>
                <td className="border p-2">{emp.email}</td>
                <td className="border p-2 flex items-center justify-center gap-1">
                  <span
                    className={`w-3 h-3 rounded-full ${emp.blocked ? "bg-red-500" : "bg-green-500"}`}
                  ></span>
                  {emp.blocked ? "Deactive" : "Active"}
                </td>
                {role !== "Admin" && (
                  <td>
                  <div className="border p-2 flex justify-center gap-3">
                    <PencilIcon
                      className="w-5 h-5 text-blue-500 cursor-pointer"
                      onClick={() => openUpdateDialog(emp)}
                    />
                    <TrashIcon
                      className="w-5 h-5 text-red-500 cursor-pointer"
                      onClick={() => deleteemployee(emp.id)}
                    />
                  </div>
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
  );
}

// Groups employees by role while sorting them so that:
// 1. Active employees (blocked = false) come first,
// 2. Then Deactive employees (blocked = true),
// 3. Within the same status, sort by username in ascending order.
function groupEmployeesByRole(employees) {
  const roleMap = { 1: "Admin", 3: "Chef", 4: "Waiter" };

  const sortedEmployees = [...employees].sort((a, b) => {
    // Sort by blocked status (false first), then by username
    if (a.blocked === b.blocked) {
      return a.username.localeCompare(b.username);
    }
    return a.blocked ? 1 : -1;
  });

  return sortedEmployees.reduce((acc, emp) => {
    const roleName = roleMap[emp.role?.id] || "Unknown";
    if (!acc[roleName]) {
      acc[roleName] = [];
    }
    acc[roleName].push(emp);
    return acc;
  }, {});
}