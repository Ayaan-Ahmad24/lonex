import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">LONEX Admin</h1>
      <LoginForm />
    </main>
  );
}