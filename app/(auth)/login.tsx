import { loginApi } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Login() {
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: doLogin, isPending } = useMutation({
    mutationFn: () => loginApi(email, password).then((r) => r.data),
    onSuccess: (data: any) => {
      const token = data?.access_token as string | undefined;
      if (!token) {
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: "Missing token",
        });
        return;
      }
      setCredentials({
        user: { id: "self", userName: email || "user" },
        token,
      });
      Toast.show({ type: "success", text1: "Login successful" });
    },
    onError: (e: any) => {
      const message = e?.message || "Login failed";
      Toast.show({ type: "error", text1: "Login failed", text2: message });
    },
  });

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 72 }}>
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Text style={{ color: "#059669", fontWeight: "700" }}>
          Welcome Back
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#059669",
            marginTop: 4,
          }}
        >
          Login
        </Text>
      </View>

      <View style={{ alignItems: "center", marginBottom: 28 }}>
        <Image
          source={require("../../assets/images/savi.png")}
          style={{ width: 120, height: 120, resizeMode: "contain" }}
        />
        <Text
          style={{
            marginTop: 8,
            fontSize: 32,
            fontWeight: "800",
            letterSpacing: 2,
            color: "#10b981",
          }}
        >
          SAVI
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            paddingHorizontal: 14,
            height: 48,
            justifyContent: "center",
          }}
        >
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={{ fontSize: 16 }}
          />
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            paddingHorizontal: 14,
            height: 48,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={{ fontSize: 16, flex: 1 }}
          />
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
            <Text style={{ color: "#6b7280" }}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ alignItems: "flex-end", marginTop: 8 }}>
        <TouchableOpacity>
          <Text style={{ color: "#6b7280" }}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => doLogin()}
        style={{
          height: 52,
          backgroundColor: "#10b981",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
          {isPending ? "Loading..." : "Login"}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <Text style={{ color: "#6b7280" }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={{ color: "#059669", fontWeight: "700" }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
