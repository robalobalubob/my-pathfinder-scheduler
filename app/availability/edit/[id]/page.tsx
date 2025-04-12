import AvailabilityEdit from "../../../../components/AvailabilityEdit";

export const metadata = {
  title: "Edit Availability",
};

interface AvailabilityPageProps {
  params: {
    id: string;
  };
}

export default function AvailabilityPage({ params }: AvailabilityPageProps) {
  return <AvailabilityEdit availabilityId={params.id} />;
}