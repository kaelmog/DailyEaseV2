/**
 * @file AdminUserForm.jsx
 * @description Manage users, PINs, and Roles with Premium POS UI.
 */
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminUserForm() {
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("baker");
  const [outletId, setOutletId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    const { data: uData } = await supabase
      .from("app_users")
      .select("*, outlets(name)");
    const { data: oData } = await supabase.from("outlets").select("*");
    if (uData) setUsers(uData);
    if (oData) setOutlets(oData);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return alert("PIN minimal 4 angka.");

    setIsLoading(true);
    const payload = { username, pin, role, outlet_id: outletId || null };

    const { error } = await supabase.from("app_users").insert([payload]);
    setIsLoading(false);

    if (error) alert("Error: " + error.message);
    else {
      alert("User berhasil ditambahkan!");
      setUsername("");
      setPin("");
      setRole("baker");
      setOutletId("");
      fetchData();
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus user ${name}?`)) return;
    await supabase.from("app_users").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-8">
      <Card
        title="Manajemen Staff & Akses"
        subtitle="Kelola pengguna, PIN login, dan lokasi penempatan outlet."
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-8 bg-stone-50 p-5 md:p-6 rounded-2xl border border-stone-200 shadow-sm"
        >
          <div className="md:col-span-1">
            <UniversalInput
              label="Nama User"
              value={username}
              onChange={setUsername}
              required
            />
          </div>
          <div className="md:col-span-1">
            <UniversalInput
              label="PIN (Angka)"
              value={pin}
              onChange={setPin}
              required
              placeholder="Cth: 123456"
            />
          </div>
          <div className="md:col-span-1">
            <UniversalInput
              type="select"
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { id: "baker", name: "Baker / Kasir" },
                { id: "supervisor", name: "Supervisor" },
                { id: "admin", name: "Admin Pusat" },
              ]}
              required
            />
          </div>
          <div className="md:col-span-1">
            <UniversalInput
              type="select"
              label="Penempatan Outlet"
              value={outletId}
              onChange={setOutletId}
              options={outlets}
              placeholder="(Pilih jika Baker)"
            />
          </div>
          <div className="md:col-span-1">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="h-[50px] w-full"
            >
              Tambah Staff
            </Button>
          </div>
        </form>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-100">
                <tr className="text-xs text-stone-500 uppercase tracking-wider">
                  <th className="p-4 border-b border-stone-200 font-bold">
                    Nama
                  </th>
                  <th className="p-4 border-b border-stone-200 font-bold">
                    PIN
                  </th>
                  <th className="p-4 border-b border-stone-200 font-bold">
                    Role
                  </th>
                  <th className="p-4 border-b border-stone-200 font-bold">
                    Outlet
                  </th>
                  <th className="p-4 border-b border-stone-200 font-bold text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-stone-800">
                      {u.username}
                    </td>
                    <td className="p-4 font-mono text-stone-600 bg-stone-100 rounded px-2 w-fit inline-block mt-3">
                      {u.pin}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md tracking-wider uppercase border shadow-sm ${u.role === "admin" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-stone-100 text-stone-600 border-stone-200"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600 font-medium text-sm">
                      {u.outlets?.name || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        className="text-sm text-red-500 hover:text-red-700 font-bold transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
