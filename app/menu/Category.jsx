import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";

export default function Category({ categories, setSelectedCategory, selectedCategory, fetchCategories }) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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

  return (
    <aside className="w-full md:w-1/6 mb-2 bg-gray-200 h-full flex flex-col transition-transform duration-300">
      <h2 className="text-xl p-5 text-right font-semibold text-gray-800">
        Categories
      </h2>
      <div className="flex-1 overflow-y-auto px-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`p-3 w-full text-right rounded-r-full transition-all duration-300 transform ${selectedCategory === cat.category
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
    </aside>
  );
}