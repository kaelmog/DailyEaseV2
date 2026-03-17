/**
 * @file AdminProductManager.jsx
 * @description Master Product manager with Premium POS UI and sleek data tables.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";
import { t } from "../utils/dictionary";

export default function AdminProductManager() {
  const [existingProducts, setExistingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isBase, setIsBase] = useState(false);
  const [baseProductId, setBaseProductId] = useState("");
  const [productionNotes, setProductionNotes] = useState("");
  const [recipe, setRecipe] = useState([{ ingredient_id: "", amount: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const { data: prods } = await supabase
      .from("products")
      .select("*, product_categories(name)")
      .order("sort_order");
    const { data: cats } = await supabase
      .from("product_categories")
      .select("*")
      .order("sort_order");
    const { data: bases } = await supabase
      .from("products")
      .select("*")
      .eq("is_base", true);
    const { data: ings } = await supabase
      .from("ingredients")
      .select("*")
      .order("name");

    if (prods) setExistingProducts(prods);
    if (cats) setCategories(cats);
    if (bases) setBaseProducts(bases);
    if (ings)
      setIngredientsList(
        ings.map((i) => ({ id: i.id, name: `${i.name} (${i.unit})` })),
      );
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  const toggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    await supabase
      .from("products")
      .update({ is_active: newStatus })
      .eq("id", id);
    fetchData();
  };

  const handleDelete = async (id, prodName) => {
    if (!confirm(`Delete ${prodName} permanently?`)) return;
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  const handleEdit = async (p) => {
    setEditingId(p.id);
    setName(p.name);
    setCategoryId(p.category_id || "");
    setSortOrder(p.sort_order || 0);
    setIsBase(p.is_base || false);
    setBaseProductId(p.base_product_id || "");
    setProductionNotes(p.production_notes || "");

    const { data: existingRecipe } = await supabase
      .from("gramasi_recipes")
      .select("*")
      .eq("product_id", p.id);
    if (existingRecipe && existingRecipe.length > 0) {
      setRecipe(
        existingRecipe.map((r) => ({
          ingredient_id: r.ingredient_id,
          amount: r.amount_per_unit,
        })),
      );
    } else {
      setRecipe([{ ingredient_id: "", amount: "" }]);
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategoryId("");
    setSortOrder(0);
    setIsBase(false);
    setBaseProductId("");
    setProductionNotes("");
    setRecipe([{ ingredient_id: "", amount: "" }]);
  };

  const handleRecipeChange = (index, field, value) => {
    const newRecipe = [...recipe];
    newRecipe[index][field] = value;
    setRecipe(newRecipe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const productPayload = {
      name,
      category_id: categoryId || null,
      sort_order: sortOrder,
      is_base: isBase,
      base_product_id: isBase ? null : baseProductId || null,
      production_notes: productionNotes || null,
    };

    let targetProductId = editingId;

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", editingId);
      if (error) {
        alert("Error: " + error.message);
        setIsLoading(false);
        return;
      }
      await supabase
        .from("gramasi_recipes")
        .delete()
        .eq("product_id", editingId);
    } else {
      const { data: newProduct, error } = await supabase
        .from("products")
        .insert([productPayload])
        .select()
        .single();
      if (error) {
        alert("Error: " + error.message);
        setIsLoading(false);
        return;
      }
      targetProductId = newProduct.id;
    }

    const validRecipes = recipe.filter((r) => r.ingredient_id && r.amount);
    if (validRecipes.length > 0) {
      const recipeInserts = validRecipes.map((r) => ({
        product_id: targetProductId,
        ingredient_id: r.ingredient_id,
        amount_per_unit: r.amount,
      }));
      await supabase.from("gramasi_recipes").insert(recipeInserts);
    }

    alert(editingId ? "Product Updated!" : "Product Saved!");
    setIsLoading(false);
    resetForm();
    fetchData();
  };

  return (
    <div className="space-y-10">
      {/* PRODUCTS TABLE */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-stone-800">
            {t("prod_title")}
          </h2>
          <p className="text-sm text-stone-500">{t("prod_subtitle")}</p>
        </div>
        <div className="max-h-[32rem] overflow-y-auto overflow-x-auto w-full border border-stone-200 rounded-2xl shadow-sm bg-white scrollbar-thin scrollbar-thumb-stone-200">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 bg-stone-100 shadow-sm z-10">
              <tr className="text-xs text-stone-500 uppercase tracking-wider">
                <th className="p-4 border-b border-stone-200 font-bold">
                  {t("prod_col_name")}
                </th>
                <th className="p-4 border-b border-stone-200 font-bold">
                  {t("prod_col_cat")}
                </th>
                <th className="p-4 border-b border-stone-200 font-bold text-center">
                  {t("prod_col_status")}
                </th>
                <th className="p-4 border-b border-stone-200 font-bold text-right">
                  {t("prod_col_actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {existingProducts.map((p) => (
                <tr
                  key={p.id}
                  className={`transition-colors hover:bg-stone-50 ${!p.is_active && "opacity-60 bg-stone-50"}`}
                >
                  <td className="p-4 font-bold text-stone-800 text-base">
                    {p.name}
                  </td>
                  <td className="p-4 text-stone-600 font-medium text-sm">
                    {p.product_categories?.name || "-"}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive(p.id, p.is_active)}
                      className={`text-xs px-3 py-1.5 rounded-md font-bold transition-transform hover:scale-105 border shadow-sm ${p.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-stone-200 text-stone-600 border-stone-300"}`}
                    >
                      {p.is_active ? t("prod_active") : t("prod_disabled")}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-sm text-amber-600 hover:text-amber-700 font-bold transition-colors"
                    >
                      {t("btn_edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-sm text-red-500 hover:text-red-700 font-bold transition-colors"
                    >
                      {t("btn_delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-stone-200" />

      {/* PRODUCT EDITOR FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 border border-stone-200 rounded-[2rem] shadow-md space-y-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{editingId ? "✏️" : "➕"}</span>
            <h2 className="text-xl md:text-2xl font-extrabold text-stone-800">
              {editingId ? `Mengedit: ${name}` : t("prod_add_new")}
            </h2>
          </div>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              className="border border-stone-200"
            >
              {t("btn_cancel")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <UniversalInput
            label={t("prod_name")}
            value={name}
            onChange={setName}
            required
          />
          <UniversalInput
            type="select"
            label={t("prod_cat")}
            value={categoryId}
            onChange={setCategoryId}
            options={categories}
            required
          />
          <UniversalInput
            type="number"
            label={t("prod_sort")}
            value={sortOrder}
            onChange={setSortOrder}
            required
          />
          <UniversalInput
            label={t("prod_notes")}
            value={productionNotes}
            onChange={setProductionNotes}
          />
        </div>

        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
          <label className="flex items-center gap-3 cursor-pointer font-bold mb-4 text-stone-800 md:text-lg">
            <input
              type="checkbox"
              checked={isBase}
              onChange={(e) => {
                setIsBase(e.target.checked);
                setBaseProductId("");
              }}
              className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
            />
            {t("prod_is_base")}
          </label>
          {!isBase && (
            <div className="md:w-1/2">
              <UniversalInput
                type="select"
                label={t("prod_deducts_from")}
                value={baseProductId}
                onChange={setBaseProductId}
                options={baseProducts}
              />
            </div>
          )}
        </div>

        <div className="p-5 md:p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="mb-5">
            <h3 className="font-extrabold text-stone-800 text-lg">
              {t("prod_recipe_title")}
            </h3>
            <p className="text-stone-500 text-sm">{t("prod_recipe_sub")}</p>
          </div>

          {recipe.map((row, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row gap-3 items-end mb-4 p-4 bg-stone-50 rounded-xl border border-stone-200"
            >
              <div className="flex-1 w-full">
                <UniversalInput
                  type="select"
                  label="Bahan / Ingredient"
                  value={row.ingredient_id}
                  onChange={(val) =>
                    handleRecipeChange(index, "ingredient_id", val)
                  }
                  options={ingredientsList}
                />
              </div>
              <div className="w-full sm:w-32">
                <UniversalInput
                  type="number"
                  label="Amount"
                  placeholder="0"
                  value={row.amount}
                  onChange={(val) => handleRecipeChange(index, "amount", val)}
                />
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => setRecipe(recipe.filter((_, i) => i !== index))}
                className="w-full sm:w-auto mt-2 sm:mt-0 h-[50px] px-6"
              >
                Hapus
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setRecipe([...recipe, { ingredient_id: "", amount: "" }])
            }
            className="py-3 px-6 text-sm"
          >
            {t("prod_add_ing")}
          </Button>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full py-4 text-lg font-bold shadow-lg hover:scale-[1.01] transition-transform"
        >
          {editingId ? t("prod_btn_update") : t("prod_btn_save")}
        </Button>
      </form>
    </div>
  );
}
