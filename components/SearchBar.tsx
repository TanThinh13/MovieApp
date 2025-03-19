import { View, TextInput, Image, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

interface Props {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
}

const SearchBar = ({ placeholder, value, onChangeText, onPress }: Props) => {
  return (
    <View style={styles.container}>
      <ImageBackground source={images.bg2} style={styles.bgImage} resizeMode="cover">
        <Image source={icons.search} style={styles.icon} resizeMode="contain" tintColor="#AB8BFF" />
        <TextInput
          onPressIn={onPress}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          placeholderTextColor="white"
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 25, 
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6, 
  },
  bgImage: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8, 
    paddingHorizontal: 12, 
  },
  icon: {
    width: 18, 
    height: 18,
    marginRight: 8,
    tintColor: "rgba(255, 255, 255, 0.8)", 
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: "white",
    fontSize: 14,
  },
});


export default SearchBar;
