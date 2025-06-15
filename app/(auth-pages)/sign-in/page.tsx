import LoginForm from "./LoginForm";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
