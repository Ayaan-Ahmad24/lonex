import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <AdminHome />
      </Suspense>
    </main>
  );
}

async function AdminHome() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p>
        Signed in as {user.name} ({user.email})
      </p>
      <LogoutButton />
    </div>
  );
}