import ForgotPasswordForm from "./ForgotPasswordForm";
import { SmtpMessage } from "../smtp-message";

export default function ForgotPassword() {
  return (
    <>
      <ForgotPasswordForm />
      <SmtpMessage />
    </>
  );
}
