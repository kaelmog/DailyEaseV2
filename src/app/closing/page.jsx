"use client";
import { useState, useEffect } from "react";
import { generateWhatsAppText } from "../../utils/whatsapp";
import { supabase } from "../../utils/supabase";

export default function ClosingPage() {
  const [keuangan, setKeuangan] = useState({
    cash: "",
    qris: "",
    grabfood: "",
    gofood: "",
    shopeefood: "",
    debit: "",
    credit_card: "",
    transfer: "",
    voucher: "",
    transfer_outstanding: "",
  });

  const [kategoriSales, setKategoriSales] = useState({
    croissant: "",
    bread: "",
    promo: "",
    snack: "",
    coffee: "",
    beverage: "",
    hampers: "",
    pb1: "",
  });

  const [inventory, setInventory] = useState([]);
  const [previewText, setPreviewText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id");
      if (data) {
        const setupInventory = data.map((item) => ({
          id: item.id,
          name: item.name,
          frozen: "",
          proofing: "",
          display: "",
          sold: "",
          waste: "",
        }));
        setInventory(setupInventory);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const handleInventoryChange = (id, field, value) => {
    setInventory(
      inventory.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleGenerate = () => {
    const reportData = {
      cabang: "Cibinong",
      inventory: inventory,
      keuangan: keuangan,
      kategoriSales: kategoriSales,
    };
    setPreviewText(generateWhatsAppText(reportData));
    setShowPreview(true);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(previewText)
      .then(() => {
        alert("Laporan berhasil dicopy!");
        setShowPreview(false);
      })
      .catch((err) => alert("Gagal copy otomatis."));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 relative">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold border-b pb-4 mb-6">
          Laporan Closing Harian
        </h1>

        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-blue-800">
            💳 Payment Methods
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(keuangan).map((key) => (
              <div key={key}>
                <label className="block text-xs font-bold mb-1 text-gray-700 capitalize">
                  {key.replace("_", " ")}
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-md bg-gray-50 text-sm"
                  value={keuangan[key]}
                  onChange={(e) =>
                    setKeuangan({ ...keuangan, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <h2 className="text-lg font-bold mb-4 text-purple-800">
            📊 Product Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(kategoriSales).map((key) => (
              <div key={key}>
                <label className="block text-xs font-bold mb-1 text-purple-900 capitalize">
                  {key === "pb1" ? "PB1 (Pajak)" : key}
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-md bg-white text-sm"
                  value={kategoriSales[key]}
                  onChange={(e) =>
                    setKategoriSales({
                      ...kategoriSales,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 overflow-x-auto">
          <h2 className="text-lg font-bold mb-4 text-orange-800">
            📦 Inventory & Sales
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500 italic py-4">
              Menarik data produk...
            </p>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="p-2 border">Produk</th>
                  <th className="p-2 border w-20">Frozen</th>
                  <th className="p-2 border w-20">Proofing</th>
                  <th className="p-2 border w-20">Display</th>
                  <th className="p-2 border w-20">Sold</th>
                  <th className="p-2 border w-20">Waste</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="text-sm hover:bg-gray-50">
                    <td className="p-2 border font-medium">{item.name}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="w-full border p-1 rounded"
                        value={item.frozen}
                        onChange={(e) =>
                          handleInventoryChange(
                            item.id,
                            "frozen",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="w-full border p-1 rounded"
                        value={item.proofing}
                        onChange={(e) =>
                          handleInventoryChange(
                            item.id,
                            "proofing",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="w-full border p-1 rounded"
                        value={item.display}
                        onChange={(e) =>
                          handleInventoryChange(
                            item.id,
                            "display",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="w-full border p-1 rounded text-green-700 font-bold bg-green-50"
                        value={item.sold}
                        onChange={(e) =>
                          handleInventoryChange(item.id, "sold", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="w-full border p-1 rounded text-red-600 font-bold bg-red-50"
                        value={item.waste}
                        onChange={(e) =>
                          handleInventoryChange(
                            item.id,
                            "waste",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold mt-6 hover:bg-blue-700 transition shadow-lg"
        >
          Review Pesan WhatsApp
        </button>
      </div>

      {/* --- MODAL PREVIEW --- */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Preview Laporan
            </h2>

            {/* TABS UNTUK 3 SET TEMPLATE */}
            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() =>
                  setPreviewText(
                    generateWhatsAppText(
                      {
                        cabang: "Cibinong",
                        inventory,
                        keuangan,
                        kategoriSales,
                      },
                      "set1",
                    ),
                  )
                }
                className="flex-1 text-xs font-bold py-2 rounded focus:outline-none hover:bg-white hover:shadow-sm"
              >
                1. Sales
              </button>
              <button
                onClick={() =>
                  setPreviewText(
                    generateWhatsAppText(
                      {
                        cabang: "Cibinong",
                        inventory,
                        keuangan,
                        kategoriSales,
                      },
                      "set2",
                    ),
                  )
                }
                className="flex-1 text-xs font-bold py-2 rounded focus:outline-none hover:bg-white hover:shadow-sm"
              >
                2. Penjualan
              </button>
              <button
                onClick={() =>
                  setPreviewText(
                    generateWhatsAppText(
                      {
                        cabang: "Cibinong",
                        inventory,
                        keuangan,
                        kategoriSales,
                      },
                      "set3",
                    ),
                  )
                }
                className="flex-1 text-xs font-bold py-2 rounded focus:outline-none hover:bg-white hover:shadow-sm"
              >
                3. Stok
              </button>
            </div>

            <textarea
              className="w-full h-72 border p-3 rounded-md bg-gray-50 text-sm font-mono mb-4 resize-none focus:outline-none"
              value={previewText}
              readOnly
            />

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Edit Form
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Copy & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
