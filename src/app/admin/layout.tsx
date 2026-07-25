import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/knowledge", label: "Knowledge Base" },
  { href: "/admin/conversations", label: "Conversations" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold text-brand">RPRP Admin</span>
          <nav className="flex gap-4 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-slate-600 hover:text-brand">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action="/admin/logout" method="post">
          <button className="text-sm text-slate-500 hover:text-red-600">
            Logout ({session.username})
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
