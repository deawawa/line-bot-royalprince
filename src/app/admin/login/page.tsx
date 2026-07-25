import { redirect } from "next/navigation";

/** Login lives at /login (outside the authed admin layout). */
export default function AdminLoginAlias() {
  redirect("/login");
}
