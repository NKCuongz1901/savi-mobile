import { useAuthStore } from "@/store/auth";
import { Redirect } from "expo-router";

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  if (!isHydrated) return null;
  return <Redirect href={token ? "/home" : "/login"} />;
}
