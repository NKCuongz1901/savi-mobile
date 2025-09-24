import { useAuthStore } from "@/store/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useSegments } from "expo-router";
import { useMemo } from "react";
import Toast from "react-native-toast-message";
import "./global.css";

function AuthGate() {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const group = (useSegments()[0] ?? "") as string;
  const inAuth = group.startsWith("(auth)");

  if (!isHydrated) return null;

  const isAuth = !!token;
  if (!isAuth && !inAuth) {
    return <Redirect href={"/login"} />;
  }

  if (isAuth && inAuth) {
    return <Redirect href={"/home"} />;
  }

  return null;
}

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
      <AuthGate />
      <Toast />
    </QueryClientProvider>
  );
}
