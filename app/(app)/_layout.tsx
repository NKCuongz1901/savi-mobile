import { Tabs } from "expo-router";
import { Image, Text, TouchableOpacity } from "react-native";

function PlusButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#10b981",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
      }}
      activeOpacity={0.8}
    >
      <Text style={{ color: "white", fontSize: 28, fontWeight: "800" }}>+</Text>
    </TouchableOpacity>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#10b981",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/images/home.png")}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Giao dịch",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/transaction.png")}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: ({ focused, color, size }) => null,
          tabBarButton: (props) => (
            <PlusButton onPress={() => (props as any).onPress?.(undefined)} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Lịch",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/schedule.png")}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/profile.png")}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
