import { useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/assets/constants/icons";

export default function Index() {
  const [userName, setUserName] = useState("Ayush");
  const [currentDate, setCurrentDate] = useState("2 July, 2025");
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="flex-row justify-between items-center px-5 py-3">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-purple-100 rounded-full justify-center items-center mr-3">
              <Text className="text-purple-700 text-lg font-bold">A</Text>
            </View>
            <View>
              <Text className="text-lg font-bold">Hello, {userName}</Text>
              <Text className="text-gray-500">{currentDate}</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="mr-4">
              <icons.Notification width={24} height={24} fill="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Card */}
        <View className="mx-5 my-2">
          <TouchableOpacity 
            className="bg-purple-100 rounded-lg py-3 px-4 flex-row items-center"
          >
            <Text className="text-background-b font-medium text-sm flex-1">
              You have Recieved a Response from Water dept Bengaluru
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Events Card */}
        <View className="mx-5 my-2">
          <View className="bg-purple-900 rounded-xl overflow-hidden shadow-md">
            <View className="absolute top-3 left-3 bg-purple-800 rounded-full px-3 py-1 flex-row items-center z-10">
              <View className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              <Text className="text-white text-xs">Live Events</Text>
            </View>
            <TouchableOpacity className="absolute top-3 right-3 z-10">
              <icons.ShareOutline width={22} height={22} fill="#ffffff" />
            </TouchableOpacity>
            <View className="p-5 pt-12">
              <Text className="text-amber-400 text-3xl font-bold">
                Get Vaccinated
              </Text>
              <Text className="text-white mt-1">
                Together, we are looking ahead.
              </Text>
              <Text className="text-white text-xs mt-2">
                17 June to 21 July
              </Text>
              <Text className="text-amber-400 font-medium mt-1">
                Bengaluru
              </Text>
            </View>
            {/* Background design elements */}
            <View className="absolute right-0 top-0 w-24 h-24 bg-purple-700 rounded-full opacity-30" 
                  style={{ transform: [{ translateX: 30 }, { translateY: -30 }] }} />
          </View>
        </View>

        {/* Map Section */}
        <View className="mx-5 my-2">
          <View className="rounded-lg overflow-hidden border border-gray-200">
            <View className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 flex-row items-center z-10">
              <View className="w-2 h-2 bg-purple-500 rounded-full mr-1" />
              <Text className="text-xs">Your Location</Text>
            </View>
            <TouchableOpacity className="absolute top-3 right-3 bg-white p-2 rounded-full z-10 shadow-sm">
              <icons.CameraAlt width={20} height={20} />
            </TouchableOpacity>
            <View className="bg-blue-100 w-full h-64 items-center justify-center">
              <Text className="text-blue-800 text-sm mb-20">Map of Bengaluru</Text>
            </View>
            <View className="absolute inset-0 justify-center items-center">
              <View className="w-8 h-8 bg-blue-500 rounded-full opacity-30" />
              <View className="w-4 h-4 bg-blue-500 rounded-full" />
              <View className="w-1 h-10 bg-blue-500" style={{ position: 'absolute', top: '55%' }} />
            </View>
            <Text className="absolute top-1/2 left-1/2 -translate-x-16 -translate-y-3 text-lg font-bold text-gray-800">
              Bengaluru
            </Text>
          </View>
        </View>

        {/* Report Button */}
        <View className="items-center my-4">
          <TouchableOpacity className="bg-purple-900 px-6 py-3 rounded-full shadow-lg flex-row items-center">
            <icons.Report width={20} height={20} fill="#ffffff" style={{ marginRight: 8 }} />
            <Text className="text-white font-medium text-center">Report a Problem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
