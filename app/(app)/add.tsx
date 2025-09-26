import { createTransactionSpeechApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function AddQuick() {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>("checking");
  const [speechTimeout, setSpeechTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const queryClient = useQueryClient();

  useSpeechRecognitionEvent("start", () => {
    setListening(true);
    // Set timeout to auto-stop after 10 seconds if no speech detected
    const timeout = setTimeout(() => {
      console.log("No speech detected, auto-stopping...");
      stop();
      Toast.show({
        type: "info",
        text1: "No speech detected",
        text2: "Please try speaking louder or closer to the microphone",
      });
    }, 10000);
    setSpeechTimeout(timeout as any);
  });

  useSpeechRecognitionEvent("end", () => {
    setListening(false);
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      setSpeechTimeout(null);
    }
  });
  useSpeechRecognitionEvent("result", (e) => {
    console.log("Speech result:", e);
    const last = e.results?.at(-1);
    if (last?.transcript) {
      console.log("Transcript:", last.transcript);
      setText(last.transcript);
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    console.log("Speech recognition error:", e);
    Toast.show({
      type: "error",
      text1: "Mic error",
      text2: e.message || "Speech recognition failed",
    });
  });

  useEffect(() => {
    // Check microphone permission on mount
    const checkPermission = async () => {
      if (Platform.OS === "android") {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        setMicPermission(hasPermission);
        setPermissionStatus(hasPermission ? "granted" : "denied");
        console.log("Initial mic permission check:", hasPermission);
      } else {
        setMicPermission(true);
        setPermissionStatus("granted");
      }
    };

    checkPermission();

    return () => {
      ExpoSpeechRecognitionModule.stop();
      if (speechTimeout) {
        clearTimeout(speechTimeout);
      }
    };
  }, []);

  const ensureMic = async () => {
    if (Platform.OS !== "android") return true;

    // Check if permission already granted
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );

    if (hasPermission) {
      console.log("Microphone permission already granted");
      return true;
    }

    console.log("Requesting microphone permission...");
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Microphone Permission",
        message:
          "This app needs access to your microphone to record voice for transactions.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );

    console.log("Permission result:", granted);

    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      setPermissionStatus("never_ask_again");
      return false;
    }

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestPermission = async () => {
    const ok = await ensureMic();
    setMicPermission(ok);
    if (ok) {
      setPermissionStatus("granted");
      Toast.show({ type: "success", text1: "Microphone permission granted!" });
    } else {
      Toast.show({ type: "error", text1: "Microphone permission denied" });
    }
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const start = async () => {
    try {
      console.log("Starting speech recognition...");
      const ok = await ensureMic();
      setMicPermission(ok);
      if (!ok) {
        Toast.show({ type: "error", text1: "Mic permission denied" });
        return;
      }

      console.log("Starting speech recognition with config...");
      await ExpoSpeechRecognitionModule.start({
        lang: "vi-VN",
        interimResults: true,
        requiresOnDeviceRecognition: false,
        maxAlternatives: 1,
      });
      console.log("Speech recognition started successfully");
    } catch (e: any) {
      console.log("Error starting speech recognition:", e);
      Toast.show({ type: "error", text1: "Mic error", text2: e?.message });
    }
  };

  const stop = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch {}
  };

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => createTransactionSpeechApi(text).then((r) => r.data),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Created from voice" });
      setText("");

      // Invalidate wallet data to refresh balance on home screen
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      // Also invalidate user data in case it affects balance display
      queryClient.invalidateQueries({ queryKey: ["me"] });

      // Invalidate today's transactions so Home refreshes automatically
      queryClient.invalidateQueries({ queryKey: ["transactions-today"] });
    },
    onError: (e: any) => {
      Toast.show({
        type: "error",
        text1: "Create failed",
        text2: e?.message || "",
      });
    },
  });

  console.log("Check text", text);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        Tạo giao dịch bằng giọng nói
      </Text>

      {/* Microphone Permission Status */}
      {Platform.OS === "android" && (
        <View
          style={{
            backgroundColor:
              micPermission === false
                ? "#fef2f2"
                : micPermission === true
                ? "#f0fdf4"
                : "#f9fafb",
            borderLeftWidth: 4,
            borderLeftColor:
              micPermission === false
                ? "#ef4444"
                : micPermission === true
                ? "#22c55e"
                : "#6b7280",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color:
                micPermission === false
                  ? "#dc2626"
                  : micPermission === true
                  ? "#16a34a"
                  : "#6b7280",
              fontWeight: "600",
            }}
          >
            {micPermission === null
              ? "Đang kiểm tra quyền microphone..."
              : micPermission === false
              ? permissionStatus === "never_ask_again"
                ? "Quyền microphone bị từ chối vĩnh viễn"
                : "Mic permission denied"
              : "Microphone permission granted"}
          </Text>
          {micPermission === false && (
            <View style={{ marginTop: 8, flexDirection: "row", gap: 8 }}>
              {permissionStatus !== "never_ask_again" && (
                <TouchableOpacity
                  onPress={requestPermission}
                  style={{
                    backgroundColor: "#3b82f6",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={openAppSettings}
                style={{
                  backgroundColor: "#6b7280",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  Open Settings
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      <TextInput
        placeholder="Nội dung giọng nói sẽ hiển thị ở đây..."
        value={text}
        onChangeText={setText}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 10,
          padding: 12,
          minHeight: 140,
        }}
      />

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={start}
          style={{
            flex: 1,
            height: 48,
            backgroundColor: "#10b981",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            {listening ? "Đang nghe..." : "Bắt đầu nói"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={stop}
          style={{
            width: 100,
            height: 48,
            backgroundColor: "#6b7280",
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Dừng</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => submit()}
        disabled={!text || isPending}
        style={{
          height: 48,
          backgroundColor: text ? "#2563eb" : "#9CA3AF",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "700" }}>Gửi</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
