import { Tabs } from "expo-router";
import { View, Image, Text, ImageBackground } from "react-native";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

function TabIcon({ focused, icon, title }: any) {
  return focused ? (
    <ImageBackground
      source={images.highlight}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: 112,
        height: 56,
        marginTop: 10,
        borderRadius: 50,
        overflow: "hidden",
      }}
    >
      <Image source={icon} style={{ tintColor: "#151312", width: 20, height: 20 }} />
      <Text style={{ color: "#151312", fontWeight: "bold", marginLeft: 5 }}>{title}</Text>
    </ImageBackground>
  ) : (
    <View style={{ justifyContent: "center", alignItems: "center", marginTop: 10 }}>
      <Image source={icon} style={{ tintColor: "#A8B5DB", width: 20, height: 20 }} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 10,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0F0D23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} title="Home" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.search} title="Search" />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.save} title="Saved" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.person} title="Profile" />,
        }}
      />
    </Tabs>
  );
}
