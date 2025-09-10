import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/assets/constants/icons';

// Define types
type Comment = {
  id: string;
  username: string;
  timeAgo: string;
  text: string;
  likes: number;
  dislikes: number;
};

type Issue = {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  timeAgo: string;
  likes: number;
  dislikes: number;
  comments: Comment[];
  imageUrl?: string;
};

// Comment Component
const CommentItem = ({ comment }: { comment: Comment }) => {
  return (
    <View className="mb-4 pb-4 border-b border-gray-200">
      <View className="flex-row items-center mb-2">
        <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-2">
          <Text className="text-white text-xs font-bold">{comment.username.charAt(0)}</Text>
        </View>
        <View className="flex-row items-center justify-between flex-1">
          <Text className="font-bold">{comment.username}</Text>
          <Text className="text-xs text-gray-500">{comment.timeAgo}</Text>
        </View>
      </View>
      
      <Text className="text-gray-700 ml-10">{comment.text}</Text>
      
      <View className="flex-row items-center mt-2 ml-10">
        <TouchableOpacity className="flex-row items-center mr-4">
          <icons.Vote width={16} height={16} />
          <Text className="ml-1 text-xs text-gray-600">{comment.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mr-4">
          <icons.Vote1 width={16} height={16} />
          <Text className="ml-1 text-xs text-gray-600">{comment.dislikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center mr-4">
          <Text className="text-xs text-purple-500">Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-xs text-purple-500">Share</Text>
        </TouchableOpacity>
        <TouchableOpacity className="ml-auto">
          <Text className="text-xs text-gray-500">•••</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function IssueDetails() {
  const { id } = useLocalSearchParams();
  const [newComment, setNewComment] = useState('');
  
  // Dummy data for the issue
  const [issue, setIssue] = useState<Issue>({
    id: id as string,
    title: "Sewage overflow near school area",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sed risque felis. Ut leo tortor, posuere gravida porttitor sed odio. Nullam iaculis diam erac, quis pharetra sem condimentum vitae. Integer ac nisl et ligula feugiat pretium non ut tellus. Maecenas et magna et neque rutrum luctus aliquet tristique vitae nunc. Vivamus elementum tempus imperdiet. Cras eleifend eget turpis. Ut Donec pharetra a neque eget convallis. Vivamus nec bibendum lorem. Donec volutpat sapien nulla, ut eleifend erat accumsan non.",
    postedBy: "@MrinaliHardwaj",
    timeAgo: "22 Hours Ago",
    likes: 15,
    dislikes: 3,
    imageUrl: "https://images.unsplash.com/photo-1636836597597-2464a3115ac7?q=80&w=1000&auto=format&fit=crop",
    comments: [
      {
        id: "1",
        username: "Username",
        timeAgo: "3 hr ago",
        text: "You can comment here as this is a comment section.",
        likes: 1,
        dislikes: 0
      },
      {
        id: "2",
        username: "Username",
        timeAgo: "2 hr ago",
        text: "You can comment here as this is a comment section.",
        likes: 3,
        dislikes: 1
      },
      {
        id: "3",
        username: "Username",
        timeAgo: "1 hr ago",
        text: "You can comment here as this is a comment section.",
        likes: 2,
        dislikes: 0
      }
    ]
  });
  
  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    
    const newCommentObj: Comment = {
      id: `${issue.comments.length + 1}`,
      username: "You",
      timeAgo: "Just now",
      text: newComment,
      likes: 0,
      dislikes: 0
    };
    
    setIssue(prev => ({
      ...prev,
      comments: [newCommentObj, ...prev.comments]
    }));
    
    setNewComment('');
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-purple-600 font-semibold">Back</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-bold">Issue Details</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView className="flex-1">
          {/* Issue Content */}
          <View className="p-4">
            {/* Author info */}
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 bg-purple-500 rounded-full justify-center items-center mr-3">
                <Text className="text-white font-bold">{issue.postedBy.charAt(1)}</Text>
              </View>
              <View>
                <Text className="text-sm text-gray-700">Posted By <Text className="font-bold">{issue.postedBy}</Text></Text>
                <Text className="text-xs text-gray-500">{issue.timeAgo}</Text>
              </View>
            </View>
            
            {/* Title and description */}
            <Text className="text-xl font-bold mb-2">{issue.title}</Text>
            <Text className="text-gray-700 mb-4">{issue.description}</Text>
            
            {/* Image if available */}
            {issue.imageUrl && (
              <Image
                source={{ uri: issue.imageUrl }}
                className="w-full h-48 rounded-md mb-4"
                resizeMode="cover"
              />
            )}
            
            {/* Action buttons */}
            <View className="flex-row justify-between items-center py-3 border-t border-b border-gray-200 mb-6">
              <View className="flex-row">
                <TouchableOpacity className="mr-6 flex-row items-center">
                  <icons.Vote width={20} height={20} />
                  <Text className="ml-1 text-sm">{issue.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center">
                  <icons.Vote1 width={20} height={20} />
                  <Text className="ml-1 text-sm">{issue.dislikes}</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity className="flex-row items-center">
                <icons.ShareOutline width={20} height={20} />
                <Text className="ml-1 text-sm">Share</Text>
              </TouchableOpacity>
            </View>
            
            {/* Comments section */}
            <View>
              <Text className="font-bold text-lg mb-4">Comments</Text>
              
              {/* Add comment input */}
              <View className="flex-row items-center mb-6">
                <View className="w-8 h-8 bg-purple-500 rounded-full justify-center items-center mr-2">
                  <Text className="text-white text-xs font-bold">Y</Text>
                </View>
                <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                  <TextInput
                    className="flex-1"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity onPress={handleAddComment}>
                    <Text className="text-purple-600 font-bold">Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Comments list */}
              {issue.comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
