import { getTransactionsApi, getUserApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { Calendar, DateObject } from "react-native-calendars";

type Txn = {
  id: string | number;
  amount: number | string;
  type?: "EXPENSE" | "INCOME" | string;
  note?: string;
  categoryName?: string;
  date?: string;
  createdAt?: string;
};

export default function Schedule() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState<string>(todayStr);
  const [filter, setFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  const { data: userData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await getUserApi()).data as any,
  });

  const txKey = useMemo(
    () => ["transactions-by-day", userData?.userId, selected, filter],
    [userData?.userId, selected, filter]
  );

  const { data: txData } = useQuery({
    queryKey: txKey,
    enabled: Boolean(userData?.userId && selected),
    queryFn: async () =>
      (
        await getTransactionsApi(userData!.userId, {
          createdAtStart: selected,
          type: filter === "ALL" ? undefined : filter,
        })
      ).data as { data?: Txn[] } | Txn[],
    staleTime: 0,
    refetchOnMount: true,
  });

  const items: Txn[] = Array.isArray(txData)
    ? (txData as Txn[])
    : (txData as any)?.data ?? [];

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of items) {
      const amount = Number(t.amount) || 0;
      if (t.type === "INCOME") income += amount;
      else expense += amount;
    }
    return { income, expense, total: income - expense };
  }, [items]);

  return (
    <View style={{ flex: 1 }}>
      {/* Calendar */}
      <Calendar
        current={selected}
        onDayPress={(d: DateObject) => setSelected(d.dateString)}
        markedDates={{
          [selected]: { selected: true, selectedColor: "#10b981" },
        }}
        theme={{
          todayTextColor: "#10b981",
          selectedDayBackgroundColor: "#10b981",
        }}
      />

      {/* Summary Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#6b7280" }}>Thu nhập</Text>
          <Text style={{ color: "#22c55e", fontWeight: "800" }}>
            {totals.income.toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#6b7280" }}>Chi tiêu</Text>
          <Text style={{ color: "#ef4444", fontWeight: "800" }}>
            {totals.expense.toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#6b7280" }}>Tổng</Text>
          <Text style={{ color: "#111827", fontWeight: "800" }}>
            {totals.total >= 0 ? "+" : "-"}
            {Math.abs(totals.total).toLocaleString("vi-VN")}đ
          </Text>
        </View>
      </View>

      {/* Filter and List for selected day */}
      <View style={{ flex: 1, paddingTop: 8 }}>
        {/* Filter */}
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
          {(
            [
              { key: "ALL", label: "Tất cả" },
              { key: "EXPENSE", label: "Chi tiêu" },
              { key: "INCOME", label: "Thu nhập" },
            ] as const
          ).map((b) => {
            const active = filter === b.key;
            return (
              <View
                key={b.key}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? "#10b981" : "#e5e7eb",
                }}
              >
                <Text
                  onPress={() => setFilter(b.key)}
                  style={{
                    color: active ? "white" : "#111827",
                    fontWeight: "700",
                  }}
                >
                  {b.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* List */}
        <FlatList
          style={{ marginTop: 8 }}
          data={items}
          keyExtractor={(item: Txn) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={() => (
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
                Không có giao dịch trong ngày này.
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
    </View>
  );
}
