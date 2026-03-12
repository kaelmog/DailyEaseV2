"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // Sementara kita hardcode PIN 1234 untuk akses Baker
    if (pin === "1234") {
      router.push("/closing");
    } else {
      alert("PIN Salah! Coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">The Wheat</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Masukkan PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border p-3 rounded-lg text-center text-xl tracking-widest"
              maxLength="4"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
