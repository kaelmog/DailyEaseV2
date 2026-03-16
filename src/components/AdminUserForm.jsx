"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";
import { t } from "../utils/dictionary";

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
      .select("*, outlets(name)")
      .order("created_at", { ascending: false });
    const { data: oData } = await supabase
      .from("outlets")
      .select("*")
      .eq("is_active", true);
    if (uData) setUsers(uData);
    if (oData) setOutlets(oData);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from("app_users")
      .insert([{ username, pin, role, outlet_id: outletId || null }]);
    setIsLoading(false);

    if (error) alert("Error: " + error.message);
    else {
      alert(t("user_alert_add"));
      setUsername("");
      setPin("");
      setRole("baker");
      setOutletId("");
      fetchData();
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t("user_alert_delete"))) return;
    await supabase.from("app_users").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-8">
      <Card title={t("user_title")} subtitle={t("user_subtitle")}>
        <form
          onSubmit={handleCreate}
          className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UniversalInput
              label={t("user_name")}
              value={username}
              onChange={setUsername}
              required
              placeholder={t("user_name_ph")}
            />
            <UniversalInput
              label={t("user_pin")}
              value={pin}
              onChange={setPin}
              required
              placeholder={t("user_pin_ph")}
            />
            <UniversalInput
              type="select"
              label={t("user_role")}
              value={role}
              onChange={setRole}
              options={[
                { id: "baker", name: t("user_role_baker") },
                { id: "supervisor", name: t("user_role_spv") },
                { id: "admin", name: t("user_role_admin") },
              ]}
              required
            />
            <UniversalInput
              type="select"
              label={t("user_outlet")}
              value={outletId}
              onChange={setOutletId}
              options={outlets}
            />
          </div>
          <div className="text-right">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {t("btn_add")}
            </Button>
          </div>
        </form>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-3 border rounded bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">
                  {u.username}{" "}
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    PIN: {u.pin}
                  </span>
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {u.role} • {u.outlets?.name || "All Outlets"}
                </span>
              </div>
              <button
                onClick={() => handleDelete(u.id, u.username)}
                className="text-xs text-red-600 font-bold px-2 hover:underline"
              >
                {t("btn_delete")}
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-gray-500 text-sm italic p-4">
              {t("user_empty")}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
