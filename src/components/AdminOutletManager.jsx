/**
 * @file AdminOutletManager.jsx
 * @description Manage outlets and their active menus with Premium POS UI.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminOutletManager() {
  const [outlets, setOutlets] = useState([]);
  const [products, setProducts] = useState([]);
  const [outletProductsMap, setOutletProductsMap] = useState([]);

  const [name, setName] = useState("");
  const [outletType, setOutletType] = useState("fresh_bake");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState("");

  const fetchAll = async () => {
    const { data: oData } = await supabase
      .from("outlets")
      .select("*")
      .order("name");
    const { data: pData } = await supabase
      .from("products")
      .select("*")
      .order("sort_order");
    const { data: opData } = await supabase.from("outlet_products").select("*");
    if (oData) setOutlets(oData);
    if (pData) setProducts(pData);
    if (opData) setOutletProductsMap(opData);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchAll();
  }, []);

  const handleAddOutlet = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from("outlets")
      .insert([{ name, outlet_type: outletType }]);
    setIsLoading(false);
    if (error) alert(error.message);
    else {
      alert("Outlet added!");
      setName("");
      fetchAll();
    }
  };

  const toggleOutletStatus = async (id, currentStatus) => {
    await supabase
      .from("outlets")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    fetchAll();
  };

  const deleteOutlet = async (id) => {
    if (!confirm("Hapus outlet ini? (Pastikan tidak ada report yang terikat)"))
      return;
    await supabase.from("outlets").delete().eq("id", id);
    if (selectedOutletId === id) setSelectedOutletId("");
    fetchAll();
  };

  const toggleProductInOutlet = async (productId, currentStatus) => {
    if (!selectedOutletId) return;
    if (currentStatus) {
      await supabase
        .from("outlet_products")
        .delete()
        .match({ outlet_id: selectedOutletId, product_id: productId });
    } else {
      await supabase
        .from("outlet_products")
        .insert([{ outlet_id: selectedOutletId, product_id: productId }]);
    }
    fetchAll();
  };

  const toggleAllProducts = async (enableAll) => {
    if (!selectedOutletId) return;
    if (enableAll) {
      const inserts = products.map((p) => ({
        outlet_id: selectedOutletId,
        product_id: p.id,
      }));
      await supabase
        .from("outlet_products")
        .upsert(inserts, { onConflict: "outlet_id,product_id" });
    } else {
      await supabase
        .from("outlet_products")
        .delete()
        .eq("outlet_id", selectedOutletId);
    }
    fetchAll();
  };

  return (
    <div className="space-y-8">
      {/* Outlet Creation Card */}
      <Card
        title="Kelola Outlet"
        subtitle="Buat, nonaktifkan, atau hapus lokasi cabang."
      >
        <form
          onSubmit={handleAddOutlet}
          className="flex flex-col md:flex-row gap-4 items-end mb-8 bg-stone-50 p-5 md:p-6 rounded-2xl border border-stone-200 shadow-sm"
        >
          <div className="flex-1 w-full">
            <UniversalInput
              label="Nama Outlet"
              value={name}
              onChange={setName}
              placeholder="cth., RS Puri Cinere"
              required
            />
          </div>
          <div className="w-full md:w-64">
            <UniversalInput
              type="select"
              label="Tipe Outlet"
              value={outletType}
              onChange={setOutletType}
              options={[
                { id: "fresh_bake", name: "Fresh Bake" },
                { id: "frozen_goods", name: "Frozen Goods" },
              ]}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="h-[50px] px-8 w-full md:w-auto"
          >
            Tambah Outlet
          </Button>
        </form>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          {outlets.map((o) => (
            <div
              key={o.id}
              className={`flex justify-between items-center p-4 border-b border-stone-100 last:border-0 transition-colors ${!o.is_active ? "bg-stone-50 opacity-60" : "hover:bg-stone-50"}`}
            >
              <div>
                <span className="font-bold text-stone-800 text-lg">
                  {o.name}
                </span>
                <span className="text-blue-600 text-xs font-bold ml-3 bg-blue-50 px-2.5 py-1 rounded-md tracking-wider uppercase border border-blue-100">
                  {o.outlet_type?.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleOutletStatus(o.id, o.is_active)}
                  className={`text-xs px-3 py-1.5 rounded-md font-bold transition-transform hover:scale-105 border shadow-sm ${o.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-stone-200 text-stone-600 border-stone-300"}`}
                >
                  {o.is_active ? "Aktif" : "Nonaktif"}
                </button>
                <button
                  onClick={() => deleteOutlet(o.id)}
                  className="text-sm text-red-500 font-bold hover:text-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Outlet Menu Configuration Card */}
      <Card
        title="Konfigurasi Menu Outlet"
        subtitle="Pilih produk yang tersedia untuk dijual dan dihitung sisa stoknya di outlet tertentu."
      >
        <div className="mb-6">
          <UniversalInput
            type="select"
            label="Pilih Outlet untuk Dikonfigurasi"
            value={selectedOutletId}
            onChange={setSelectedOutletId}
            options={outlets.filter((o) => o.is_active)}
          />
        </div>

        {selectedOutletId && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-stone-100 pb-4">
              <h3 className="font-extrabold text-stone-800 text-lg">
                Daftar Produk
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => toggleAllProducts(true)}
                  className="text-xs py-2 px-4"
                >
                  Pilih Semua
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => toggleAllProducts(false)}
                  className="text-xs py-2 px-4 border border-stone-200"
                >
                  Hapus Semua
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200 pr-2">
              {products.map((p) => {
                const isActive = outletProductsMap.some(
                  (op) =>
                    op.outlet_id === selectedOutletId && op.product_id === p.id,
                );
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isActive ? "bg-amber-50/50 border-amber-200" : "bg-stone-50 border-stone-200 opacity-60 hover:opacity-100"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleProductInOutlet(p.id, isActive)}
                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="font-bold text-stone-800 text-sm">
                      {p.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
