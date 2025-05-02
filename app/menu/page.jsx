"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import Category from "./Category";
import { ToastContainer, toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Menu() {
  const [categories, setCategories] = useState([
    { id: "all", category: "All" },
  ]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    id: "",
    documentId: "",
    name: "",
    category: "",
    price: "",
    quantity: "",
    parameter: "gm",
    image: null,
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
    } finally {
      setLoading(false);
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
      const restro_name = localStorage.getItem("restroname");

      if (
        !newItem.name ||
        !newItem.category ||
        !newItem.price ||
        !newItem.quantity ||
        !newItem.image ||
        !newItem.parameter
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
        return;
      }

      // Build the payload JSON
      const payload = {
        data: {
          item_name: newItem.name,
          price: Number(newItem.price),
          restro_name,
          quantity: Number(newItem.quantity),
          category: categoryObj.id,
          parameter: newItem.parameter,
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

  // API: Update menu item
  const handleUpdateItem = async () => {
    try {
      const token = localStorage.getItem("token");
      const restro_name = localStorage.getItem("restroname");

      if (!newItem.documentId) {
        toast.error("Invalid item ID. Cannot update.");
        return;
      }

      if (
        !newItem.name ||
        !newItem.category ||
        !newItem.price ||
        !newItem.quantity ||
        !newItem.parameter
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

      const categoryObj = categories?.find(
        (cat) => cat.category === newItem.category
      );

      if (!categoryObj) {
        toast.error("Category not found. Please check the category name.");
        return;
      }

      let imageId = newItem.image;
      if (newItem.image instanceof File) {
        imageId = await uploadImage(newItem.image);
        if (!imageId) {
          toast.error("Image upload failed.");
          return;
        }
      }

      const payload = {
        data: {
          item_name: newItem.name,
          price: Number(newItem.price),
          restro_name: restro_name,
          quantity: Number(newItem.quantity),
          category: categoryObj.documentId,
          parameter: newItem.parameter,
          image: imageId || newItem.image?.documentId,
        },
      };

      console.log("Payload:", payload);

      const response = await axios.put(
        `https://restro-backend-0ozo.onrender.com/api/menus/${newItem.documentId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Update response:", response.data);

      toast.success("Menu item updated successfully!");
      fetchMenuItems();
      setIsItemModalOpen(false);
      setIsEditMode(false);
      setNewItem({
        id: "",
        documentId: "",
        name: "",
        category: "",
        price: "",
        quantity: "",
        parameter: "gm",
        image: null,
      });
    } catch (error) {
      console.error("Error updating menu item:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || "Failed to update menu item."
      );
    }
  };

  // API: Delete menu item
  const handleDeleteItem = async (documentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://restro-backend-0ozo.onrender.com/api/menus/${documentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Menu item deleted successfully!");
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error.response?.data || error);
      toast.error("Failed to delete menu item. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 relative min-w-full">
      <ToastContainer />
      {selectedCategory !== "All" && (
        <button
          className="absolute top-5 right-5 py-2 px-5 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-500 transition"
          onClick={() => {
            setNewItem((prev) => ({
              ...prev,
              category: selectedCategory,
            }));
            setIsItemModalOpen(true);
          }}
        >
          + Add Item
        </button>
      )}

      <Category
        categories={categories}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        fetchCategories={fetchCategories}
      />

<main className="flex-1 p-5 overflow-y-auto">
  <h1 className="text-3xl font-bold w-full flex items-center gap-2 mb-6">
    <ShoppingCart className="w-7 h-7 text-blue-500" /> {selectedCategory} Menu
  </h1>

  {loading ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 p-2">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="w-full h-64 rounded-lg" />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 p-2">
      {filteredMenu.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 rounded-2xl shadow-md text-center h-fit transition transform hover:scale-105 hover:shadow-xl"
        >
          {item.image?.url && (
            <img
              src={item.image.url}
              alt={item.item_name}
              className="rounded-full mx-auto w-24 h-24"
            />
          )}
          <h3 className="text-lg font-semibold mt-3 truncate">
            {item.item_name}
          </h3>
          <p className="text-gray-600 truncate">
            Price: <span className="text-red-500 font-bold">{item.price}/- Rs.</span>
          </p>
          <p className="text-gray-600 truncate">
            Category: {item.category?.category}
          </p>
          <p className="text-gray-700 truncate">
            Quantity: {item.quantity} {item.parameter}
          </p>
          <div className="flex justify-center items-center mt-2 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewItem({
                  id: item.id,
                  documentId: item.documentId,
                  name: item.item_name,
                  category: item.category.category,
                  price: item.price,
                  quantity: item.quantity,
                  parameter: item.parameter,
                  image: item.image.id,
                });
                setIsEditMode(true);
                setIsItemModalOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteItem(item.documentId)}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}
</main>


      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Item" : "Add New Item"}
            </DialogTitle>
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
            readOnly
            className="mt-2 border p-2 w-full rounded-lg bg-gray-100 cursor-text"
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
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
              }
              className="border p-2 w-full rounded-lg"
            />
            <select
              value={newItem.parameter}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, parameter: e.target.value }))
              }
              className="border p-2 rounded-lg"
            >
              <option value="gm">Grams</option>
              <option value="ml">Milliliters</option>
              <option value="kg">Kilograms</option>
              <option value="ltr">Liters</option>
              <option value="inch">Inches</option>
              <option value="pcs">Pieces</option>
            </select>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setNewItem((prev) => ({ ...prev, image: file }));
              }
            }}
            className="mt-2 border p-2 w-full rounded-lg"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsItemModalOpen(false);
                setIsEditMode(false);
                setNewItem({
                  id: "",
                  documentId: "",
                  name: "",
                  category: "",
                  price: "",
                  quantity: "",
                  parameter: "gm",
                  image: null,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditMode ? handleUpdateItem : handleAddItem}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isEditMode ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
