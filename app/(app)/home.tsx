import { useAuthStore } from "@/store/auth";
import React from "react";
import { Button, Text, View } from "react-native";

const Home = () => {
  const logout = useAuthStore((s) => s.logout);
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Home</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default Home;
