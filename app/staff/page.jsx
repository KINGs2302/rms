"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { RiAdminLine } from "react-icons/ri";
import { PiChefHatBold } from "react-icons/pi";
import { GrUserWorker } from "react-icons/gr";

export default function EmployeeRegister() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
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
      toast.success("Employee deleted successfully!");
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

  const openUpdateDialog = (employee) => {
    setSelectedEmployee(employee);
    setUpdateData({
      username: employee.username,
      email: employee.email,
      password: "",
      status: employee.blocked ? "Deactive" : "Active",
    });
    setShowUpdateDialog(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const groupedEmployees = groupEmployeesByRole(employees);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full">
      <ToastContainer />

      {/* Update Dialog */}
      {showUpdateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Employee</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="update-username">Username</Label>
                <Input
                  id="update-username"
                  name="username"
                  value={updateData.username}
                  onChange={handleUpdateChange}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="update-email">Email</Label>
                <Input
                  id="update-email"
                  name="email"
                  value={updateData.email}
                  onChange={handleUpdateChange}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="update-password">Password</Label>
                <Input
                  id="update-password"
                  type="password"
                  name="password"
                  value={updateData.password}
                  onChange={handleUpdateChange}
                  className="w-full"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={updateData.status}
                  onChange={handleUpdateChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Deactive">Deactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setShowUpdateDialog(false)}>Cancel</Button>
                <Button onClick={updateEmployee}>Update</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="relative flex-1 p-4 md:p-5 mt-16 md:mt-0 flex flex-col md:flex-row gap-6 z-30 w-full">
        {/* Registration Form */}
        <Card className="bg-white rounded-md shadow-md w-full md:w-1/3 lg:w-1/4 h-fit sticky top-5 z-50">
          <CardHeader>
            <CardTitle className="text-2xl">Register Employee</CardTitle>
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
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Username"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Password"
                    className="w-full"
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
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="3">Chef</option>
                    <option value="4">Waiter</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Register</Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Employee Tables */}
        <div className="flex-1 overflow-y-auto max-h-[100vh] space-y-6 pr-4">
          {['Admin', 'Chef', 'Waiter'].map(role => (
            <div key={role}>
              <SectionHeader title={role} />
              <Card className="p-4 bg-white rounded-md shadow-md">
                {loading
                  ? <SkeletonTable />
                  : <EmployeeTable
                      employees={groupedEmployees[role] || []}
                      role={role}
                      openUpdateDialog={openUpdateDialog}
                      deleteemployee={deleteemployee}
                    />
                }
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* Helper components */

function SectionHeader({ title }) {
  const icons = {
    Admin: <RiAdminLine className="inline-block w-5 h-5 mr-2" />,
    Chef: <PiChefHatBold className="inline-block w-5 h-5 mr-2" />,
    Waiter: <GrUserWorker className="inline-block w-5 h-5 mr-2" />,
  };
  return (
    <h2 className="text-xl font-semibold mb-2 border-b pb-1 flex items-center">
      {icons[title]}
      {title}
    </h2>
  );
}

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
                  <td className="border p-2">
                    <div className="flex justify-center gap-3">
                      <PencilIcon className="w-5 h-5 text-blue-500 cursor-pointer" onClick={() => openUpdateDialog(emp)} />
                      <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => deleteemployee(emp.id)} />
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
              <td className="border p-2"><Skeleton className="h-6 w-24 mx-auto" /></td>
              <td className="border p-2"><Skeleton className="h-6 w-32 mx-auto" /></td>
              <td className="border p-2"><Skeleton className="h-6 w-24 mx-auto" /></td>
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
    if (!acc[roleName]) {
      acc[roleName] = [];
    }
    acc[roleName].push(emp);
    return acc;
  }, {});
}
