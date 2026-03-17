/**
 * @file AdminIngredientManager.jsx
 * @description Provides full CRUD operations for Ingredients with Premium POS UI and Alphabetical Sorting.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";
import { t } from "../utils/dictionary";

export default function AdminIngredientManager() {
  const [ingredients, setIngredients] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("Gram");
  const [sortOrder, setSortOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIngredients = async () => {
    // FIX: Changed from sort_order to name ascending (A-Z)
    const { data } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });
    if (data) setIngredients(data);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchIngredients();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setUnit("Gram");
    setSortOrder(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { name, unit, sort_order: sortOrder };

    if (editingId) {
      const { error } = await supabase
        .from("ingredients")
        .update(payload)
        .eq("id", editingId);
      if (error) alert("Error: " + error.message);
      else {
        alert(t("ing_alert_update"));
        resetForm();
        fetchIngredients();
      }
    } else {
      const { error } = await supabase.from("ingredients").insert([payload]);
      if (error) alert("Error: " + error.message);
      else {
        alert(t("ing_alert_add"));
        resetForm();
        fetchIngredients();
      }
    }
    setIsLoading(false);
  };

  const handleEdit = (ing) => {
    setEditingId(ing.id);
    setName(ing.name);
    setUnit(ing.unit);
    setSortOrder(ing.sort_order || 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, ingName) => {
    if (!confirm(t("ing_alert_delete"))) return;
    await supabase.from("ingredients").delete().eq("id", id);
    if (editingId === id) resetForm();
    fetchIngredients();
  };

  return (
    <div className="space-y-6">
      <Card
        title={editingId ? t("ing_title_edit") : t("ing_title_add")}
        subtitle={t("ing_subtitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 items-end mb-8 bg-stone-50 p-5 md:p-6 rounded-2xl border border-stone-200 shadow-sm"
        >
          <div className="flex-1 w-full">
            <UniversalInput
              label={t("ing_name")}
              value={name}
              onChange={setName}
              required
              placeholder={t("ing_name_ph")}
            />
          </div>
          <div className="w-full md:w-32">
            <UniversalInput
              label={t("ing_unit")}
              value={unit}
              onChange={setUnit}
              required
              placeholder={t("ing_unit_ph")}
            />
          </div>
          <div className="w-full md:w-24">
            <UniversalInput
              type="number"
              label={t("ing_sort")}
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
            {ingredients.map((ing) => (
              <div
                key={ing.id}
                className="flex justify-between items-center p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
              >
                <div>
                  <span className="font-bold text-stone-800 text-lg">
                    {ing.name}
                  </span>
                  <span className="text-stone-500 text-xs font-bold ml-3 bg-stone-100 px-2.5 py-1 rounded-md tracking-wider uppercase border border-stone-200 shadow-sm">
                    {ing.unit}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleEdit(ing)}
                    className="text-sm text-amber-600 font-bold hover:text-amber-700 transition-colors"
                  >
                    {t("btn_edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(ing.id, ing.name)}
                    className="text-sm text-red-500 font-bold hover:text-red-700 transition-colors"
                  >
                    {t("btn_delete")}
                  </button>
                </div>
              </div>
            ))}
            {ingredients.length === 0 && (
              <p className="text-center text-stone-500 text-sm italic p-8">
                {t("ing_empty")}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
