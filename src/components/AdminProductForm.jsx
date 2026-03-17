/**
 * @file AdminProductForm.jsx
 * @description Standalone form to add/edit products and their recipes (Premium UI).
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminProductForm() {
  // --- Form State ---
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  // Shaping State
  const [isBase, setIsBase] = useState(false);
  const [baseProductId, setBaseProductId] = useState("");

  // Specs State
  const [proofingTime, setProofingTime] = useState("");
  const [bakingTime, setBakingTime] = useState("");
  const [bakingTemp, setBakingTemp] = useState("");
  const [productionNotes, setProductionNotes] = useState("");

  // Recipe State (Gramasi)
  const [recipe, setRecipe] = useState([{ ingredient_id: "", amount: "" }]);

  // --- Dropdown Data ---
  const [categories, setCategories] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase
        .from("product_categories")
        .select("id, name")
        .order("sort_order");
      const { data: bases } = await supabase
        .from("products")
        .select("id, name")
        .eq("is_base", true)
        .order("name", { ascending: true });
      const { data: ings } = await supabase
        .from("ingredients")
        .select("id, name, unit")
        .order("name", { ascending: true }); // Alphabetical sorting for fillings

      if (cats) setCategories(cats);
      if (bases) setBaseProducts(bases);
      if (ings)
        setIngredientsList(
          ings.map((i) => ({ id: i.id, name: `${i.name} (${i.unit})` })),
        );
    }
    fetchData();
  }, []);

  // --- Handlers ---
  const handleRecipeChange = (index, field, value) => {
    const newRecipe = [...recipe];
    newRecipe[index][field] = value;
    setRecipe(newRecipe);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Insert Product
    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
          category_id: categoryId || null,
          sort_order: sortOrder,
          is_base: isBase,
          base_product_id: isBase ? null : baseProductId || null,
          proofing_time_mins: proofingTime || null,
          baking_time_mins: bakingTime || null,
          baking_temp_celsius: bakingTemp || null,
          production_notes: productionNotes || null,
        },
      ])
      .select()
      .single();

    if (productError) {
      alert("Error saving product: " + productError.message);
      setIsLoading(false);
      return;
    }

    // 2. Insert Gramasi Recipe (if valid rows exist)
    const validRecipes = recipe.filter((r) => r.ingredient_id && r.amount);
    if (validRecipes.length > 0) {
      const recipeInserts = validRecipes.map((r) => ({
        product_id: newProduct.id,
        ingredient_id: r.ingredient_id,
        amount_per_unit: r.amount,
      }));

      await supabase.from("gramasi_recipes").insert(recipeInserts);
    }

    alert("Product successfully mapped and saved!");
    setIsLoading(false);

    // Reset form to blank
    setName("");
    setCategoryId("");
    setSortOrder(0);
    setIsBase(false);
    setBaseProductId("");
    setProofingTime("");
    setBakingTime("");
    setBakingTemp("");
    setProductionNotes("");
    setRecipe([{ ingredient_id: "", amount: "" }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-stone-200">
        <div className="mb-6 border-b border-stone-100 pb-4">
          <h2 className="text-2xl font-extrabold text-stone-800">
            Tambah Produk Baru
          </h2>
          <p className="text-stone-500">
            Masukkan detail produk dan resep gramasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="lg:col-span-2">
            <UniversalInput
              label="Nama Produk"
              value={name}
              onChange={setName}
              required
              placeholder="e.g., Almond Croissant"
            />
          </div>
          <div className="lg:col-span-2">
            <UniversalInput
              type="select"
              label="Kategori"
              value={categoryId}
              onChange={setCategoryId}
              options={categories}
              required
            />
          </div>
          <div className="lg:col-span-1">
            <UniversalInput
              type="number"
              label="Urutan Tampil"
              value={sortOrder}
              onChange={setSortOrder}
              required
            />
          </div>
          <div className="lg:col-span-3">
            <UniversalInput
              label="Catatan Produksi"
              value={productionNotes}
              onChange={setProductionNotes}
              placeholder="Opsional..."
            />
          </div>
        </div>

        {/* Shaping Logic Block */}
        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 shadow-sm mb-8">
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
            Ini ADALAH Produk Base (Menghasilkan Stok Sisa / Raw)
          </label>

          {!isBase && (
            <div className="md:w-1/2 mt-2">
              <UniversalInput
                type="select"
                label="Mengurangi Stok Dari (Shaping):"
                value={baseProductId}
                onChange={setBaseProductId}
                options={baseProducts}
                placeholder="Pilih Base (Opsional)..."
              />
            </div>
          )}
        </div>

        {/* Specs Block */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <UniversalInput
            type="number"
            label="Proofing (Menit)"
            value={proofingTime}
            onChange={setProofingTime}
          />
          <UniversalInput
            type="number"
            label="Baking (Menit)"
            value={bakingTime}
            onChange={setBakingTime}
          />
          <UniversalInput
            type="number"
            label="Temp (°C)"
            value={bakingTemp}
            onChange={setBakingTemp}
          />
        </div>

        {/* Recipe Block */}
        <div className="p-5 md:p-6 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
          <div className="mb-5 border-b border-stone-200 pb-3">
            <h3 className="font-extrabold text-stone-800 text-lg">
              Resep Gramasi
            </h3>
            <p className="text-stone-500 text-sm">
              Bahan baku yang digunakan per 1 unit produksi
            </p>
          </div>

          <div className="space-y-3 mb-5">
            {recipe.map((row, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-white rounded-xl border border-stone-200 shadow-sm"
              >
                <div className="flex-1 w-full">
                  <UniversalInput
                    type="select"
                    label={index === 0 ? "Bahan / Ingredient" : ""}
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
                    label={index === 0 ? "Amount" : ""}
                    value={row.amount}
                    onChange={(val) => handleRecipeChange(index, "amount", val)}
                  />
                </div>
                {/* Fixed perfectly aligned Hapus button */}
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setRecipe(recipe.filter((_, i) => i !== index))
                  }
                  className="w-full sm:w-[50px] h-[50px] flex items-center justify-center shrink-0"
                >
                  <span className="sm:hidden">Hapus</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 hidden sm:block"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setRecipe([...recipe, { ingredient_id: "", amount: "" }])
            }
            className="py-3 px-6 text-sm bg-white"
          >
            + Tambah Bahan
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full py-4 text-lg font-bold shadow-lg hover:scale-[1.01] transition-transform"
      >
        Simpan Produk Baru
      </Button>
    </form>
  );
}
