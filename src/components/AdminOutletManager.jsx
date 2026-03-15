"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminOutletManager() {
  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [outletName, setOutletName] = useState("");
  const [outletType, setOutletType] = useState("fresh_bake");

  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [outletProductIds, setOutletProductIds] = useState([]);
  const [formatString, setFormatString] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const { data: o } = await supabase
      .from("outlets")
      .select("*")
      .order("name");
    const { data: p } = await supabase
      .from("products")
      .select("id, name, category_id, product_categories(name)")
      .eq("is_active", true)
      .order("sort_order");
    const { data: t } = await supabase.from("whatsapp_templates").select("*");

    if (o) setOutlets(o);
    if (p) setProducts(p);
    if (t) setTemplates(t);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchOutletDetails() {
      if (!selectedOutletId) {
        setOutletProductIds([]);
        setFormatString("");
        return;
      }

      const { data } = await supabase
        .from("outlet_products")
        .select("product_id")
        .eq("outlet_id", selectedOutletId);
      if (data) setOutletProductIds(data.map((d) => d.product_id));

      const existingTemplate = templates.find(
        (t) =>
          t.outlet_id === selectedOutletId &&
          t.template_type === "closing_shift",
      );
      setFormatString(existingTemplate ? existingTemplate.format_string : "");
    }
    fetchOutletDetails();
  }, [selectedOutletId, templates]);

  const handleCreateOutlet = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from("outlets")
      .insert([{ name: outletName, outlet_type: outletType, is_active: true }]);
    setIsLoading(false);

    if (error) alert("Error: " + error.message);
    else {
      alert("Outlet created!");
      setOutletName("");
      fetchData();
    }
  };

  // --- ACTIONS: FIX TOGGLE & DELETE ---
  const toggleOutletActive = async (id, currentStatus) => {
    // Explicit null-check logic to force toggle
    const newStatus = currentStatus === true ? false : true;
    await supabase
      .from("outlets")
      .update({ is_active: newStatus })
      .eq("id", id);
    fetchData();
  };

  const handleDeleteOutlet = async (id, name) => {
    if (!confirm(`Delete outlet ${name} permanently?`)) return;
    await supabase.from("outlets").delete().eq("id", id);
    if (selectedOutletId === id) setSelectedOutletId("");
    fetchData();
  };

  const handleToggleProduct = async (productId) => {
    if (!selectedOutletId) return alert("Select an outlet first.");
    const isMapped = outletProductIds.includes(productId);
    if (isMapped) {
      await supabase
        .from("outlet_products")
        .delete()
        .match({ outlet_id: selectedOutletId, product_id: productId });
      setOutletProductIds((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase
        .from("outlet_products")
        .insert([{ outlet_id: selectedOutletId, product_id: productId }]);
      setOutletProductIds((prev) => [...prev, productId]);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedOutletId) return alert("Select an outlet first.");
    setIsLoading(true);

    const existingTemplate = templates.find(
      (t) =>
        t.outlet_id === selectedOutletId && t.template_type === "closing_shift",
    );
    let error;
    if (existingTemplate) {
      const res = await supabase
        .from("whatsapp_templates")
        .update({ format_string: formatString })
        .eq("id", existingTemplate.id);
      error = res.error;
    } else {
      const res = await supabase
        .from("whatsapp_templates")
        .insert([
          {
            outlet_id: selectedOutletId,
            template_type: "closing_shift",
            format_string: formatString,
          },
        ]);
      error = res.error;
    }

    setIsLoading(false);
    if (error) alert("Error saving template: " + error.message);
    else {
      alert("Template saved!");
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      <Card
        title="1. Manage Outlets"
        subtitle="Create, disable, or delete branch locations."
      >
        <form
          onSubmit={handleCreateOutlet}
          className="flex flex-col md:flex-row gap-3 items-end mb-6"
        >
          <div className="flex-1 w-full">
            <UniversalInput
              label="Outlet Name"
              value={outletName}
              onChange={setOutletName}
              required
              placeholder="e.g., RS Puri Cinere"
            />
          </div>
          <div className="flex-1 w-full">
            <UniversalInput
              type="select"
              label="Outlet Type"
              value={outletType}
              onChange={setOutletType}
              options={[
                { id: "fresh_bake", name: "Fresh Bake (Shapes Dough)" },
                { id: "frozen_goods", name: "Frozen Goods (Reheat Only)" },
              ]}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full md:w-auto"
          >
            Add Outlet
          </Button>
        </form>

        <div className="space-y-2">
          {outlets.map((o) => (
            <div
              key={o.id}
              className={`flex justify-between items-center p-3 border rounded ${!o.is_active && "bg-gray-50 opacity-60"}`}
            >
              <div>
                <span className="font-bold">{o.name}</span>
                <span className="ml-3 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase font-bold tracking-wider">
                  {o.outlet_type.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleOutletActive(o.id, o.is_active)}
                  className={`text-xs px-3 py-1 rounded font-bold shadow-sm ${o.is_active ? "bg-green-100 text-green-700" : "bg-gray-300 text-gray-800"}`}
                >
                  {o.is_active ? "🟢 Active" : "🔴 Disabled"}
                </button>
                <button
                  onClick={() => handleDeleteOutlet(o.id, o.name)}
                  className="text-xs text-red-600 font-bold px-2 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <hr />

      <Card
        title="2. Outlet Configurations"
        subtitle="Select an outlet to manage its menu and WhatsApp templates."
      >
        <UniversalInput
          type="select"
          label="Select Outlet to Configure"
          value={selectedOutletId}
          onChange={setSelectedOutletId}
          options={outlets.filter((o) => o.is_active)}
          className="mb-6"
        />

        {selectedOutletId && (
          <div className="space-y-8">
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">
                Available Products
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Check items sold at this outlet. Unchecked items are hidden from
                their closing app.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 bg-gray-50 border rounded">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 p-3 bg-white hover:bg-blue-50 cursor-pointer border rounded shadow-sm transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      checked={outletProductIds.includes(p.id)}
                      onChange={() => handleToggleProduct(p.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">
                        {p.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {p.product_categories?.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
              <h3 className="font-bold text-gray-800 mb-2">
                WhatsApp Template Generator
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Use variables: <code>{`{outlet_name}`}</code>,{" "}
                <code>{`{sales_data}`}</code>, <code>{`{inventory_data}`}</code>
                , <code>{`{gramasi_data}`}</code>.
              </p>

              <UniversalInput
                type="textarea"
                label="Format String"
                value={formatString}
                onChange={setFormatString}
                className="h-64 font-mono text-sm leading-relaxed"
                placeholder="*LAPORAN CLOSING SHIFT*\nOutlet: {outlet_name}\n\n*💰 PENJUALAN*\n{sales_data}\n\n*📦 INVENTORY*\n{inventory_data}\n\n*⚖️ GRAMASI*\n{gramasi_data}"
              />

              <div className="mt-4 text-right">
                <Button
                  variant="primary"
                  onClick={handleSaveTemplate}
                  isLoading={isLoading}
                >
                  Save Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
