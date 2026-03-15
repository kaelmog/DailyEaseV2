"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase"; // Adjust path if needed
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
        .eq("is_base", true);
      const { data: ings } = await supabase
        .from("ingredients")
        .select("id, name, unit");

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
    setRecipe([{ ingredient_id: "", amount: "" }]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto pb-10">
      <Card
        title="1. Basic Information"
        subtitle="Name and sorting order for the UI"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            label="Product Name"
            value={name}
            onChange={setName}
            required
            placeholder="e.g., Almond Croissant"
          />
          <UniversalInput
            type="select"
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={categories}
            required
          />
          <UniversalInput
            type="number"
            label="Sort Order (1-25)"
            value={sortOrder}
            onChange={setSortOrder}
            required
          />
        </div>
      </Card>

      <Card
        title="2. Shaping Logic"
        subtitle="Link this product to its raw base (e.g., Butter Croissant)"
      >
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBase}
              onChange={(e) => {
                setIsBase(e.target.checked);
                setBaseProductId("");
              }}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="font-semibold text-gray-700">
              This IS a Base Product (Generates Source Stock)
            </span>
          </label>

          {!isBase && (
            <UniversalInput
              type="select"
              label="Deducts Shaping Stock From:"
              value={baseProductId}
              onChange={setBaseProductId}
              options={baseProducts}
              placeholder="Select Base (Optional)..."
            />
          )}
        </div>
      </Card>

      <Card
        title="3. Production Specs"
        subtitle="Time and temperature for the kitchen"
      >
        <div className="grid grid-cols-3 gap-4">
          <UniversalInput
            type="number"
            label="Proofing (Mins)"
            value={proofingTime}
            onChange={setProofingTime}
          />
          <UniversalInput
            type="number"
            label="Baking (Mins)"
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
      </Card>

      <Card
        title="4. Gramasi Engine"
        subtitle="Raw materials used per 1 item produced (In)"
      >
        {recipe.map((row, index) => (
          <div key={index} className="flex gap-2 items-end mb-3">
            <div className="flex-1">
              <UniversalInput
                type="select"
                label={index === 0 ? "Ingredient" : ""}
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
                label={index === 0 ? "Amount" : ""}
                value={row.amount}
                onChange={(val) => handleRecipeChange(index, "amount", val)}
              />
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={() => setRecipe(recipe.filter((_, i) => i !== index))}
              className="mb-0.5"
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
          + Add Ingredient
        </Button>
      </Card>

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full py-4 text-lg"
      >
        Save Product to ERP
      </Button>
    </form>
  );
}
