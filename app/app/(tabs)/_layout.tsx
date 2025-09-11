import { Tabs } from "expo-router";
import { ImageBackground, View } from "react-native";

import { icons } from "@/assets/constants/icons";
import { images } from "@/assets/constants/images";

function TabIcon({ focused, icon: Icon, activeIcon: ActiveIcon, title }: any) {
  if (focused) {
    return (
      <View
        className="flex flex-row min-w-20 flex-1 min-h-12 mt-4 justify-center items-center rounded-full overflow-hidden bg-white"
      >
        <ActiveIcon width={20} height={20} />
      </View>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Icon width={20} height={20} fill="#6C48F5" />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#6C48F5",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#6C48F5",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.Home} activeIcon={icons.HomePurple} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.Chat} activeIcon={icons.ChatPurple} title="Chat" />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Report",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.Report} activeIcon={icons.ReportPurple} title="Report" />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.Settings} activeIcon={icons.SettingsPurple} title="Settings" />
          ),
        }}
      />
    </Tabs>
  );
}