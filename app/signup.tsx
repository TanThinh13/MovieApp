import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,Image } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all the required fields!");
      return;
    }
  
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Invalid email format!");
      return;
    }
  
    const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/; 
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error", 
        "Password must be at least 8 characters long, include at least one uppercase letter and one special character."
      );
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert("Error", "Password and Confirm Password do not match!");
      return;
    }
  
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("User")
        .select("user_id")
        .eq("email", email)
        .single();
  
      if (existingUser) {
        Alert.alert("Error", "This email is already registered. Please log in.");
        return;
      }
  
      if (checkError && checkError.code !== "PGRST116") {
        Alert.alert("Error", "An error occurred while checking email. Please try again.");
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        Alert.alert("Sign Up Error", error.message);
        return;
      }
      if (data?.user) {
        const { error: profileError } = await supabase
          .from("User")
          .insert([{ user_id: data.user.id, name, email }]);
        if (profileError) {
          Alert.alert("Error", "Failed to save user information.");
        } else {
          Alert.alert("Success", "Registration successful! Please log in.");
          router.replace("/login");
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
      console.error("Sign Up Error:", error);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Image source={images.bg2} style={styles.backgroundImage} resizeMode="cover" />
      <Image source={icons.logo} style={styles.logo} />
      <Text style={styles.title}>SIGN UP</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          value={name}
          onChangeText={setName}
          placeholderTextColor="white"
          style={styles.inputField}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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
          <Image source={secureTextEntry ? icons.hide : icons.eye} style={styles.icon} />
        </TouchableOpacity>
      </View>
  
      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={secureConfirmEntry}
          placeholderTextColor="white"
          style={styles.inputField}
        />
        <TouchableOpacity onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}>
          <Image source={secureConfirmEntry ? icons.hide : icons.eye} style={styles.icon} />
        </TouchableOpacity>
      </View>
  
      {/* Sign Up Button */}
      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>
  
      {/* Navigate to Login */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.signInText}>
          Already have an account? <Text style={styles.linkText}>LOGIN</Text>
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
    fontSize: 30,
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
    alignItems: "center",
    width: "40%",
    marginBottom: 15,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  signInText: {
    fontSize: 16,
    textAlign: "center",
    color: "#B4B4B4",
  },
  linkText: {
    color: "white",
    fontWeight: "600",
  },
});
