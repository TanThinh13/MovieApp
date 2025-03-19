import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Image, StyleSheet } from "react-native";

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/supabase";

import SearchBar from "@/components/SearchBar";
import MovieDisplayCard from "@/components/MovieCard";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies = [],
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();

        if (movies?.length! > 0 && movies?.[0]) {
          await updateSearchCount(searchQuery, movies[0]);
        }
      } else {
        reset();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Image source={images.bg2} style={styles.backgroundImage} resizeMode="cover" />

      <FlatList
        style={styles.flatList}
        data={movies as Movie[]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <View style={styles.logoContainer}>
              <Image source={icons.logo} style={styles.logo} />
            </View>

            <View style={styles.searchBarContainer}>
              <SearchBar placeholder="Search for a movie" value={searchQuery} onChangeText={handleSearch} />
            </View>

            {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
            {error && <Text style={styles.errorText}>Error: {error.message}</Text>}
            {!loading && !error && searchQuery.trim() && movies?.length! > 0 && (
              <Text style={styles.searchResultsText}>
                Search Results for <Text style={styles.accentText}>{searchQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? "No movies found" : "Start typing to search for movies"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", 
  },
  backgroundImage: {
    flex: 1,
    position: "absolute",
    width: "100%",
    zIndex: 0,
  },
  flatList: {
    paddingHorizontal: 20, 
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 16,
    marginVertical: 16,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  logoContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    alignItems: "center",
  },
  logo: {
    width: 48, 
    height: 40, 
  },
  searchBarContainer: {
    marginVertical: 20, 
  },
  loader: {
    marginVertical: 12, 
  },
  errorText: {
    color: "#FF3B30", 
    paddingHorizontal: 20, 
    marginVertical: 12, 
  },
  searchResultsText: {
    fontSize: 20, 
    color: "#FFFFFF", 
    fontWeight: "bold",
  },
  accentText: {
    color: "#efd29a", 
  },
  emptyContainer: {
    marginTop: 40, 
    paddingHorizontal: 20, 
  },
  emptyText: {
    textAlign: "center",
    color: "white", 
  },
});

export default Search;
