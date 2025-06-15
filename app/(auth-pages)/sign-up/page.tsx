import SignUpForm from "./SignUpForm";
import { SmtpMessage } from "../smtp-message";
import { Suspense } from "react";

export default function Signup() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <Suspense>
          <SignUpForm />
          <SmtpMessage />
        </Suspense>
      </div>
    </div>
  );
}
