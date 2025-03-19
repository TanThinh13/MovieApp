import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants/icons";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { useState, useEffect } from "react";
import { getUserId } from "@/data/getUser";
import { supabase } from "@/data/supbaseClient";
import uuid from 'react-native-uuid';

const Details = () => {
  const { id } = useLocalSearchParams();
  const movieIdNumber = Array.isArray(id) ? Number(id[0]) : Number(id);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { data: movie, loading } = useFetch(() => fetchMovieDetails(id as string));
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [editingComment, setEditingComment] = useState<MovieComment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<MovieComment | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await getUserId();
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) checkIfMovieIsSaved();
    fetchComments();
  }, [userId]);

  const checkIfMovieIsSaved = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("savedMovie")
      .select("id")
      .eq("movie_id", id)
      .eq("user_id", userId)
      .single();
  
    if (error && error.code !== "PGRST116") {
      console.error("Error while checking if the movie is saved:", error);
    } else {
      setIsSaved(!!data);
    }
  };
  
  const toggleSave = async () => {
    try {
      if (!userId) {
        console.warn("User ID not found!");
        return;
      }
      if (isSaved) {
        const { error } = await supabase
          .from("savedMovie")
          .delete()
          .eq("movie_id", id)
          .eq("user_id", userId);
        if (error) throw error;
        setIsSaved(false);
      } else {
        const movieData = {
          id: uuid.v4(),
          movie_id: id,
          user_id: userId,
          title: movie?.title || "Unknown Title",
          poster_url: movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie?.poster_path}` : null,
          vote_average: movie?.vote_average ?? 0,
          release_date: movie?.release_date || "N/A",
          created_at: new Date().toISOString(),
        };
        const { error } = await supabase.from("savedMovie").insert([movieData]);
        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error while handling the saved movie list:", error);
    }
  };
  
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comment")
      .select("id, user_id, comment, userName, created_at")
      .eq("movie_id", movieIdNumber)
      .order("created_at", { ascending: false });
  
    if (error) console.error("Error fetching comments:", error);
    else setComments(data as MovieComment[]);
  };
  
  const submitComment = async (comment: string) => {
    if (!userId || !comment.trim()) return;
    if (isNaN(movieIdNumber)) {
      console.error("Error: Invalid movie_id!");
      return;
    }
  
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("name")
      .eq("user_id", userId)
      .single();
  
    if (userError) {
      console.error("Error fetching user name:", userError);
      return;
    }
  
    const newComment = {
      id: uuid.v4(),
      movie_id: movieIdNumber,
      user_id: userId,
      comment: comment.trim(),
      userName: userData.name,
      created_at: new Date().toISOString(),
    };
  
    const { error } = await supabase.from("comment").insert([newComment]);
    if (error) console.error("Error submitting comment:", error);
    else {
      setComments([newComment, ...comments]);
      setComment("");
    }
  };
  
  const handleLongPress = (commentItem: MovieComment) => {
    if (commentItem.user_id === userId) {
      setSelectedComment(commentItem);
      setModalVisible(true);
    }
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from("comment").delete().eq("id", commentId);
    if (error) {
      console.error("Error deleting comment:", error);
    } else {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };
  
  const editComment = (commentItem: MovieComment) => {
    setEditingComment(commentItem);
    setComment(commentItem.comment); 
  };

  const updateComment = async () => {
    if (!editingComment) return;
  
    const { error } = await supabase
      .from("comment")
      .update({ comment })
      .eq("id", editingComment.id);
  
    if (error) {
      console.error("Error updating comment:", error);
    } else {
      setComments(comments.map(c => c.id === editingComment.id ? { ...c, comment } : c));
      setEditingComment(null);
      setComment("");
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
    </SafeAreaView>
  );

  const movieDetails = [
    { label: "Overview", value: movie?.overview },
    { label: "Genres", value: movie?.genres?.map((g) => g.name).join(" • ") || "N/A" },
    { label: "Budget", value: `$${(movie?.budget ?? 0) / 1_000_000} million` },
    { label: "Revenue", value: `$${Math.round((movie?.revenue ?? 0) / 1_000_000)} million` },
    { label: "Production Companies", value: movie?.production_companies?.map((c) => c.name).join(" • ") || "N/A" }
  ];


  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <FlatList
        data={movieDetails}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value || "N/A"}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Image source={icons.back} style={styles.backIcon} />
            </TouchableOpacity>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}` }}
              style={styles.poster}
              resizeMode="stretch"
            />
            <TouchableOpacity style={styles.savedButton} onPress={toggleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Image
                source={isSaved ? icons.saved : icons.save}
                style={[styles.savedIcon, isSaved && styles.savedIconActive]}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{movie?.title}</Text>
              <Text style={styles.movieInfoText}>
                {movie?.release_date?.split("-")[0]} • {movie?.runtime}m
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <Image source={icons.star} style={styles.starIcon} />
              <Text style={styles.ratingText}>{Math.round(movie?.vote_average ?? 0)}/10</Text>
              <Text style={styles.voteCountText}>({movie?.vote_count} votes)</Text>
            </View>
          </View>
        )}
        scrollEnabled={false} 
      />
      <View style={styles.commentDivider} />
      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>Comments</Text>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleLongPress(item)}
            style={styles.commentItem}
          >
            <Text style={styles.commentUser}>{item.userName || "Unknown User"}</Text>
            <Text style={styles.commentText}>{item.comment}</Text>
            <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        scrollEnabled={false} 
      />

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          placeholderTextColor="#999"
          multiline={true} 
          textAlignVertical="top" 
          value={comment}
          onChangeText={setComment}
        />
        {editingComment ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditingComment(null);
                setComment("");
                setModalVisible(true);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={updateComment}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        ) : (
          comment.trim().length > 0 && (
            <TouchableOpacity style={styles.sendIcon} onPress={() => submitComment(comment)}>
              <Image source={icons.send} style={{ width: 24, height: 24 }} />
            </TouchableOpacity>
          )
        )}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comment Options</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                editComment(selectedComment!);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                deleteComment(selectedComment!.id);
                setModalVisible(false);
              }}
            >
              <Text style={[styles.modalButtonText, { color: "red" }]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  poster: {
    width: "100%",
    height: 500,
  },
  savedButton: {
    position: "absolute",
    bottom: 150,
    right: 10,
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 5,
  },
  savedIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  savedIconActive: {
    tintColor: "yellow",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 6,
    margin: 20,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  ratingText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  voteCountText: {
    color: "#B0B0B0",
    fontSize: 14,
    marginLeft: 6,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginTop: 15, 
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center", 
  },
  movieInfoText: {
    color: "#B0B0B0",
    fontSize: 16,
    marginTop: 6,
    textAlign: "center", 
  },
  infoContainer: {
    marginTop: 15,
    paddingHorizontal: 20, 
  },
  infoLabel: {
    color: "#B0B0B0",
    fontSize: 14,
  },
  infoValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  flatListContent: {
    paddingBottom: 100, 
  },
  commentSection: {
    padding: 20,
  },
  commentTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  commentItem: {
    backgroundColor: "#222",
    padding: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentUser: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white", 
    marginBottom: 4,
  },
  commentText: {
    color: "white",
    fontSize: 16,
    marginBottom: 6,
    lineHeight: 20,
  },
  commentDate: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },
  commentInputContainer: {
    padding: 20,
  },
  commentInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 10,
    paddingRight: 30,
    borderRadius: 5,
    marginTop: 10,
  },
  commentButton: {
    backgroundColor: "#AB8BFF",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  commentButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  sendIcon: {
    position: "absolute",
    right: 25,
    top: 38,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    width: "100%",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#333",
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10, 
    marginTop: 10,
    paddingHorizontal: 10, 
  },
  cancelButton: {
    backgroundColor: "#555",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    bottom: 47,
    right: -15,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  updateButton: {
    backgroundColor: "#ff9900",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    bottom: 47,
    right: -10,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentDivider: {
    width: "90%",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    marginTop: 30,
    alignSelf: "center",
  },
  backButton: {
    position: "absolute",
    top: 10, 
    left: 10, 
    zIndex: 10, 
    backgroundColor: "rgba(0,0,0,0.3)", 
    padding: 10,
    borderRadius: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "white",
  },
});


export default Details;
