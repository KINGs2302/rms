"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"; // Import the Skeleton component
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function EmployeeRegister() {
  const [active, setActive] = useState("Staff");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading
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
    } finally {
      setLoading(false); // Set loading to false after fetching data
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full">
      <ToastContainer />
  
      <main className="relative flex-1 p-4 md:p-5 mt-16 md:mt-0 flex flex-col md:flex-row gap-6 z-50 w-full">
        {/* Employee Registration Form */}
        <Card className="bg-white rounded-md shadow-md w-full md:w-1/3 lg:w-1/4 h-fit sticky top-5 z-50">
          <CardHeader>
            <CardTitle className=" text-2xl">Register Employee</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md mb-3"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md mb-3"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md mb-3"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-md mb-3"
                  >
                    <option value="3">Chef</option>
                    <option value="4">Waiter</option>
                  </select>
                </div>

                <Button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-md hover:bg-gray-700">
                  Register
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
  
        {/* Employee Sections */}
        <div className="flex-1 overflow-y-auto max-h-[100vh] space-y-6 pr-4">
          {['Admin', 'Chef', 'Waiter'].map(role => (
            <div key={role}>
              <SectionHeader title={role} />
              <Card className="p-4 bg-white rounded-md shadow-md">
                {loading ? <SkeletonTable /> : <EmployeeTable employees={groupedEmployees[role] || []} role={role} />}
              </Card>
            </div>
          ))}
        </div>
      </main>
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

// Renders a skeleton table for loading state.
function SkeletonTable() {
  return (
    <div className="bg-white rounded-md shadow-md overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(3)].map((_, i) => (
            <tr key={i} className="text-center">
              <td className="border p-2">
                <Skeleton className="h-6 w-24 mx-auto" />
              </td>
              <td className="border p-2">
                <Skeleton className="h-6 w-32 mx-auto" />
              </td>
              <td className="border p-2">
                <Skeleton className="h-6 w-24 mx-auto" />
              </td>
              <td className="border p-2">
                <div className="flex justify-center gap-3">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </td>
            </tr>
          ))}
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