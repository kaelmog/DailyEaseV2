"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminBundlingManager() {
  const [bundlings, setBundlings] = useState([]);
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [items, setItems] = useState([{ product_id: "", qty: 1 }]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const { data: b } = await supabase
      .from("bundlings")
      .select("*, bundling_items(qty, products(name))")
      .order("created_at");
    const { data: p } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (b) setBundlings(b);
    if (p) setProducts(p.map((prod) => ({ id: prod.id, name: prod.name })));
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: newBundle, error } = await supabase
      .from("bundlings")
      .insert([{ name, price }])
      .select()
      .single();

    if (error) {
      alert("Error: " + error.message);
      setIsLoading(false);
      return;
    }

    const validItems = items.filter((i) => i.product_id && i.qty > 0);
    if (validItems.length > 0) {
      const inserts = validItems.map((i) => ({
        bundling_id: newBundle.id,
        product_id: i.product_id,
        qty: i.qty,
      }));
      await supabase.from("bundling_items").insert(inserts);
    }

    setIsLoading(false);
    setName("");
    setPrice(0);
    setItems([{ product_id: "", qty: 1 }]);
    fetchData();
  };

  const toggleActive = async (id, currentStatus) => {
    await supabase
      .from("bundlings")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-8">
      <Card title="Active Bundlings & Hampers">
        <div className="space-y-4">
          {bundlings.map((b) => (
            <div
              key={b.id}
              className={`p-4 border rounded-lg ${!b.is_active && "opacity-50 bg-gray-50"}`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">
                  {b.name} - Rp{b.price.toLocaleString("id-ID")}
                </h3>
                <Button
                  variant={b.is_active ? "success" : "ghost"}
                  onClick={() => toggleActive(b.id, b.is_active)}
                  className="text-xs"
                >
                  {b.is_active ? "Active" : "Disabled"}
                </Button>
              </div>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {b.bundling_items.map((item, idx) => (
                  <li key={idx}>
                    {item.qty}x {item.products?.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold">Create New Bundle/Hamper</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            label="Bundle Name"
            value={name}
            onChange={setName}
            required
          />
          <UniversalInput
            type="currency"
            label="Bundle Price"
            value={price}
            onChange={setPrice}
            required
          />
        </div>
        <Card title="Products Included">
          {items.map((row, index) => (
            <div key={index} className="flex gap-2 items-end mb-3">
              <div className="flex-1">
                <UniversalInput
                  type="select"
                  value={row.product_id}
                  onChange={(val) => handleItemChange(index, "product_id", val)}
                  options={products}
                />
              </div>
              <div className="w-24">
                <UniversalInput
                  type="number"
                  placeholder="Qty"
                  value={row.qty}
                  onChange={(val) => handleItemChange(index, "qty", val)}
                />
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => setItems(items.filter((_, i) => i !== index))}
              >
                X
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setItems([...items, { product_id: "", qty: 1 }])}
          >
            + Add Product
          </Button>
        </Card>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Save Bundle
        </Button>
      </form>
    </div>
  );
}
