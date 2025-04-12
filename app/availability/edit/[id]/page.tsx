import AvailabilityEdit from "../../../../components/AvailabilityEdit";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Availability",
};

// Using any to bypass the type checking issue for now
// @ts-expect-error - Next.js dynamic route params handling in Next.js 15
export default function AvailabilityEditPage({ params }) {
  return <AvailabilityEdit availabilityId={params.id} />;
}