import SignUpForm from "./SignUpForm";
import { SmtpMessage } from "../smtp-message";

export default function Signup() {
  return (
    <>
      <SignUpForm />
      <SmtpMessage />
    </>
  );
}
