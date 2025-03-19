import { Link } from "expo-router";
import MaskedView from "@react-native-masked-view/masked-view";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

import { images } from "@/constants/images";

interface TrendingCardProps {
  movie: {
    movie_id: number;
    title: string;
    poster_url: string;
  };
  index: number;
}

const TrendingCard = ({ movie: { movie_id, title, poster_url }, index }: TrendingCardProps) => {
  return (
    <Link href={`/movies/${movie_id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <Image source={{ uri: poster_url }} style={styles.poster} resizeMode="cover" />

        <View style={styles.rankContainer}>
          <MaskedView
            maskElement={<Text style={styles.rankText}>{index + 1}</Text>}
          >
            <Image source={images.rankingGradient} style={styles.rankImage} resizeMode="cover" />
          </MaskedView>
        </View>

        {/* Movie Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 128, 
    position: "relative",
    paddingLeft: 25, 
  },
  poster: {
    width: 128,
    height: 192,
    borderRadius: 10,
  },
  rankContainer: {
    position: "absolute",
    bottom: 36, 
    left: -14, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 999, 
  },
  rankText: {
    fontSize: 48, 
    fontWeight: "bold",
    color: "white", 
  },
  rankImage: {
    width: 56, 
    height: 56,

  },
  title: {
    fontSize: 14, 
    fontWeight: "bold",
    marginTop: 8, 
    marginLeft: 8,
    color: "white", 
  },
});

export default TrendingCard;
