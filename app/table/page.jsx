"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TableManagement() {
  const [categorie, setCategorie] = useState([]);
  const [openTableDialog, setOpenTableDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableCount, setTableCount] = useState(1);
  const [categoryName, setCategoryName] = useState("");
  const [initialTableCount, setInitialTableCount] = useState(1);
  const [editingCategoryId, setEditingCategoryId] = useState(null); // Track which category is being edited

  useEffect(() => {
    fetchcategorie();
  }, []);

  // Fetch categorie from API
  const fetchcategorie = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/tables?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.data) {
        const formattedcategorie = response.data.data.map((item) => ({
          id: item.id,
          name: item.table_category,
          tables: Array.from({ length: item.no_of_table }, (_, i) => i + 1),
          documentId: item.documentId,
        }));
        setCategorie(formattedcategorie);
      }
    } catch (error) {
      console.error("Error fetching table categorie:", error);
    }
  };

  // Add new category with initial tables
  const addCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    if (initialTableCount < 1) {
      toast.error("Initial number of tables must be at least 1.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/tables",
        {
          data: {
            table_category: categoryName,
            restro_name: restro_name,
            no_of_table: initialTableCount,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        const newCategory = {
          id: response.data.id,
          name: categoryName,
          tables: Array.from({ length: initialTableCount }, (_, i) => i + 1),
          documentId: response.data.data.documentId,
        };

        setCategorie((prev) => [...prev, newCategory]);
        setOpenCategoryDialog(false);
        setCategoryName("");
        setInitialTableCount(1);
        toast.success("Category added successfully!");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  // Open dialog for editing category
  const openEditCategoryDialog = (category) => {
    setEditingCategoryId(category.documentId);
    setCategoryName(category.name);
    setInitialTableCount(category.tables.length);
    setOpenCategoryDialog(true);
  };

  // Update category
  const updateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required.");
      return;
    }
    if (initialTableCount < 1) {
      toast.error("Number of tables must be at least 1.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/tables/${editingCategoryId}`,
        {
          data: {
            table_category: categoryName,
            no_of_table: initialTableCount,
            restro_name: restro_name,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update category in state
      setCategorie((prev) =>
        prev.map((category) =>
          category.documentId === editingCategoryId
            ? {
                ...category,
                name: categoryName,
                tables: Array.from({ length: initialTableCount }, (_, i) => i + 1),
              }
            : category
        )
      );

      setOpenCategoryDialog(false);
      setCategoryName("");
      setInitialTableCount(1);
      setEditingCategoryId(null);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    }
  };

  // Delete category
  const deleteCategory = async (documentId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://restro-backend-0ozo.onrender.com/api/tables/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategorie((prev) => prev.filter((category) => category.documentId !== documentId));
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.");
    }
  };

  // Open dialog to add tables
  const handleAddTable = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpenTableDialog(true);
  };

  // Add tables to an existing category
  const confirmAddTable = () => {
    setCategorie((prev) =>
      prev.map((category) =>
        category.id === selectedCategory
          ? { ...category, tables: [...category.tables, ...Array.from({ length: tableCount }, (_, i) => category.tables.length + i + 1)] }
          : category
      )
    );
    setOpenTableDialog(false);
    setTableCount(1);
    toast.success("Tables added successfully!");
  };

  return (
    <div className="w-full h-screen p-4 overflow-auto">
      <ToastContainer />
      <h1 className="text-2xl font-semibold mb-4 text-center">Table Management</h1>

      {/* Add Category Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpenCategoryDialog(true)} variant="primary">
          <Plus className="w-5 h-5 mr-2" /> Add Category
        </Button>
      </div>

      <div className="space-y-6 w-full">
        {categorie.map((category) => (
          <div key={category.id} className="p-4 border rounded-lg bg-gray-100 shadow-md w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <div className="flex gap-2">
                <Button onClick={() => openEditCategoryDialog(category)} variant="outline">
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button onClick={() => deleteCategory(category.documentId)} variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
            <div className={`grid grid-cols-2 md:grid-cols-8 gap-4 p-2 ${category.tables.length > 5 ? "overflow-y-auto max-h-60" : ""}`}>
              {category.tables.map((table) => (
                <div key={`${category.documentId}-${table}`} className="flex flex-col items-center justify-center w-20 h-20 border-2 rounded-lg shadow bg-white">
                  <span className="text-sm font-medium">{table}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Dialog */}
      <Dialog open={openTableDialog} onOpenChange={setOpenTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tables</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <label className="block mb-2">Number of Tables</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={tableCount}
              onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value)))}
            />
            <Button className="mt-4 w-full" onClick={confirmAddTable}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <label className="block mb-2">Category Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <label className="block mt-4 mb-2">Number of Tables</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={initialTableCount}
              onChange={(e) => setInitialTableCount(Math.max(1, parseInt(e.target.value)))}
            />
            <Button className="mt-4 w-full" onClick={editingCategoryId ? updateCategory : addCategory}>
              {editingCategoryId ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}