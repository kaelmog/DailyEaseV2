/**
 * @file AdminIngredientManager.jsx
 * @description Provides full CRUD operations for Ingredients with i18n support.
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
    const { data } = await supabase
      .from("ingredients")
      .select("*")
      .order("sort_order");
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
    <div className="space-y-8">
      <Card
        title={editingId ? t("ing_title_edit") : t("ing_title_add")}
        subtitle={t("ing_subtitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-3 items-end mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
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
                variant="secondary"
                onClick={resetForm}
                className="flex-1"
              >
                {t("btn_cancel")}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              {editingId ? t("btn_save") : t("btn_add")}
            </Button>
          </div>
        </form>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="flex justify-between items-center p-3 border rounded bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div>
                <span className="font-bold text-gray-800">{ing.name}</span>
                <span className="text-gray-500 text-sm font-normal ml-1">
                  ({ing.unit})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEdit(ing)}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  {t("btn_edit")}
                </button>
                <button
                  onClick={() => handleDelete(ing.id, ing.name)}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  {t("btn_delete")}
                </button>
              </div>
            </div>
          ))}
          {ingredients.length === 0 && (
            <p className="text-center text-gray-500 text-sm italic p-4">
              {t("ing_empty")}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
