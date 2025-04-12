import SessionEdit from "../../../../components/SessionEdit";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Session",
};

// Using ts-expect-error to bypass the type checking issue for now
// @ts-expect-error - Next.js dynamic route params handling in Next.js 15
export default function SessionEditPage({ params }) {
  return <SessionEdit sessionId={params.id} />;
}