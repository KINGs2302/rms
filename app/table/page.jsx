"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function table() {
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState({});
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tableCount, setTableCount] = useState("");

  // Load stored categories and tables on mount
  useEffect(() => {
    const storedCategories = JSON.parse(localStorage.getItem("categories")) || [];
    const storedTables = JSON.parse(localStorage.getItem("tables")) || {};
    setCategories(storedCategories);
    setTables(storedTables);
  }, []);

  // Save categories and tables in localStorage whenever they update
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("tables", JSON.stringify(tables));
  }, [categories, tables]);

  // Add a new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setTables({ ...tables, [newCategory]: [] });
      setNewCategory("");
    }
  };

  // Add tables to a category
  const handleAddTables = () => {
    const count = parseInt(tableCount);
    if (selectedCategory && count > 0) {
      const existingTables = tables[selectedCategory] || [];
      const newTables = Array.from(
        { length: count },
        (_, i) => `${selectedCategory}-Table-${existingTables.length + i + 1}`
      );
      setTables({
        ...tables,
        [selectedCategory]: [...existingTables, ...newTables],
      });
      setTableCount("");
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-semibold mb-5">Table Management</h1>

      {/* Add Category */}
      <Card className="mb-5 p-4 bg-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle>Add Table Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button className="bg-gray-900 hover:bg-gray-800" onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Tables */}
      <Card className="mb-5 p-4 bg-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle>Add Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select Category</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Number of Tables</Label>
              <Input
                type="number"
                placeholder="Enter No. of Tables"
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
                min="1"
              />
            </div>
          </div>
          <Button
            className="mt-3 bg-gray-900 hover:bg-gray-800 w-full"
            onClick={handleAddTables}
            disabled={!selectedCategory || !tableCount || tableCount <= 0}
          >
            Add Tables
          </Button>
        </CardContent>
      </Card>

      {/* Display Tables in Card Format */}
      {categories.length > 0 && (
        <Card className="p-4 bg-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle>Tables List</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.map((category, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-xl font-semibold mb-3">{category} Tables</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tables[category]?.length > 0 ? (
                    tables[category].map((table, tableIndex) => (
                      <Card key={tableIndex} className="p-3 bg-white shadow-md">
                        <h4 className="text-lg font-semibold">{table}</h4>
                      </Card>
                    ))
                  ) : (
                    <p className="text-gray-600 col-span-full">No tables added yet</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
