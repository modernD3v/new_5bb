import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isAuthorizedAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Five Borough Boarders",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const h = await headers();
  if (!isAuthorizedAdmin(h.get("authorization"))) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-8">
        <h1 className="text-2xl font-bold">Admin</h1>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/admin/mountains" className="text-sky-300 underline">
              Mountains: passes and season dates
            </Link>
          </li>
        </ul>
      </main>
    </>
  );
}
