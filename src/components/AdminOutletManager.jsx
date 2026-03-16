"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";
import { t } from "../utils/dictionary";

export default function AdminOutletManager() {
  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);

  const [outletName, setOutletName] = useState("");
  const [outletType, setOutletType] = useState("fresh_bake");

  const [selectedOutletId, setSelectedOutletId] = useState("");
  const [outletProductIds, setOutletProductIds] = useState([]);
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
    if (o) setOutlets(o);
    if (p) setProducts(p);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchOutletDetails() {
      if (!selectedOutletId) {
        setOutletProductIds([]);
        return;
      }
      const { data } = await supabase
        .from("outlet_products")
        .select("product_id")
        .eq("outlet_id", selectedOutletId);
      if (data) setOutletProductIds(data.map((d) => d.product_id));
    }
    fetchOutletDetails();
  }, [selectedOutletId]);

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

  const toggleOutletActive = async (id, currentStatus) => {
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

  return (
    <div className="space-y-8">
      <Card title={t("out_title_1")} subtitle={t("out_sub_1")}>
        <form
          onSubmit={handleCreateOutlet}
          className="flex flex-col md:flex-row gap-3 items-end mb-6"
        >
          <div className="flex-1 w-full">
            <UniversalInput
              label={t("out_name")}
              value={outletName}
              onChange={setOutletName}
              required
              placeholder={t("out_name_ph")}
            />
          </div>
          <div className="flex-1 w-full">
            <UniversalInput
              type="select"
              label={t("out_type")}
              value={outletType}
              onChange={setOutletType}
              options={[
                { id: "fresh_bake", name: t("out_type_fresh") },
                { id: "frozen_goods", name: t("out_type_frozen") },
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
            {t("out_btn_add")}
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
                  {o.is_active ? t("out_active") : t("out_disabled")}
                </button>
                <button
                  onClick={() => handleDeleteOutlet(o.id, o.name)}
                  className="text-xs text-red-600 font-bold px-2 hover:underline"
                >
                  {t("btn_delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <hr />

      <Card title={t("out_title_2")} subtitle={t("out_sub_2")}>
        <UniversalInput
          type="select"
          label={t("out_select")}
          value={selectedOutletId}
          onChange={setSelectedOutletId}
          options={outlets.filter((o) => o.is_active)}
          className="mb-6"
        />

        {selectedOutletId && (
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">
              {t("out_avail_prods")}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{t("out_avail_desc")}</p>

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
        )}
      </Card>
    </div>
  );
}
