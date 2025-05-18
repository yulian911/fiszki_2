import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default function withAuth(Component: React.ComponentType) {
  return async function WithAuth(props: any) {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    return <Component {...props} user={user} />;
  };
}
