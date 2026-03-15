"use client";
import React, { useState } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminCategoryForm({ onCategoryAdded }) {
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("product_categories")
      .insert([{ name, sort_order: sortOrder }]);

    setIsLoading(false);

    if (error) {
      alert("Error saving category: " + error.message);
    } else {
      alert("Category added successfully!");
      setName("");
      setSortOrder(0);
      if (onCategoryAdded) onCategoryAdded(); // Trigger a refresh in the product form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <Card
        title="Add New Product Category"
        subtitle="e.g., Bread, Pastry, Beverage. The sort order determines which category appears first in the closing app."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <UniversalInput
              label="Category Name"
              value={name}
              onChange={setName}
              required
              placeholder="e.g., Viennoiserie"
            />
          </div>
          <div>
            <UniversalInput
              type="number"
              label="Sort Order (1, 2, 3...)"
              value={sortOrder}
              onChange={setSortOrder}
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            variant="secondary"
            isLoading={isLoading}
            className="w-full"
          >
            Save Category
          </Button>
        </div>
      </Card>
    </form>
  );
}
