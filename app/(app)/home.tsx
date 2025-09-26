import {
  getTransactionsApi,
  getUserApi,
  getUserWalletApi,
} from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
  };

  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: async () =>
      (await getUserApi()).data as {
        userId: string;
        username: string;
        email: string;
      },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () =>
      (await getUserWalletApi()).data as {
        message: string;
        data: { totalBalance: string };
      },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
  });
  const balance = Number(walletData?.data?.totalBalance ?? 0).toLocaleString(
    "vi-VN"
  );
  const router = useRouter();

  // Compute today's date (YYYY-MM-DD)
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const createdAtStart = `${yyyy}-${mm}-${dd}`;

  const { data: todayTx } = useQuery({
    queryKey: ["transactions-today", userData?.userId, createdAtStart],
    enabled: Boolean(userData?.userId),
    queryFn: async () =>
      (
        await getTransactionsApi(userData!.userId, {
          createdAtStart,
        })
      ).data as any,
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 54,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: "#34d399",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white" }}>
              Hi {userData?.username ?? ""}
            </Text>
            <Text style={{ color: "white", marginTop: 6 }}>
              Số tiền của bạn
            </Text>
            <Text style={{ color: "white", fontSize: 28, fontWeight: "900" }}>
              {walletLoading ? "..." : `$ ${balance} VND`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={refreshData}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {[
            {
              label: "Tạo giao dịch",
              icon: require("../../assets/images/note.png"),
              go: undefined,
            },
            {
              label: "Voice",
              icon: require("../../assets/images/voice.png"),
              go: "/add",
            },
            {
              label: "Kế hoạch",
              icon: require("../../assets/images/planning.png"),
              go: undefined,
            },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => a.go && router.push(a.go as any)}
              style={{ alignItems: "center", width: "31%" }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: "100%",
                  height: 72,
                  borderRadius: 16,
                  backgroundColor: "#C8FF8C",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                <Image
                  source={a.icon}
                  style={{ width: 24, height: 24, tintColor: "white" }}
                />
                <Text
                  style={{ color: "white", marginTop: 6, fontWeight: "600" }}
                >
                  {a.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Categories row placeholder */}
        <View
          style={{
            marginTop: 16,
            backgroundColor: "white",
            padding: 12,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "#f0fdf4",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../../assets/images/transaction.png")}
                  style={{ width: 22, height: 22, tintColor: "#10b981" }}
                />
              </View>
              <Text style={{ marginTop: 6, color: "#6b7280" }}>Tiết kiệm</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Saving section - hardcoded 1 item */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ fontWeight: "700" }}>Tiết kiệm</Text>
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 12,
            marginTop: 8,
            elevation: 1,
          }}
        >
          <Text style={{ fontWeight: "700" }}>Tiết kiệm mua nhà</Text>
          <Text style={{ marginTop: 4, color: "#6b7280" }}>50,000,000 VND</Text>
          <View
            style={{
              height: 6,
              backgroundColor: "#e5e7eb",
              borderRadius: 3,
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: "10%",
                backgroundColor: "#10b981",
                height: 6,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      </View>

      {/* Transactions section - today */}
      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "700" }}>Giao dịch hôm nay</Text>
          <Text style={{ color: "#10b981" }}>Tất cả</Text>
        </View>
        {!todayTx || !todayTx.data || todayTx.data.length === 0 ? (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#6b7280", textAlign: "center" }}>
              Hôm nay bạn chưa tiêu gì, hãy tiêu tiền đi!
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 8, height: 420 }}>
            <FlatList
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              scrollEnabled
              nestedScrollEnabled
              showsVerticalScrollIndicator
              data={todayTx.data}
              keyExtractor={(item: any) => String(item.id)}
              renderItem={({ item }: any) => {
                const isIncome = item.type === "INCOME";
                const amountSigned = `${isIncome ? "+" : "-"} ${Number(
                  item.amount
                ).toLocaleString("vi-VN")} VND`;
                const typeLabel = isIncome ? "Thu nhập" : "Chi tiêu";
                return (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Image
                      source={require("../../assets/images/transaction.png")}
                      style={{
                        width: 32,
                        height: 32,
                        tintColor: isIncome ? "#22c55e" : "#ef4444",
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700" }}>{typeLabel}</Text>
                      <Text
                        style={{
                          color: isIncome ? "#22c55e" : "#ef4444",
                          fontWeight: "700",
                          marginTop: 2,
                        }}
                      >
                        {amountSigned}
                      </Text>
                      <Text style={{ color: "#6b7280", marginTop: 2 }}>
                        {item.categoryName ?? item.note ?? "Giao dịch"}
                      </Text>
                      <Text style={{ color: "#9ca3af", marginTop: 2 }}>
                        {item.date ?? item.createdAt ?? createdAtStart}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;
