import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/assets/constants/icons";

// Define GrievanceData type
type GrievanceData = {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  timeAgo: string;
  comments: number;
  status: "Pending" | "In Progress" | "Resolved";
  imageUrl?: string;
};

// Grievance Card Component
const GrievanceCard = ({ grievance, onPress }: { grievance: GrievanceData; onPress: () => void }) => {
  return (
    <TouchableOpacity
      className="bg-white mb-4 rounded-lg shadow-sm"
      onPress={onPress}
    >
      <View className="p-4">
        {grievance.status === "Pending" && (
          <View className="bg-orange-100 self-start rounded-full px-3 py-1 mb-2">
            <Text className="text-xs text-orange-700 font-medium">Action Required</Text>
          </View>
        )}
        {grievance.status === "In Progress" && (
          <View className="bg-blue-100 self-start rounded-full px-3 py-1 mb-2">
            <Text className="text-xs text-blue-700 font-medium">In Progress</Text>
          </View>
        )}
        {grievance.status === "Resolved" && (
          <View className="bg-green-100 self-start rounded-full px-3 py-1 mb-2">
            <Text className="text-xs text-green-700 font-medium">Resolved</Text>
          </View>
        )}
        
        <Text className="text-base font-bold mb-1">{grievance.title}</Text>
        <Text className="text-sm text-gray-700 mb-2">
          {grievance.description}
          <Text className="text-purple-500"> Read More</Text>
        </Text>
        
        {grievance.imageUrl && (
          <View className="mb-3">
            <Image
              source={{ uri: grievance.imageUrl }}
              className="w-full h-40 rounded-md"
              resizeMode="cover"
            />
          </View>
        )}
        
        <View className="flex-row justify-between items-center pt-2 mt-1">
          <Text className="text-xs text-gray-500">{grievance.timeAgo}</Text>
          
          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center mr-4">
              <icons.ModeComment width={18} height={18} />
              <Text className="ml-1 text-xs text-gray-600">{grievance.comments} comments</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <icons.ShareOutline width={18} height={18} />
              <Text className="ml-1 text-xs text-gray-600">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Filter Item Component
const FilterItem = ({ 
  label, 
  isActive, 
  onPress 
}: { 
  label: string; 
  isActive: boolean; 
  onPress: () => void 
}) => {
  return (
    <TouchableOpacity 
      className={`mx-2 px-4 py-2 rounded-full ${isActive ? "bg-purple-600" : "bg-gray-100"}`}
      onPress={onPress}
    >
      <Text className={`text-sm ${isActive ? "text-white font-medium" : "text-gray-700"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function Reports() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Sample data for grievances
  const [grievances, setGrievances] = useState<GrievanceData[]>([
    {
      id: "1",
      title: "Sewage overflow near school area",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      postedBy: "You",
      timeAgo: "22 Hours Ago",
      comments: 360,
      status: "Pending",
      imageUrl: undefined
    },
    {
      id: "2",
      title: "Sewage overflow near school area",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      postedBy: "You",
      timeAgo: "22 Hours Ago",
      comments: 360,
      status: "In Progress",
      imageUrl: "https://images.unsplash.com/photo-1636836597597-2464a3115ac7?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "3",
      title: "Road damage on Main Street",
      description: "The road has multiple potholes that are causing accidents and damage to vehicles. This needs immediate attention.",
      postedBy: "You",
      timeAgo: "2 Days Ago",
      comments: 152,
      status: "Resolved",
      imageUrl: "https://images.unsplash.com/photo-1594818379496-da1e345d90f3?q=80&w=1000&auto=format&fit=crop"
    }
  ]);
  
  // Handle grievance press
  const handleGrievancePress = (grievanceId: string) => {
    router.push(`/issues/${grievanceId}`);
  };

  // Filter grievances based on active filter
  const filteredGrievances = activeFilter === "all" 
    ? grievances 
    : grievances.filter(g => 
        activeFilter === "pending" ? g.status === "Pending" : 
        activeFilter === "inprogress" ? g.status === "In Progress" : 
        g.status === "Resolved"
      );
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View className="px-5 py-3 bg-purple-600">
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-bold text-white">Grievance Reports</Text>
          <View className="bg-purple-500 px-3 py-1 rounded-lg">
            <Text className="text-white text-xs font-medium">Public Pulse</Text>
          </View>
        </View>
      </View>
      
      {/* Filter Section */}
      <View className="mt-4 mb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          <FilterItem 
            label="All"
            isActive={activeFilter === "all"}
            onPress={() => setActiveFilter("all")}
          />
          <FilterItem 
            label="Pending"
            isActive={activeFilter === "pending"}
            onPress={() => setActiveFilter("pending")}
          />
          <FilterItem 
            label="In Progress"
            isActive={activeFilter === "inprogress"}
            onPress={() => setActiveFilter("inprogress")}
          />
          <FilterItem 
            label="Resolved"
            isActive={activeFilter === "resolved"}
            onPress={() => setActiveFilter("resolved")}
          />
        </ScrollView>
      </View>
      
      {/* Grievances Section */}
      <FlatList
        data={filteredGrievances}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GrievanceCard grievance={item} onPress={() => handleGrievancePress(item.id)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Report Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-purple-600 w-14 h-14 rounded-full justify-center items-center shadow-md"
        onPress={() => router.push("/report/description")}
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}