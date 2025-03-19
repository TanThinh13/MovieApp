import { useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { Stack } from "expo-router";
import { supabase } from "../services/supabase";
import LoginScreen from "./login";
import SignUpScreen from "./signup";

export default function RootLayout() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <>
      <StatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="movies/[id]" />
          </>
        )}
      </Stack>
    </>
  );
}  