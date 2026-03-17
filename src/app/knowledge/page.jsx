/**
 * @file page.jsx (Knowledge Base)
 * @description Centralized read-only hub with Smart Bakery Deduplication, Preset Reheating, and Correct Sorting.
 */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../components/AuthProvider";
import { AccordionSection } from "../../components/ui/Containers";
import { t } from "../../utils/dictionary";

export default function KnowledgeBase() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [displayProducts, setDisplayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [reheatSettings, setReheatSettings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadKnowledgeData() {
      const [
        prodsRes,
        catsRes,
        recipesRes,
        ingsRes,
        outletsRes,
        opRes,
        reheatsRes,
      ] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true),
        supabase.from("product_categories").select("*").order("sort_order"),
        supabase.from("gramasi_recipes").select("*"),
        supabase.from("ingredients").select("*"),
        supabase.from("outlets").select("*"),
        supabase.from("outlet_products").select("*"),
        supabase.from("reheat_settings").select("*"),
      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (recipesRes.data) setRecipes(recipesRes.data);
      if (ingsRes.data) setIngredients(ingsRes.data);
      if (reheatsRes.data) setReheatSettings(reheatsRes.data);

      if (prodsRes.data && outletsRes.data && opRes.data) {
        const cibuburOutlet = outletsRes.data.find((o) =>
          o.name.toLowerCase().includes("cibubur"),
        );

        if (!cibuburOutlet) {
          // Safety fallback: Sort by sort_order first, then A-Z
          setDisplayProducts(
            prodsRes.data.sort((a, b) => {
              const orderA = a.sort_order ?? 0;
              const orderB = b.sort_order ?? 0;
              if (orderA !== orderB) return orderA - orderB;
              return a.name.localeCompare(b.name);
            }),
          );
        } else {
          const cibuburProducts = [];
          const otherProducts = [];

          // 1. Separate Cibubur's official products from the rest
          prodsRes.data.forEach((p) => {
            const pOutlets = opRes.data
              .filter((op) => op.product_id === p.id)
              .map((op) => op.outlet_id);
            if (pOutlets.includes(cibuburOutlet.id)) {
              cibuburProducts.push(p);
            } else {
              otherProducts.push(p);
            }
          });

          const finalProducts = [...cibuburProducts];

          // 2. Smart Deduplication: Only add 'Other' products if they don't share a core ingredient name
          otherProducts.forEach((op) => {
            // Strip generic words to find the "Core" name (e.g., "Almond Croissant" -> "almond")
            const cleanOpName = op.name
              .toLowerCase()
              .replace(/(croissant|danish|puff|slice|cake)/g, "")
              .trim();

            const isDuplicate = cibuburProducts.some((cp) => {
              const cleanCpName = cp.name
                .toLowerCase()
                .replace(/(croissant|danish|puff|slice|cake)/g, "")
                .trim();

              // Avoid matching empty or tiny strings accidentally
              if (cleanOpName.length < 3 || cleanCpName.length < 3)
                return false;

              // If the core names match or contain each other, it's a duplicate.
              return (
                cleanCpName.includes(cleanOpName) ||
                cleanOpName.includes(cleanCpName)
              );
            });

            if (!isDuplicate) {
              finalProducts.push(op);
            }
          });

          // 3. FIX: Sort by database `sort_order` FIRST (This pushes Cinere's 100 to the bottom)
          finalProducts.sort((a, b) => {
            const orderA = a.sort_order ?? 0;
            const orderB = b.sort_order ?? 0;
            if (orderA !== orderB) return orderA - orderB;
            // If they have the same sort_order, sort alphabetically
            return a.name.localeCompare(b.name);
          });

          setDisplayProducts(finalProducts);
        }
      }
      setIsLoading(false);
    }

    if (user) loadKnowledgeData();
  }, [user]);

  const filteredProducts = displayProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center font-bold text-stone-500">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-6 md:py-10 px-4 pb-28">
      <div className="max-w-4xl mx-auto">
        <div className="bg-stone-900 text-stone-50 p-6 md:p-8 shadow-md mb-6 md:mb-8 relative border-b-4 border-amber-600 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl hidden md:inline">📚</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {t("knowledge_title")}
              </h1>
            </div>
            <button
              onClick={() => router.push("/")}
              className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl font-bold text-sm md:text-base transition-colors flex items-center gap-2 shadow-sm"
            >
              {t("btn_back")}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-xl">🔍</span>
            </div>
            <input
              type="text"
              placeholder={t("knowledge_search_ph")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-white font-bold bg-stone-800 placeholder:text-stone-500 transition-colors shadow-inner"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center bg-white p-10 rounded-2xl border border-stone-200 shadow-sm text-stone-500 font-bold">
              {t("knowledge_empty")}
            </div>
          ) : (
            categories.map((cat) => {
              const catProds = filteredProducts.filter(
                (p) => p.category_id === cat.id,
              );

              if (catProds.length === 0) return null;

              const isOpen = searchQuery.length > 0;

              return (
                <AccordionSection
                  key={cat.id}
                  title={`📦 ${cat.name}`}
                  defaultOpen={isOpen}
                >
                  <div className="space-y-6">
                    {catProds.map((prod) => {
                      const prodRecipes = recipes.filter(
                        (r) => r.product_id === prod.id,
                      );
                      const reheat = reheatSettings.find(
                        (rs) => rs.id === prod.reheat_setting_id,
                      );

                      return (
                        <div
                          key={prod.id}
                          className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
                        >
                          <div className="bg-stone-50 p-4 md:p-5 border-b border-stone-200">
                            <h3 className="font-extrabold text-stone-800 text-xl">
                              {prod.name}
                            </h3>
                            {prod.is_base && (
                              <span className="inline-block mt-2 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                                Base Product / Adonan Utama
                              </span>
                            )}
                          </div>

                          <div className="p-4 md:p-5">
                            {/* Kitchen Specs */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block mb-1">
                                  {t("knowledge_proofing")}
                                </span>
                                <span className="font-bold text-stone-800">
                                  {prod.proofing_time_mins
                                    ? `${prod.proofing_time_mins} Min`
                                    : "-"}
                                </span>
                              </div>
                              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block mb-1">
                                  {t("knowledge_baking")}
                                </span>
                                <span className="font-bold text-stone-800">
                                  {prod.baking_time_mins
                                    ? `${prod.baking_time_mins} Min`
                                    : "-"}
                                </span>
                              </div>
                              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block mb-1">
                                  {t("knowledge_temp")}
                                </span>
                                <span className="font-bold text-stone-800">
                                  {prod.baking_temp_celsius
                                    ? `${prod.baking_temp_celsius}°C`
                                    : "-"}
                                </span>
                              </div>
                            </div>

                            {/* PRESET REHEATING (SPEED OVEN) */}
                            {reheat && (
                              <div className="mb-6 p-4 bg-orange-50/50 rounded-xl border border-orange-200/50">
                                <h4 className="font-bold text-orange-800 text-sm uppercase tracking-wide mb-3">
                                  🔥 Prosedur Reheating
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <span className="text-stone-500 block text-xs">
                                      Preset:
                                    </span>
                                    <span className="font-bold text-stone-800">
                                      {reheat.name}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-500 block text-xs">
                                      Durasi:
                                    </span>
                                    <span className="font-bold text-stone-800">
                                      {reheat.duration}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-500 block text-xs">
                                      Suhu:
                                    </span>
                                    <span className="font-bold text-stone-800">
                                      {reheat.temp}°C
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-stone-500 block text-xs">
                                      Blower:
                                    </span>
                                    <span className="font-bold text-stone-800">
                                      {reheat.blower}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Recipe Section */}
                            <div className="mb-4">
                              <h4 className="font-bold text-stone-700 text-sm uppercase tracking-wide mb-3">
                                {t("knowledge_recipe")}
                              </h4>
                              {prodRecipes.length > 0 ? (
                                <ul className="space-y-2">
                                  {prodRecipes.map((r) => {
                                    const ing = ingredients.find(
                                      (i) => i.id === r.ingredient_id,
                                    );
                                    if (!ing) return null;
                                    return (
                                      <li
                                        key={r.id}
                                        className="flex justify-between items-center border-b border-stone-100 pb-2"
                                      >
                                        <span className="text-stone-600 font-medium">
                                          {ing.name}
                                        </span>
                                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-sm">
                                          {r.amount_per_unit} {ing.unit}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="text-stone-400 italic text-sm">
                                  Tidak ada resep bahan tercatat.
                                </p>
                              )}
                            </div>

                            {/* Rich Text SOP Output */}
                            {prod.production_notes && (
                              <div className="mt-6 p-4 md:p-5 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wide mb-3">
                                  {t("knowledge_notes")}
                                </h4>
                                <div
                                  className="text-stone-700 text-sm leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-2 [&>strong]:font-bold [&>em]:italic"
                                  dangerouslySetInnerHTML={{
                                    __html: prod.production_notes,
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionSection>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
