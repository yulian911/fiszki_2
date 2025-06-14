import SignUpForm from "./SignUpForm";
import { SmtpMessage } from "../smtp-message";

export default function Signup() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <SignUpForm />
        <SmtpMessage />
      </div>
    </div>
  );
}
