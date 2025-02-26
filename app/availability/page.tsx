import AvailabilityForm from "../../components/AvailabilityForm";

export const metadata = {
  title: "Scheduling Page",
};

export default function AvailabilityPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Your Availability</h1>
      <AvailabilityForm />
    </div>
  );
}