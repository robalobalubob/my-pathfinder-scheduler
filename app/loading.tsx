import { Spinner } from "../components/ui/feedback/Spinner";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Spinner size="lg" label="Loading..." />
    </div>
  );
}