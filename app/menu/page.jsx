"use client";

import React, { useState } from "react";
import Navbar from "../dashboard/navbar/page";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = ["All", "Punjabi", "South", "Italian", "Chinese"];
const sampleMenu = [
  { id: 1, name: "Paneer Tikka", price: "$10", category: "Punjabi", image: "/paneer-tikka.jpg" },
  { id: 2, name: "Dosa", price: "$8", category: "South", image: "/dosa.jpg" },
  { id: 3, name: "Pasta", price: "$12", category: "Italian", image: "/pasta.jpg" },
  { id: 4, name: "Spring Rolls", price: "$7", category: "Chinese", image: "/spring-rolls.jpg" },
];

export default function Menu() {
  const [active, setActive] = useState("Menu");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({ name: "", category: "", price: "", image: "" });

  const filteredMenu = selectedCategory === "All" ? sampleMenu : sampleMenu.filter((item) => item.category === selectedCategory);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      categories.push(newCategory);
      setNewCategory("");
      setIsCategoryModalOpen(false);
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

      {/* Add Item Button */}
      <button
        className="absolute top-5 right-5 px-5 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-300 hover:text-black transition"
        onClick={() => {
          setNewItem({ ...newItem, category: selectedCategory !== "All" ? selectedCategory : "" });
          setIsItemModalOpen(true);
        }}
      >
        + Add Item
      </button>

      {/* Sidebar Categories */}
      <aside className="w-1/6 mb-2 bg-gray-200 h-full flex flex-col transition-transform duration-300">
        <h2 className="text-xl p-5 text-right font-semibold text-gray-800">Categories</h2>
        <div className="flex-1 overflow-y-auto px-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`p-3 w-full text-right rounded-r-full transition-all duration-300 transform ${
                selectedCategory === cat
                  ? "text-white mb-1 mt-1 bg-gray-700 scale-110 text-xl font-bold border-solid border-blue-500 border-2"
                  : "text-gray-700 text-l bg-gray-200 scale-80 opacity-90 text-base border-solid border-2"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="p-3">
          <button
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-300 hover:text-black transition"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            + Add Category
          </button>
        </div>
      </aside>

      {/* Menu Items */}
      <main className="flex-1 p-5 flex flex-wrap gap-5 justify-center items-start overflow-y-auto">
        <h1 className="text-2xl font-bold w-full text-center">{selectedCategory} Menu</h1>
        <div className="flex flex-wrap gap-5 justify-center">
          {filteredMenu.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-md w-64 text-center">
              <Image src={item.image} alt={item.name} width={150} height={150} className="rounded-full mx-auto" />
              <h3 className="text-lg font-semibold mt-3">{item.name}</h3>
              <p className="text-gray-600">{item.category}</p>
              <p className="text-blue-600 font-bold">{item.price}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <Input type="text" placeholder="Enter category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="mt-2 border p-2 w-full rounded-lg" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory} className="bg-blue-600 text-white hover:bg-blue-700">Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <Input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="mt-2 border p-2 w-full rounded-lg" />
          <Input type="text" placeholder="Category" value={newItem.category} disabled className="mt-2 border p-2 w-full rounded-lg" />
          <Input type="text" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="mt-2 border p-2 w-full rounded-lg" />
          <Input type="text" placeholder="Image URL" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} className="mt-2 border p-2 w-full rounded-lg" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} className="bg-green-600 text-white hover:bg-green-700">Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}