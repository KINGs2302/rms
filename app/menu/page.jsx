"use client";

import React, { useState, useEffect } from "react";
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

export default function Menu() {
  const [categories, setCategories] = useState([
    { id: "all", category: "All" },
  ]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    pera: "",
    image: null, // will store file object
  });

  const filteredMenu =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category.category === selectedCategory);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  // API: fetch menu items
  const fetchMenuItems = async () => {
    try {
      const restro_name = localStorage.getItem("restroname");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/menus?populate=*&filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenuItems(response.data.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  // API: fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");
      const response = await axios.get(
        `https://restro-backend-0ozo.onrender.com/api/categories?filters[restro_name][$eq]=${restro_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const categoriesData = response.data.data.map((cat) => ({
        id: cat.id,
        category: cat.category,
        documentId: cat.documentId,
      }));
      setCategories([{ id: "all", category: "All" }, ...categoriesData]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // API: add new category
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

      const payload = { data: { category: newCategory, restro_name } };

      await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/categories",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Category added successfully!");
      fetchCategories();
      setNewCategory("");
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error(
        "Error adding category:",
        error.response?.data || error.message
      );
      toast.error("Failed to add category");
    }
  };

  // API: delete selected category
  const deleteSelectedCategory = async () => {
    const selectedCatObj = categories.find(
      (cat) => cat.category === selectedCategory
    );
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category deleted successfully!");
      setSelectedCategory("All");
      fetchCategories();
    } catch (error) {
      console.error(
        "Error deleting category:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete category");
    }
  };

  // API: Upload image and return image id
  const uploadImage = async (file) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing. Please log in.");
        return null;
      }
      const formData = new FormData();
      formData.append("files", file);
      const response = await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Assuming response.data returns an array with file details
      return response.data[0]?.id || null;
    } catch (error) {
      console.error("Error uploading image:", error.response?.data || error);
      toast.error("Image upload failed");
      return null;
    }
  };

  // API: Add new menu item
  const handleAddItem = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname") || "Test";

      if (
        !newItem.name ||
        !newItem.category ||
        !newItem.price ||
        !newItem.quantity ||
        !newItem.image
      ) {
        toast.error("All fields are required!");
        return;
      }

      if (isNaN(Number(newItem.price))) {
        toast.error("Price must be a number!");
        return;
      }

      if (isNaN(Number(newItem.quantity)) || Number(newItem.quantity) <= 0) {
        toast.error("Quantity must be a positive number!");
        return;
      }

      const categoryObj = categories.find(
        (cat) => cat.category === newItem.category
      );
      if (!categoryObj) {
        toast.error("Category not found. Please check the category name.");
        return;
      }

      // First, upload image and get the image id
      const imageId = await uploadImage(newItem.image);
      if (!imageId) {
        return; // Image upload failed, do not proceed
      }

      // Build the payload JSON
      const payload = {
        data: {
          item_name: newItem.name,
          price: Number(newItem.price),
          restro_name,
          quantity: Number(newItem.quantity),
          category: categoryObj.id,
          pera: newItem.pera,
          image: imageId,
        },
      };

      await axios.post(
        "https://restro-backend-0ozo.onrender.com/api/menus",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Menu item added successfully!");
      fetchMenuItems();
      setIsItemModalOpen(false);
    } catch (error) {
      console.error("Error adding menu item:", error.response?.data || error);
      toast.error("Failed to add menu item. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 relative min-w-full">
      <ToastContainer />

      <button
        className="absolute top-5 right-5 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-300 hover:text-black transition"
        onClick={() => {
          setNewItem((prev) => ({
            ...prev,
            category: selectedCategory !== "All" ? selectedCategory : "",
          }));
          setIsItemModalOpen(true);
        }}
      >
        + Add Item
      </button>

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
                src={item.image.formats.thumbnail.url}
                alt="image"
                width={150}
                height={150}
                className="rounded-full mx-auto"
              />
              <h3 className="text-lg font-semibold mt-3">{item.item_name}</h3>
              <p className="text-gray-600">{item.category.category}</p>
              <p className="text-blue-600 font-bold">₹ {item.price} Rs.</p>
              {/* <p className="text-gray-700">Quantity: {item.quantity} {item.pera}</p> */}
            </div>
          ))}
        </div>
      </main>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <p className="text-sm text-gray-500">
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

      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, name: e.target.value }))
            }
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <Input
            type="text"
            placeholder="Category"
            value={newItem.category}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, category: e.target.value }))
            }
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <Input
            type="number"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, price: e.target.value }))
            }
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <div className="mt-2 flex gap-2">
            <Input
              type="text"
              placeholder="quantity"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
              }
              className="border p-2 w-full rounded-lg"
            />

            <select
              value={newItem.unit}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="border p-2 rounded-lg"
            >
              <option value="gm">Grams</option>
              <option value="ml">Milliliters</option>
              <option value="kg">Kilograms</option>
              <option value="ltr">Liters</option>
            </select>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                // store the file object instead of a URL
                setNewItem((prev) => ({ ...prev, image: file }));
              }
            }}
            className="mt-2 border p-2 w-full rounded-lg"
          />
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
