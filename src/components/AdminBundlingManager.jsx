"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";
import { formatIDR } from "../utils/closingMath";
import { t } from "../utils/dictionary";

export default function AdminBundlingManager() {
  const [bundlings, setBundlings] = useState([]);
  const [products, setProducts] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState([{ product_id: "", qty: 1 }]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const { data: prods } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name");
    const { data: bunds } = await supabase
      .from("bundlings")
      .select("*, bundling_items(qty, products(id, name))")
      .order("created_at", { ascending: false });
    if (prods) setProducts(prods);
    if (bunds) setBundlings(bunds);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setIsActive(true);
    setItems([{ product_id: "", qty: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let targetBundlingId = editingId;
    const payload = { name, price: price || 0, is_active: isActive };

    if (editingId) {
      const { error } = await supabase
        .from("bundlings")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        alert("Error: " + error.message);
        setIsLoading(false);
        return;
      }
      await supabase
        .from("bundling_items")
        .delete()
        .eq("bundling_id", editingId);
    } else {
      const { data, error } = await supabase
        .from("bundlings")
        .insert([payload])
        .select()
        .single();
      if (error) {
        alert("Error: " + error.message);
        setIsLoading(false);
        return;
      }
      targetBundlingId = data.id;
    }

    const validItems = items.filter((i) => i.product_id && i.qty > 0);
    if (validItems.length > 0) {
      const inserts = validItems.map((i) => ({
        bundling_id: targetBundlingId,
        product_id: i.product_id,
        qty: i.qty,
      }));
      await supabase.from("bundling_items").insert(inserts);
    }

    alert(editingId ? t("bndl_alert_update") : t("bndl_alert_add"));
    setIsLoading(false);
    resetForm();
    fetchData();
  };

  const handleEdit = (b) => {
    setEditingId(b.id);
    setName(b.name);
    setPrice(b.price);
    setIsActive(b.is_active);
    if (b.bundling_items && b.bundling_items.length > 0) {
      setItems(
        b.bundling_items.map((i) => ({
          product_id: i.products.id,
          qty: i.qty,
        })),
      );
    } else {
      setItems([{ product_id: "", qty: 1 }]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm(t("bndl_alert_delete"))) return;
    await supabase.from("bundlings").delete().eq("id", id);
    if (editingId === id) resetForm();
    fetchData();
  };

  return (
    <div className="space-y-8">
      <Card
        title={editingId ? t("bndl_title_edit") : t("bndl_title_add")}
        subtitle={t("bndl_subtitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UniversalInput
              label={t("bndl_name")}
              value={name}
              onChange={setName}
              required
              placeholder={t("bndl_name_ph")}
            />
            <UniversalInput
              type="number"
              label={t("bndl_price")}
              value={price}
              onChange={setPrice}
              required
            />
          </div>

          <div className="p-4 bg-white rounded border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-1">
              {t("bndl_items_title")}
            </h3>
            <p className="text-xs text-gray-500 mb-4">{t("bndl_items_sub")}</p>
            {items.map((row, index) => (
              <div key={index} className="flex gap-2 items-end mb-3">
                <div className="flex-1">
                  <UniversalInput
                    type="select"
                    value={row.product_id}
                    onChange={(val) =>
                      handleItemChange(index, "product_id", val)
                    }
                    options={products}
                  />
                </div>
                <div className="w-20">
                  <UniversalInput
                    type="number"
                    placeholder={t("bndl_qty")}
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
              {t("bndl_add_item")}
            </Button>
          </div>

          <div className="flex gap-2 justify-end">
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                {t("btn_cancel")}
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {editingId ? t("btn_save") : t("btn_add")}
            </Button>
          </div>
        </form>

        <div className="space-y-3 max-h-96 overflow-y-auto mt-6">
          {bundlings.map((b) => (
            <div
              key={b.id}
              className="p-4 border rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex justify-between items-start mb-2 border-b pb-2">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{b.name}</h4>
                  <span className="text-sm font-semibold text-green-700">
                    {formatIDR(b.price)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(b)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    {t("btn_edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    {t("btn_delete")}
                  </button>
                </div>
              </div>
              <ul className="list-disc pl-5 text-xs text-gray-600">
                {b.bundling_items?.map((item, idx) => (
                  <li key={idx}>
                    {item.qty}x {item.products?.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {bundlings.length === 0 && (
            <p className="text-center text-gray-500 text-sm italic p-4">
              {t("bndl_empty")}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
