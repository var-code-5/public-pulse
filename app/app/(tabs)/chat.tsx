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
  latitude?: number;
  longitude?: number;
  severity?: number;
  status?: string;
  departmentId?: string;
  authorId?: string;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  images?: {
    id: string;
    url: string;
    issueId: string;
    createdAt: string;
  }[];
  _count?: {
    comments: number;
    votes: number;
  };
  votes?: {
    upvotes: number;
    downvotes: number;
    userVote: string | null;
  };
};

// Post Card Component
const PostCard = ({ post, onPress }: { post: PostData; onPress: () => void }) => {
  // Get display name from author object
  const displayName = post.author?.name || "Anonymous";
  
  // Format date for display
  const getTimeAgo = () => {
    const postDate = new Date(post.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} Hours Ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} Days Ago`;
    }
  };
  
  // Get comment count 
  const commentCount = post._count?.comments ?? 0;
  
  // Get image URL from images array
  const imageUrl = post.images && post.images.length > 0 ? post.images[0].url : undefined;
  
  // Get votes
  const upvotes = post.votes?.upvotes ?? 0;
  const downvotes = post.votes?.downvotes ?? 0;

  return (
    <TouchableOpacity
      className="bg-white mb-4 rounded-lg shadow-sm"
      onPress={onPress}
    >
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-2">
            <Text className="text-white text-xs font-bold">{displayName.charAt(0)}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-700">Posted By <Text className="font-bold">{displayName}</Text></Text>
            <Text className="text-xs text-gray-500">{getTimeAgo()}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-bold flex-1">{post.title}</Text>
          {post.severity !== undefined && (
            <View className={`rounded-full px-2 py-0.5 ${
              post.severity > 7 ? "bg-red-100" : 
              post.severity > 4 ? "bg-yellow-100" : "bg-green-100"
            }`}>
              <Text className={`text-xs font-bold ${
                post.severity > 7 ? "text-red-700" : 
                post.severity > 4 ? "text-yellow-700" : "text-green-700"
              }`}>
                Severity: {post.severity}/10
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-700 mb-2">
          {post.description}
          <Text className="text-purple-500"> Read More</Text>
        </Text>
        
        {imageUrl && (
          <View className="mb-3">
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-40 rounded-md"
              resizeMode="cover"
            />
          </View>
        )}
        
        <View className="flex-row flex-wrap mb-2 gap-2">
          {post.status && (
            <View className={`rounded-full px-3 py-1 ${
              post.status === "RESOLVED" ? "bg-green-100" : 
              post.status === "IN_PROGRESS" ? "bg-yellow-100" : "bg-purple-100"
            }`}>
              <Text className={`text-xs font-medium ${
                post.status === "RESOLVED" ? "text-green-700" : 
                post.status === "IN_PROGRESS" ? "text-yellow-700" : "text-purple-700"
              }`}>
                {post.status.replace("_", " ")}
              </Text>
            </View>
          )}
          
          {post.department && (
            <View className="bg-gray-100 rounded-full px-3 py-1">
              <Text className="text-xs font-medium text-gray-700">
                {post.department.name}
              </Text>
            </View>
          )}
        </View>
        
        <View className="flex-row justify-between items-center pt-2">
          <View className="flex-row">
            <TouchableOpacity className="mr-4 flex-row items-center">
              <icons.Vote width={20} height={20} />
              <Text className="ml-1 text-xs text-gray-600">{upvotes}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <icons.Vote1 width={20} height={20} />
              <Text className="ml-1 text-xs text-gray-600">{downvotes}</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center mr-4">
              <icons.ModeComment width={18} height={18} />
              <Text className="ml-1 text-xs text-gray-600">{commentCount} comments</Text>
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
      id: "cmfeis0kw0001ohpoa4lni6xt",
      title: "Major Potholes Detected!",
      description: "I nearly lost control of my bike because the potholes on this road are so deep they feel like craters. Every car that passes by makes a loud thud, and I'm scared someone's going to get seriously hurt here. It's impossible to drive smoothly — the entire stretch is like an obstacle course!",
      latitude: 40.73061,
      longitude: -73.935242,
      severity: 8,
      status: "PENDING",
      departmentId: "cmfefl6830000ohao11cea8ij",
      authorId: "cmfegc37k0000ohp0u3gqp6mh",
      createdAt: "2025-09-10T21:56:51.824Z",
      updatedAt: "2025-09-10T21:56:51.824Z",
      author: {
        id: "cmfegc37k0000ohp0u3gqp6mh",
        name: "Dibyendu De"
      },
      department: {
        id: "cmfefl6830000ohao11cea8ij",
        name: "Public Works"
      },
      images: [
        {
          id: "cmfeis0rd0003ohpoju32z82x",
          url: "https://public-pulse-in.s3.ap-south-1.amazonaws.com/uploads/74b0a003-850e-4d63-8227-f60d8788529a-pothole.jpeg",
          issueId: "cmfeis0kw0001ohpoa4lni6xt",
          createdAt: "2025-09-10T21:56:52.057Z"
        }
      ],
      _count: {
        comments: 2,
        votes: 0
      },
      votes: {
        upvotes: 0,
        downvotes: 0,
        userVote: null
      }
    },
    {
      id: "2",
      title: "Sewage overflow near school area",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      createdAt: "2025-09-09T18:30:00.000Z",
      author: {
        id: "user123",
        name: "Mrinali Hardwaj"
      },
      _count: {
        comments: 360,
        votes: 25
      },
      votes: {
        upvotes: 25,
        downvotes: 0,
        userVote: null
      },
      images: [
        {
          id: "img123",
          url: "https://images.unsplash.com/photo-1636836597597-2464a3115ac7?q=80&w=1000&auto=format&fit=crop",
          issueId: "2",
          createdAt: "2025-09-09T18:30:00.000Z"
        }
      ],
      status: "IN_PROGRESS"
    },
    {
      id: "3",
      title: "Road damage on Main Street",
      description: "The road has multiple potholes that are causing accidents and damage to vehicles. This needs immediate attention.",
      createdAt: "2025-09-08T10:15:00.000Z",
      author: {
        id: "user456",
        name: "Raj Kumar"
      },
      _count: {
        comments: 152,
        votes: 78
      },
      votes: {
        upvotes: 75,
        downvotes: 3,
        userVote: null
      },
      images: [
        {
          id: "img456",
          url: "https://images.unsplash.com/photo-1594818379496-da1e345d90f3?q=80&w=1000&auto=format&fit=crop",
          issueId: "3",
          createdAt: "2025-09-08T10:15:00.000Z"
        }
      ],
      status: "RESOLVED"
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