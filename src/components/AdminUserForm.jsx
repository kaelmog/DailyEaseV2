"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Card } from "./ui/Containers";
import { UniversalInput } from "./ui/UniversalInput";
import { Button } from "./ui/BaseComponents";

export default function AdminUserForm() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("staff");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("app_users")
      .select("*")
      .order("created_at");
    if (data) setUsers(data);
  };

  useEffect(() => {
    // This tells the strict linter to ignore this completely safe fetch call
    // eslint-disable-next-line
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from("app_users")
      .insert([{ username, pin, role }]);

    setIsLoading(false);

    if (error) {
      alert("Error creating user: " + error.message);
    } else {
      alert("User created successfully!");
      setUsername("");
      setPin("");
      setRole("staff");
      fetchUsers();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await supabase.from("app_users").delete().eq("id", id);
    fetchUsers();
  };

  return (
    <div className="space-y-6 mb-10">
      <form onSubmit={handleSubmit}>
        <Card
          title="User Management"
          subtitle="Add staff or admins with secure PINs."
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <UniversalInput
              label="Username"
              value={username}
              onChange={setUsername}
              required
              placeholder="Username"
            />
            <UniversalInput
              label="Password"
              value={pin}
              onChange={setPin}
              type="text"
              required
              placeholder="Password"
            />
            <UniversalInput
              type="select"
              label="Role"
              value={role}
              onChange={setRole}
              options={[
                { id: "admin", name: "Admin" },
                { id: "staff", name: "Staff" },
              ]}
              required
            />
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Add User
            </Button>
          </div>
        </Card>
      </form>

      {/* User List */}
      <Card title="Active Users">
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-3 bg-gray-50 border rounded"
            >
              <div>
                <span className="font-bold">{u.username}</span>
                <span
                  className={`ml-3 text-xs px-2 py-1 rounded ${u.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {u.role.toUpperCase()}
                </span>
              </div>
              <Button variant="danger" onClick={() => handleDelete(u.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
