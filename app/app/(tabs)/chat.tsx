import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/assets/constants/icons";

// Define PostData type
type PostData = {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  timeAgo: string;
  comments: number;
  imageUrl?: string;
};

// Post Card Component
const PostCard = ({ post, onPress }: { post: PostData; onPress: () => void }) => {
  return (
    <TouchableOpacity
      className="bg-white mb-4 rounded-lg shadow-sm"
      onPress={onPress}
    >
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-2">
            <Text className="text-white text-xs font-bold">{post.postedBy.charAt(0)}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-700">Posted By <Text className="font-bold">{post.postedBy}</Text></Text>
            <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
          </View>
        </View>
        
        <Text className="text-base font-bold mb-1">{post.title}</Text>
        <Text className="text-sm text-gray-700 mb-2">
          {post.description}
          <Text className="text-purple-500"> Read More</Text>
        </Text>
        
        {post.imageUrl && (
          <View className="mb-3">
            <Image
              source={{ uri: post.imageUrl }}
              className="w-full h-40 rounded-md"
              resizeMode="cover"
            />
          </View>
        )}
        
        <View className="flex-row justify-between items-center pt-2">
          <View className="flex-row">
            <TouchableOpacity className="mr-4 flex-row items-center">
              <icons.Vote width={20} height={20} />
              <View style={{ width: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <icons.Vote1 width={20} height={20} />
              <View style={{ width: 8 }} />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center mr-4">
              <icons.ModeComment width={18} height={18} />
              <Text className="ml-1 text-xs text-gray-600">{post.comments} comments</Text>
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
  icon, 
  label, 
  isActive, 
  onPress 
}: { 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onPress: () => void 
}) => {
  return (
    <TouchableOpacity 
      className={`flex items-center mx-2 px-3 py-2 rounded-full ${isActive ? "bg-purple-100" : "bg-gray-100"}`}
      onPress={onPress}
    >
      <View className="flex-row items-center">
        {icon}
        <Text className={`ml-2 text-sm ${isActive ? "font-bold text-purple-700" : "text-gray-700"}`}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Chat() {
  const [userName, setUserName] = useState("Ayush");
  const [currentDate, setCurrentDate] = useState("11 September, 2025");
  const [activeFilter, setActiveFilter] = useState("trending");
  
  // Sample data for posts
  const [posts, setPosts] = useState<PostData[]>([
    {
      id: "1",
      title: "Sewage overflow near school area",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      postedBy: "@MrinaliHardwaj",
      timeAgo: "22 Hours Ago",
      comments: 360,
      imageUrl: undefined
    },
    {
      id: "2",
      title: "Sewage overflow near school area",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      postedBy: "@MrinaliHardwaj",
      timeAgo: "22 Hours Ago",
      comments: 360,
      imageUrl: "https://images.unsplash.com/photo-1636836597597-2464a3115ac7?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "3",
      title: "Road damage on Main Street",
      description: "The road has multiple potholes that are causing accidents and damage to vehicles. This needs immediate attention.",
      postedBy: "@RajKumar",
      timeAgo: "2 Days Ago",
      comments: 152,
      imageUrl: "https://images.unsplash.com/photo-1594818379496-da1e345d90f3?q=80&w=1000&auto=format&fit=crop"
    }
  ]);
  
  // Handle post press
  const handlePostPress = (postId: string) => {
    router.push(`/issues/${postId}`);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
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
      
      {/* Filter Section */}
      <View className="mt-2 mb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        >
          <FilterItem 
            icon={<icons.Vector width={18} height={18} fill={activeFilter === "trending" ? "#7C3AED" : "#6B7280"} />}
            label="Trending"
            isActive={activeFilter === "trending"}
            onPress={() => setActiveFilter("trending")}
          />
          <FilterItem 
            icon={<icons.Icon width={18} height={18} fill={activeFilter === "nearest" ? "#7C3AED" : "#6B7280"} />}
            label="Nearest"
            isActive={activeFilter === "nearest"}
            onPress={() => setActiveFilter("nearest")}
          />
          <FilterItem 
            icon={<icons.Report width={18} height={18} fill={activeFilter === "progress" ? "#7C3AED" : "#6B7280"} />}
            label="Progress"
            isActive={activeFilter === "progress"}
            onPress={() => setActiveFilter("progress")}
          />
          <FilterItem 
            icon={<icons.ModeComment width={18} height={18} fill={activeFilter === "latest" ? "#7C3AED" : "#6B7280"} />}
            label="Latest"
            isActive={activeFilter === "latest"}
            onPress={() => setActiveFilter("latest")}
          />
        </ScrollView>
      </View>
      
      {/* Posts Section */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onPress={() => handlePostPress(item.id)} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}