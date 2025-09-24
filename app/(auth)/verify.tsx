import { verifySignupApi } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function Verify() {
  const router = useRouter();
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);

  const codeId = digits.join("");

  const { mutate: doVerify, isPending } = useMutation({
    mutationFn: () => verifySignupApi(codeId).then((r) => r.data),
    onSuccess: (data: any) => {
      const token = data?.access_token as string | undefined;
      if (token)
        setCredentials({ user: { id: "self", userName: "user" }, token });
      Toast.show({ type: "success", text1: "Verified successfully" });
      router.replace("/login");
    },
    onError: (e: any) => {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: e?.message || "",
      });
    },
  });

  const disabled = codeId.length !== 6 || isPending;

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 72 }}>
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#059669" }}>
          Verify
        </Text>
        <Text style={{ marginTop: 6, color: "#6b7280", textAlign: "center" }}>
          Nhập mã 6 số được gửi tới email của bạn
        </Text>
      </View>

      <OtpInputs digits={digits} setDigits={setDigits} />

      <TouchableOpacity
        onPress={() => doVerify()}
        disabled={disabled}
        style={{
          height: 52,
          backgroundColor: disabled ? "#9CA3AF" : "#10b981",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 16,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
          {isPending ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type OtpProps = { digits: string[]; setDigits: (v: string[]) => void };
function OtpInputs({ digits, setDigits }: OtpProps) {
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const onChangeAt = (index: number, value: string) => {
    const next = value.replace(/\D/g, "").slice(-1); // keep last digit
    const copy = [...digits];
    copy[index] = next;
    setDigits(copy);
    if (next && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const onKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: "row", gap: 10, justifyContent: "center" }}>
      {digits.map((d, idx) => (
        <TextInput
          key={idx}
          ref={(r) => {
            inputsRef.current[idx] = r;
          }}
          value={d}
          onChangeText={(v) => onChangeAt(idx, v)}
          onKeyPress={({ nativeEvent }) => onKeyPress(idx, nativeEvent.key)}
          keyboardType="number-pad"
          maxLength={1}
          style={{
            width: 48,
            height: 56,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 10,
            textAlign: "center",
            fontSize: 22,
          }}
        />
      ))}
    </View>
  );
}
