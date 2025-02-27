import AdminPanel from "@/components/AdminPanel";

export const metadata = {
  title: "Administration",
};

export default function AdminPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Administration Page</h1>
      <AdminPanel />
    </div>
  );
}