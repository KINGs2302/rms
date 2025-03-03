"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react"; // Import Pencil icon

export default function TableManagement() {
  const [categories, setCategories] = useState([
    { id: 1, name: "VIP", tables: [1, 2, 3, 4, 5, 6] },
    { id: 2, name: "Outdoor", tables: [1, 2, 3, 4, 5] },
    { id: 3, name: "Family", tables: [1, 2] },
  ]);

  const [openTableDialog, setOpenTableDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableCount, setTableCount] = useState(1);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTableCount, setNewCategoryTableCount] = useState(1);

  // Open table add dialog
  const handleAddTable = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpenTableDialog(true);
  };

  // Add tables to an existing category
  const confirmAddTable = () => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === selectedCategory
          ? { ...category, tables: [...category.tables, ...Array.from({ length: tableCount }, (_, i) => category.tables.length + i + 1)] }
          : category
      )
    );
    setOpenTableDialog(false);
    setTableCount(1);
  };

  // Open category add dialog
  const handleAddCategory = () => {
    setOpenCategoryDialog(true);
  };

  // Add new category with tables
  const confirmAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newId = categories.length + 1;
    const newTables = Array.from({ length: newCategoryTableCount }, (_, i) => i + 1);

    setCategories([...categories, { id: newId, name: newCategoryName, tables: newTables }]);
    setOpenCategoryDialog(false);
    setNewCategoryName("");
    setNewCategoryTableCount(1);
  };

  return (
    <div className="w-full h-screen p-4 overflow-auto">
      <h1 className="text-2xl font-semibold mb-4 text-center">Table Management</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddCategory}>+ Add Table Category</Button>
      </div>

      <div className="space-y-6 w-full">
        {categories.map((category) => (
          <div key={category.id} className="p-4 border rounded-lg bg-gray-100 shadow-md w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <Button onClick={() => handleAddTable(category.id)} variant="outline">
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </div>
            <div className="flex flex-wrap justify-start gap-4 p-2">
              {category.tables.map((table) => (
                <div key={table} className="flex flex-col items-center justify-center w-20 h-20 border-2 rounded-lg shadow bg-white">
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

      {/* Add Category Dialog */}
      <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <label className="block mb-2">Category Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <label className="block mt-4 mb-2">Number of Tables</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              value={newCategoryTableCount}
              onChange={(e) => setNewCategoryTableCount(e.target.value ? Math.max(1, parseInt(e.target.value)) : 1)}
            />

            <Button className="mt-4 w-full" onClick={confirmAddCategory}>
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
