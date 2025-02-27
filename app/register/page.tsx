import RegisterForm from "../../components/RegisterForm";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto p-4">
      <RegisterForm title="Create an Account" />
    </div>
  );
}