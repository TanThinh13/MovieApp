import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View, StyleSheet } from "react-native";

import { icons } from "@/constants/icons";

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}:Movie) => {
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity style={styles.cardContainer}>
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
          }}
          style={styles.poster}
          resizeMode="cover"
        />

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.ratingContainer}>
          <Image source={icons.star} style={styles.starIcon} />
          <Text style={styles.ratingText}>{Math.round(vote_average / 2)}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.releaseDate}>{release_date?.split("-")[0]}</Text>
          <Text style={styles.movieLabel}>Movie</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "30%",
  },
  poster: {
    width: "100%",
    height: 208, 
    borderRadius: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    width: 16,
    height: 16,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "white",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "center", 
  },  
  releaseDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 50, 
  },
  
  movieLabel: {
    fontSize: 14,
    color: "#ddd",
    fontWeight: "bold",
  },
});

export default MovieCard;
