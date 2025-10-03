"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6">Καλώς ήρθατε</h1>

        {/* Signup button */}
        <Link
          href="/auth/signup"
          className="
            flex items-center justify-center gap-2
            w-[250px] px-4 py-2
            mb-6 w-full
            bg-[#646cff] text-white font-medium rounded-md
            cursor-pointer
            transition transform duration-200
            hover:bg-[#4f55e1] hover:scale-105
          "
        >
          <UserPlus className="w-5 h-5" />
          Εγγραφή με Email
        </Link>
      </div>
    </div>
  );
}
