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
    <div className="space-y-8">
      <Card title={t("prod_title")} subtitle={t("prod_subtitle")}>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="bg-gray-100 text-sm">
                <th className="p-2 border-b">{t("prod_col_name")}</th>
                <th className="p-2 border-b">{t("prod_col_cat")}</th>
                <th className="p-2 border-b text-center">
                  {t("prod_col_status")}
                </th>
                <th className="p-2 border-b text-right">
                  {t("prod_col_actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {existingProducts.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b text-sm hover:bg-gray-50 ${!p.is_active && "opacity-60 bg-gray-50"}`}
                >
                  <td className="p-2 font-bold">{p.name}</td>
                  <td className="p-2">{p.product_categories?.name || "-"}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => toggleActive(p.id, p.is_active)}
                      className={`text-xs px-2 py-1 rounded font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}
                    >
                      {p.is_active ? t("prod_active") : t("prod_disabled")}
                    </button>
                  </td>
                  <td className="p-2 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-800 font-bold px-2"
                    >
                      {t("btn_edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-red-600 hover:text-red-800 font-bold px-2"
                    >
                      {t("btn_delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <hr />

      <form
        onSubmit={handleSubmit}
        className="space-y-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {editingId ? `${t("prod_editing")} ${name}` : t("prod_add_new")}
          </h2>
          {editingId && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t("btn_cancel")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="p-4 bg-white rounded border border-gray-200 shadow-sm">
          <label className="flex items-center gap-2 cursor-pointer font-bold mb-2">
            <input
              type="checkbox"
              checked={isBase}
              onChange={(e) => {
                setIsBase(e.target.checked);
                setBaseProductId("");
              }}
              className="w-5 h-5 text-blue-600 rounded"
            />
            {t("prod_is_base")}
          </label>
          {!isBase && (
            <UniversalInput
              type="select"
              label={t("prod_deducts_from")}
              value={baseProductId}
              onChange={setBaseProductId}
              options={baseProducts}
            />
          )}
        </div>

        <Card title={t("prod_recipe_title")} subtitle={t("prod_recipe_sub")}>
          {recipe.map((row, index) => (
            <div key={index} className="flex gap-2 items-end mb-3">
              <div className="flex-1">
                <UniversalInput
                  type="select"
                  value={row.ingredient_id}
                  onChange={(val) =>
                    handleRecipeChange(index, "ingredient_id", val)
                  }
                  options={ingredientsList}
                />
              </div>
              <div className="w-24">
                <UniversalInput
                  type="number"
                  placeholder="Amt"
                  value={row.amount}
                  onChange={(val) => handleRecipeChange(index, "amount", val)}
                />
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => setRecipe(recipe.filter((_, i) => i !== index))}
              >
                X
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setRecipe([...recipe, { ingredient_id: "", amount: "" }])
            }
          >
            {t("prod_add_ing")}
          </Button>
        </Card>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full py-3 shadow-md"
        >
          {editingId ? t("prod_btn_update") : t("prod_btn_save")}
        </Button>
      </form>
    </div>
  );
}
