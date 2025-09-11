import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIssues } from "@/context";
import { useLocation } from "@/hooks";

import { icons } from "@/assets/constants/icons";

export default function Index() {
  const router = useRouter();
  const [userName, setUserName] = useState("Ayush");
  const { issues, nearbyIssues, isLoading, error, fetchIssues, fetchNearbyIssues } = useIssues();
  const { location, loading: locationLoading, getCurrentLocation } = useLocation();
  
  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Fetch issues when component loads
  useEffect(() => {
    fetchIssues();
  }, []);
  
  // Fetch nearby issues when location is available
  useEffect(() => {
    const getNearbyIssues = async () => {
      await getCurrentLocation();
      if (location) {
        fetchNearbyIssues(location.latitude, location.longitude);
      }
    };
    
    getNearbyIssues();
  }, []);
  
  const handleReportProblem = () => {
    router.push("/report/report");
  };
  
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
            <TouchableOpacity 
              className="absolute top-3 right-3 bg-white p-2 rounded-full z-10 shadow-sm"
              onPress={getCurrentLocation}
            >
              <icons.CameraAlt width={20} height={20} />
            </TouchableOpacity>
            <View className="bg-blue-100 w-full h-64 items-center justify-center">
              {locationLoading ? (
                <ActivityIndicator size="large" color="#6366F1" />
              ) : location ? (
                <Text className="text-blue-800 text-sm mb-20">
                  Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Text>
              ) : (
                <Text className="text-blue-800 text-sm mb-20">Tap the camera icon to get location</Text>
              )}
            </View>
            {location && (
              <View className="absolute inset-0 justify-center items-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full opacity-30" />
                <View className="w-4 h-4 bg-blue-500 rounded-full" />
                <View className="w-1 h-10 bg-blue-500" style={{ position: 'absolute', top: '55%' }} />
              </View>
            )}
          </View>
        </View>
        
        {/* Nearby Issues */}
        <View className="mx-5 my-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Nearby Issues</Text>
            <TouchableOpacity onPress={() => router.push("/issues/_layout")}>
              <Text className="text-purple-600">View All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : error ? (
            <Text className="text-red-500">{error}</Text>
          ) : nearbyIssues && nearbyIssues.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nearbyIssues.slice(0, 5).map((issue) => (
                <TouchableOpacity 
                  key={issue.id} 
                  className="bg-white mr-3 rounded-lg shadow p-3 w-64"
                  onPress={() => router.push(`/issues/${issue.id}`)}
                >
                  <Text className="font-bold text-base" numberOfLines={1}>{issue.title}</Text>
                  <Text className="text-gray-600 text-xs mt-1" numberOfLines={2}>{issue.description}</Text>
                  <View className="flex-row justify-between items-center mt-2">
                    <View className="flex-row items-center">
                      <View className={`w-2 h-2 rounded-full ${
                        issue.status === 'PENDING' ? 'bg-yellow-500' :
                        issue.status === 'ONGOING' ? 'bg-blue-500' :
                        issue.status === 'PAUSED' ? 'bg-orange-500' : 'bg-green-500'
                      } mr-1`} />
                      <Text className="text-xs text-gray-500">{issue.status}</Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text className="text-gray-500 italic">No nearby issues found</Text>
          )}
        </View>

        {/* Report Button */}
        <View className="items-center my-4">
          <TouchableOpacity 
            className="bg-background-b px-6 py-3 rounded-full shadow-lg flex-row items-center"
            onPress={handleReportProblem}
          >
            <icons.Report width={20} height={20} fill="#ffffff" style={{ marginRight: 8 }} />
            <Text className="text-white font-medium text-center">Report a Problem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
