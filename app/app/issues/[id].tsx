import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function IssueDetails() {
  const { id } = useLocalSearchParams();
  
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Issue Details</Text>
      <Text className="mt-2">Issue ID: {id}</Text>
      <Text className="mt-4 text-gray-500">This page will be implemented soon</Text>
    </View>
  );
}
