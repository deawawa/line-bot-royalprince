import { redirect } from "next/navigation";
import { checkCredentials, createSession, getSession } from "@/lib/auth";

async function login(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    redirect("/login?error=1");
  }
  await createSession(username);
  redirect("/admin");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <form action={login} className="w-80 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-bold text-brand">RPRP Admin Login</h1>
        {searchParams.error && (
          <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-600">
            Invalid username or password
          </p>
        )}
        <label className="mb-2 block text-sm">
          Username
          <input
            name="username"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="username"
          />
        </label>
        <label className="mb-4 block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        <button className="w-full rounded bg-brand py-2 text-white hover:opacity-90">
          Sign in
        </button>
      </form>
    </main>
  );
}
