"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../dashboard/navbar/page";
import Image from "next/image";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";

const sampleMenu = [];

export default function Menu() {
  // Store categories as objects: { id, category }
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("Menu");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
  });

  const filteredMenu =
    selectedCategory === "All"
      ? sampleMenu
      : sampleMenu.filter((item) => item.category === selectedCategory);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories and store them as objects { id, category }
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/categories?filters[restro_name][$eq]=${restro_name}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const categoriesData = response.data.data.map((cat) => ({
        id: cat.id,
        category: cat.category,
        documentId: cat.documentId,
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategories = async () => {
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

      const updatedFormData = { data: { category: newCategory, restro_name } };

      await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/categories",
        updatedFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Category added successfully!");
      fetchCategories();
      setNewCategory("");
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error(
        "Error adding category",
        error.response?.data || error.message
      );
      toast.error("Failed to add category");
    }
  };

  // Delete only the currently selected category (if not "All")
  const deleteSelectedCategory = async () => {
    const selectedCatObj = categories.find(
      (cat) => cat.category === selectedCategory
    );
    console.log(selectedCatObj);
    if (!selectedCatObj) {
      toast.error("No category selected for deletion.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing. Please log in.");
        return;
      }
      await axios.delete(
        `https://restro-backend-0ozo.onrender.com/api/categories/${selectedCatObj.documentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Category deleted successfully!");
      // Reset selection to "All" after deletion
      setSelectedCategory("All");
      fetchCategories();
    } catch (error) {
      console.error(
        "Error deleting category",
        error.response?.data || error.message
      );
      toast.error("Failed to delete category");
    }
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price.trim() && newItem.image.trim()) {
      sampleMenu.push({ ...newItem, id: sampleMenu.length + 1 });
      setNewItem({ name: "", category: "", price: "", image: "" });
      setIsItemModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 relative">
      <Navbar active={active} setActive={setActive} />
      <ToastContainer />

      {/* Add Item Button */}
      <button
        className="absolute top-5 right-5 px-5 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-300 hover:text-black transition"
        onClick={() => {
          setNewItem({
            ...newItem,
            category: selectedCategory !== "All" ? selectedCategory : "",
          });
          setIsItemModalOpen(true);
        }}
      >
        + Add Item
      </button>

      {/* Sidebar Categories */}
      <aside className="w-1/6 mb-2 bg-gray-200 h-full flex flex-col transition-transform duration-300">
        <h2 className="text-xl p-5 text-right font-semibold text-gray-800">
          Categories
        </h2>
        <div className="flex-1 overflow-y-auto px-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`p-3 w-full text-right rounded-r-full transition-all duration-300 transform ${
                selectedCategory === cat.category
                  ? "text-white mb-1 mt-1 bg-gray-700 scale-110 text-xl font-bold border-solid border-blue-500 border-2"
                  : "text-gray-700 text-l bg-gray-200 scale-80 opacity-90 text-base border-solid border-2"
              }`}
              onClick={() => setSelectedCategory(cat.category)}
            >
              {cat.category}
            </button>
          ))}
        </div>
        <div className="p-3 flex flex-col gap-2">
          <button
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-300 hover:text-black transition"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            + Add Category
          </button>
          {/* Delete button appears only when a category other than "All" is selected */}
          {selectedCategory !== "All" && (
            <Button
              variant="destructive"
              onClick={deleteSelectedCategory}
              className="w-full"
            >
              Delete Selected Category
            </Button>
          )}
        </div>
      </aside>

      {/* Menu Items */}
      <main className="flex-1 p-5 flex flex-wrap gap-5 justify-center items-start overflow-y-auto">
        <h1 className="text-2xl font-bold w-full text-center">
          {selectedCategory} Menu
        </h1>
        <div className="flex flex-wrap gap-5 justify-center">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl shadow-md w-64 text-center"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={150}
                height={150}
                className="rounded-full mx-auto"
              />
              <h3 className="text-lg font-semibold mt-3">{item.name}</h3>
              <p className="text-gray-600">{item.category}</p>
              <p className="text-blue-600 font-bold">{item.price}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent aria-describedby="">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <p id="add-category-description" className="text-sm text-gray-500">
              Enter the name for the new category below.
            </p>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={addCategories}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <Input
            type="text"
            placeholder="Category"
            value={newItem.category}
            disabled
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <Input
            type="text"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="mt-2 border p-2 w-full rounded-lg"
          />

          {/* Image Upload Input */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setNewItem({ ...newItem, image: file });
              }
            }}
            className="mt-2 border p-2 w-full rounded-lg"
          />

          {/* Image Preview */}
          {newItem.image && (
            <img
              src={URL.createObjectURL(newItem.image)}
              alt="Preview"
              className="mt-2 w-full h-40 object-cover rounded-lg"
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddItem}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
