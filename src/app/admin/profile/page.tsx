import Link from "next/link";

export default async function ProfilePage() {
  const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/profile`);
  url.searchParams.set("id", "1");

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
