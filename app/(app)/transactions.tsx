import { getTransactionsApi, getUserApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Txn = {
  id: string | number;
  amount: number | string;
  type?: "EXPENSE" | "INCOME" | string;
  note?: string;
  categoryName?: string;
  date?: string;
  createdAt?: string;
};

export default function Transactions() {
  const [filter, setFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await getUserApi()).data as any,
  });

  const queryKey = useMemo(
    () => ["transactions-list", userData?.userId, filter],
    [userData?.userId, filter]
  );

  const {
    data: txData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    enabled: Boolean(userData?.userId),
    queryFn: async () =>
      (
        await getTransactionsApi(userData!.userId, {
          type: filter === "ALL" ? undefined : filter,
        })
      ).data as { data?: Txn[] } | Txn[],
    staleTime: 0,
    refetchOnMount: true,
  });

  const items: Txn[] = Array.isArray(txData)
    ? (txData as Txn[])
    : (txData as any)?.data ?? [];

  return (
    <View style={{ flex: 1, paddingTop: 22 }}>
      {/* Filter Bar */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        {(
          [
            { key: "ALL", label: "Tất cả" },
            { key: "EXPENSE", label: "Chi tiêu" },
            { key: "INCOME", label: "Thu nhập" },
          ] as const
        ).map((b) => {
          const active = filter === b.key;
          return (
            <TouchableOpacity
              key={b.key}
              onPress={() => setFilter(b.key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? "#10b981" : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  color: active ? "white" : "#111827",
                  fontWeight: "700",
                }}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item: Txn) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={() => (
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 16,
              marginTop: 8,
              alignItems: "center",
              marginHorizontal: 16,
            }}
          >
            <Text style={{ color: "#6b7280", textAlign: "center" }}>
              Chưa có giao dịch nào.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
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
                marginTop: 8,
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
                  {item.date ?? item.createdAt ?? ""}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
