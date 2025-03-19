import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/supabase";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";
import { useEffect, useState } from "react";
import { getUserId } from "@/data/getUser";

const Index = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const checkUserAuth = async () => {
      const storedUserId = await getUserId();
      if (!storedUserId) {
        router.replace("/login");
      } else {
        setUserId(storedUserId);
      }
      setLoadingUser(false);
    };

    checkUserAuth();
  }, []);

  const { data: trendingMovies, loading: trendingLoading, error: trendingError } = useFetch(() => getTrendingMovies());
  const { data: movies, loading: moviesLoading, error: moviesError } = useFetch(() => fetchMovies({ query: "" }));

  if (loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

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

          {moviesLoading || trendingLoading ? (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
          ) : moviesError || trendingError ? (
            <Text>Error: {moviesError?.message || trendingError?.message}</Text>
          ) : (
            <View style={styles.contentContainer}>
              <SearchBar onPress={() => router.push("/search")} placeholder="Search for a movie" />
              {trendingMovies && (
                <View style={styles.trendingContainer}>
                  <Text style={styles.sectionTitle}>Trending Movies</Text>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.trendingList}
                    data={trendingMovies}
                    contentContainerStyle={styles.trendingListContent}
                    renderItem={({ item, index }) => <TrendingCard movie={item} index={index} />}
                    keyExtractor={(item) => item.movie_id.toString()}
                    ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                  />
                </View>
              )}

              <Text style={styles.sectionTitle}>Latest Movies</Text>
              <View style={styles.movieListContainer}>
                {movies?.length ? (
                  movies.map((item) => <MovieCard key={item.id} {...item} />)
                ) : (
                  <Text>No movies available</Text>
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
  trendingContainer: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    marginBottom: 12,
  },
  trendingList: {
    marginBottom: 16,
    marginTop: 12,
  },
  trendingListContent: {
    gap: 26,
  },
  itemSeparator: {
    width: 16,
  },
  movieListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});

export default Index;
