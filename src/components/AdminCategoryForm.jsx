/**
 * @file AdminCategoryForm.jsx
 * @description Provides CRUD operations for Categories with Premium POS UI.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";
import { t } from "../utils/dictionary";

export default function AdminCategoryForm() {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("product_categories")
      .select("*")
      .order("sort_order");
    if (data) setCategories(data);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSortOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name, sort_order: sortOrder };

    if (editingId) {
      const { error } = await supabase
        .from("product_categories")
        .update(payload)
        .eq("id", editingId);
      if (error) alert("Error: " + error.message);
      else {
        alert(t("cat_alert_update"));
        resetForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from("product_categories")
        .insert([payload]);
      if (error) alert("Error: " + error.message);
      else {
        alert(t("cat_alert_add"));
        resetForm();
        fetchCategories();
      }
    }
    setIsLoading(false);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSortOrder(cat.sort_order || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(t("cat_alert_delete"))) return;
    await supabase.from("product_categories").delete().eq("id", id);
    if (editingId === id) resetForm();
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <Card
        title={editingId ? t("cat_title_edit") : t("cat_title_add")}
        subtitle={t("cat_subtitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 items-end mb-8 bg-stone-50 p-5 md:p-6 rounded-2xl border border-stone-200 shadow-sm"
        >
          <div className="flex-1 w-full">
            <UniversalInput
              label={t("cat_name")}
              value={name}
              onChange={setName}
              required
              placeholder={t("cat_name_ph")}
            />
          </div>
          <div className="w-full md:w-24">
            <UniversalInput
              type="number"
              label={t("cat_sort")}
              value={sortOrder}
              onChange={setSortOrder}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                className="h-[50px] px-4 border border-stone-300"
              >
                {t("btn_cancel")}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="h-[50px] px-8 text-base"
            >
              {editingId ? t("btn_save") : t("btn_add")}
            </Button>
          </div>
        </form>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
              >
                <span className="font-bold text-stone-800 text-lg">
                  {cat.name}
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="text-sm text-amber-600 font-bold hover:text-amber-700 transition-colors"
                  >
                    {t("btn_edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-sm text-red-500 font-bold hover:text-red-700 transition-colors"
                  >
                    {t("btn_delete")}
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-stone-500 text-sm italic p-8">
                {t("cat_empty")}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
