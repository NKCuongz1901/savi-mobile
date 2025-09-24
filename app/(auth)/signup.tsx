import { signupApi } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function SignUp() {
  const router = useRouter();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: doSignUp, isPending } = useMutation({
    mutationFn: () => signupApi(name, email, password).then((r) => r.data),
    onSuccess: (data: any) => {
      // After register, go to verify with the email
      Toast.show({
        type: "success",
        text1: "User created",
        text2: "Please verify",
      });
      router.replace({ pathname: "/verify" });
    },
    onError: (e: any) => {
      Toast.show({
        type: "error",
        text1: "Sign up failed",
        text2: e?.message || "",
      });
    },
  });

  const canSubmit = name.trim() && email.trim() && password.length >= 6;

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 56 }}>
      <View style={{ alignItems: "center", marginBottom: 28 }}>
        <Text style={{ color: "#059669", fontWeight: "700" }}>
          Xin chào Savi-ers
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#059669",
            marginTop: 4,
          }}
        >
          Sign Up
        </Text>
      </View>

      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Image
          source={require("../../assets/images/savi.png")}
          style={{ width: 140, height: 140, resizeMode: "contain" }}
        />
        <Text
          style={{
            marginTop: 8,
            fontSize: 40,
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
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
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

      <TouchableOpacity
        onPress={() => doSignUp()}
        disabled={!canSubmit || isPending}
        style={{
          height: 52,
          backgroundColor: canSubmit ? "#10b981" : "#9CA3AF",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
          {isPending ? "Signing Up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <Text style={{ color: "#6b7280" }}>Already have an account? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={{ color: "#059669", fontWeight: "700" }}>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
