import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native"; 
import { useCallback, useEffect, useState } from "react";
import useFetch from "@/services/useFetch";
import { getSavedMovies } from "@/services/supabase";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getUserId } from "@/data/getUser";
import SavedCard from "@/components/SavedCard";

const SavedMovies = () => {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [savedMovies, setSavedMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const storedUserId = await getUserId();
            setUserId(storedUserId);
        };
        fetchUserId();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchMovies = async () => {
                if (userId) {
                    setLoading(true);
                    try {
                        const newMovies = await getSavedMovies(userId);
                        setSavedMovies(newMovies || []);
                        setError(null);
                    } catch (err) {
                        setError("Failed to load movies");
                    } finally {
                        setLoading(false);
                    }
                }
            };
            fetchMovies();
        }, [userId])
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <Image source={images.bg2} style={styles.backgroundImage} resizeMode="cover" />

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Image source={icons.logo} style={styles.logo} />

                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
                    ) : error ? (
                        <Text style={styles.errorText}>Error: {error}</Text>
                    ) : (
                        <View style={styles.contentContainer}>
                            <Text style={styles.sectionTitle}>Saved Movies</Text>
                            <View style={styles.movieListContainer}>
                                {savedMovies.length > 0 ? (
                                    savedMovies.map((item) => <SavedCard key={item.id} {...item} />)
                                ) : (
                                    <Text style={styles.noMoviesText}>No saved movies</Text>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a",
    },
    backgroundImage: {
        position: "absolute",
        width: "100%",
        zIndex: 0,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    logo: {
        width: 48,
        height: 40,
        marginTop: 40,
        marginBottom: 20,
        alignSelf: "center",
    },
    loader: {
        marginTop: 40,
        alignSelf: "center",
    },
    contentContainer: {
        flex: 1,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
        marginBottom: 12,
    },
    movieListContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    noMoviesText: {
        color: "white",
        textAlign: "center",
        marginTop: 20,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
});

export default SavedMovies;
