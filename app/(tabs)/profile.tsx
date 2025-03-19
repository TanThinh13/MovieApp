import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/services/supabase";
import { removeUserId, getUserId } from "@/data/getUser";
import { useEffect, useState } from "react";
import { images } from "@/constants/images";

type UserType = {
  user_id: string;
  name: string;
  phone: string;
  email: string;
  bio: string;
};

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedData, setEditedData] = useState({ name: "", phone: "", bio: "" });
  const [movieCount, setMovieCount] = useState(0);

  useEffect(() => {
    (async () => {
      const storedUserId = await getUserId();
      if (!storedUserId) return;

      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("user_id", storedUserId)
        .single();

      const { count, error: movieError } = await supabase
        .from("savedMovie")
        .select("id", { count: "exact", head: true })
        .eq("user_id", storedUserId);

      if (error) {
        Alert.alert("Error", "Failed to fetch user data.");
      } else {
        setUserData(data);
        setEditedData({ name: data.name, phone: data.phone, bio: data.bio });
      }
      if (movieError) {
        console.error("Error fetching saved movie count:", movieError);
      } else {
        setMovieCount(count || 0);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", "Logout failed. Please try again!");
    } else {
      await removeUserId();
      router.replace("/login");
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    setLoading(true);
    const { error } = await supabase
      .from("User")
      .update({
        name: editedData.name,
        phone: editedData.phone,
        bio: editedData.bio,
      })
      .eq("user_id", userData.user_id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", "Failed to update profile.");
    } else {
      setUserData({ ...userData, ...editedData });
      setModalVisible(false);
      Alert.alert("Success", "Profile updated successfully.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={images.bg2} style={styles.backgroundImage} resizeMode="cover" />

      <View style={styles.header}>
        <Text style={styles.name}>{userData?.name || "User"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoText}>{userData?.email || "No email"}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoText}>{userData?.phone || "No phone number"}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.infoText}>{userData?.bio || "No bio available"}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Movies Saved</Text>
          <Text style={styles.infoText}>{movieCount} movies</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.editText}>EDIT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>


      {loading && <ActivityIndicator size="large" color="#fff" style={styles.loading} />}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editedData.name}
              onChangeText={(text) => setEditedData({ ...editedData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={editedData.phone}
              onChangeText={(text) => setEditedData({ ...editedData, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Bio"
              value={editedData.bio}
              onChangeText={(text) => setEditedData({ ...editedData, bio: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },

  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },

  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },

  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "transparent",
    borderBottomColor: "black",
    borderBottomWidth: 2,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },

  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  infoCard: {
    backgroundColor: "transparent",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "black",
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 3,
  },

  infoText: {
    fontSize: 16,
    color: "white",
  },

  editButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: "center",
    width: "50%",
    alignItems: "center",
  },

  editText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 100,
    alignSelf: "center",
    width: "50%",
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  saveButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },

  saveText: {
    color: "white",
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },

  cancelText: {
    color: "white",
    fontWeight: "bold",
  },
});


export default Profile;
