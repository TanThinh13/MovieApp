import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image
} from "react-native";
import { useRouter } from "expo-router";
import { saveUserId } from "../data/getUser";
import { supabase } from "../services/supabase";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password!");
      return;
    }
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email format!");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        Alert.alert("Login Error", error.message);
      } else if (data?.user) {
        await saveUserId(data.user.id);
        Alert.alert("Success", "Login successful!");
        router.replace("/");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred. Please try again!");
      console.error("Login Error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={images.bg2} style={styles.backgroundImage} resizeMode="cover" />
      <Image source={icons.logo} style={styles.logo} />
      <Text style={styles.title}>LOGIN</Text>
  
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="white"
          style={styles.inputField}
        />
      </View>
  
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="white"
          style={styles.inputField}
        />
        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
          <Image
            source={secureTextEntry ? icons.hide : icons.eye}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
  
      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
  
      {/* Sign Up Navigation */}
      <TouchableOpacity onPress={() => router.push("/signup")} style={styles.signup}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
  

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 24,
  },
  logo: {
    width: 60,
    height: 50,
    marginBottom : 40,
    alignSelf: "center",
  },
  backgroundImage: {
    position: "absolute",
    zIndex: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: "90%",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  inputField: {
    flex: 1,
    color: "white",
    paddingVertical: 12,
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "white",
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  signup: {
    marginTop: 16,
  },
  signupText: {
    fontSize: 16,
    color: "#B4B4B4",
  },
  signupLink: {
    color: "white",
    fontWeight: "600",
  },
});

