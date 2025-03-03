"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function TableManagement() {
  const [categories, setCategories] = useState([
    { id: 1, name: "VIP", tables: [1, 2, 3, 4, 5, 6] },
    { id: 2, name: "Outdoor", tables: [7, 8, 9, 10, 11] },
    { id: 3, name: "Family", tables: [12, 13, 14, 15, 16, 17] },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tableCount, setTableCount] = useState(1);

  const handleAddTable = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpenDialog(true);
  };

  const confirmAddTable = () => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === selectedCategory
          ? { ...category, tables: [...category.tables, ...Array.from({ length: tableCount }, (_, i) => category.tables.length + i + 1)] }
          : category
      )
    );
    setOpenDialog(false);
    setTableCount(1);
  };

  return (
    <div className="p-4 overflow-auto h-screen">
      <h1 className="text-2xl font-semibold mb-4">Table Management</h1>
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="p-4 border rounded-lg bg-gray-100 shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <Button onClick={() => handleAddTable(category.id)}>Add Table</Button>
            </div>
            <div className="grid grid-cols-5 gap-4 overflow-x-auto max-h-40 p-2">
              {category.tables.map((table) => (
                <div key={table} className="flex flex-col items-center justify-center w-16 h-16 border-2 rounded-lg shadow bg-white">
                  <span className="text-sm font-medium">{table}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Table Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
    </div>
  );
}
