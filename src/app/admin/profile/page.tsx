import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	
	const session = await getServerSession(authOptions);

  // ?? Redirect if not logged in
  if (!session || !session.user) {
    redirect("/admin/login");
  }

  const userId = session.user.id;
	
	
  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/profile`);
  url.searchParams.set("id",  String(userId));

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  const result = await res.json();
  const user = result.rows[0];

  return (
    <section className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Profile</h1>
 
      <div className="bg-gray-100 rounded p-4 mb-4">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
				<div className="flex gap-4 pt-5">
					<Link href="/admin/change-password">
						<button className="text-blue-700 hover:text-blue-900 cursor-pointer ">Change Password</button>
					</Link>
					<Link href="/admin/update-email">
						<button className="text-blue-700 hover:text-blue-900 cursor-pointer ">Update Email</button>
					</Link>
				</div>
      </div>

      
    </section>
  );
}
