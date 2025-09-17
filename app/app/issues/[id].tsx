import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { icons } from '@/assets/constants/icons';
import { useIssues, useComments } from '@/context';
import { types } from '@/services/api';

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
  
  // Use API context
  const { currentIssue, isLoading: issueLoading, fetchIssueById } = useIssues();
  const { comments, isLoading: commentsLoading, fetchCommentsByIssueId, createComment } = useComments();
  
  // Fetch issue and comments when component mounts
  useEffect(() => {
    if (id) {
      fetchIssueById(id as string);
      fetchCommentsByIssueId(id as string);
    }
  }, [id]);
  
  // Format time ago function
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hr ago`;
    } else if (diffMin > 0) {
      return `${diffMin} min ago`;
    } else {
      return 'Just now';
    }
  };
  
  const handleAddComment = async () => {
    if (newComment.trim() === '' || !id || !currentIssue) return;
    
    try {
      await createComment(newComment, id as string);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };
  
  // Show loading state
  if (issueLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-600">Loading issue details...</Text>
      </SafeAreaView>
    );
  }
  
  // Show error or no data state
  if (!currentIssue) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500">Could not load issue details</Text>
        <TouchableOpacity 
          className="mt-4 bg-purple-600 px-4 py-2 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
                <Text className="text-white font-bold">
                  {currentIssue.author?.name?.charAt(0) || 'A'}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-700">
                  Posted By <Text className="font-bold">
                    {currentIssue.author?.name || 'Anonymous'}
                  </Text>
                </Text>
                <Text className="text-xs text-gray-500">
                  {getTimeAgo(currentIssue.createdAt)}
                </Text>
              </View>
            </View>
            
            {/* Title and description */}
            <Text className="text-xl font-bold mb-2">{currentIssue.title}</Text>
            <Text className="text-gray-700 mb-4">{currentIssue.description}</Text>
            
            {/* Image if available */}
            {currentIssue.images && currentIssue.images.length > 0 && (
              <Image
                source={{ uri: currentIssue.images[0].url }}
                className="w-full h-48 rounded-md mb-4"
                resizeMode="cover"
              />
            )}
            
            {/* Status badge */}
            <View className="mb-4 flex-row">
              <View className={`px-3 py-1 rounded-full ${
                currentIssue.status === 'PENDING' ? 'bg-yellow-100 border border-yellow-400' :
                currentIssue.status === 'ONGOING' ? 'bg-blue-100 border border-blue-400' :
                currentIssue.status === 'PAUSED' ? 'bg-orange-100 border border-orange-400' :
                'bg-green-100 border border-green-400'
              }`}>
                <Text className={`text-xs font-medium ${
                  currentIssue.status === 'PENDING' ? 'text-yellow-800' :
                  currentIssue.status === 'ONGOING' ? 'text-blue-800' :
                  currentIssue.status === 'PAUSED' ? 'text-orange-800' :
                  'text-green-800'
                }`}>
                  {currentIssue.status}
                </Text>
              </View>
              
              {currentIssue.department && (
                <View className="ml-2 px-3 py-1 bg-purple-100 border border-purple-400 rounded-full">
                  <Text className="text-xs font-medium text-purple-800">
                    {currentIssue.department.name}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Action buttons */}
            <View className="flex-row justify-between items-center py-3 border-t border-b border-gray-200 mb-6">
              <View className="flex-row">
                <TouchableOpacity className="mr-6 flex-row items-center">
                  <icons.Vote width={20} height={20} />
                  <Text className="ml-1 text-sm">0</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center">
                  <icons.Vote1 width={20} height={20} />
                  <Text className="ml-1 text-sm">0</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity className="flex-row items-center">
                <icons.ShareOutline width={20} height={20} />
                <Text className="ml-1 text-sm">Share</Text>
              </TouchableOpacity>
            </View>
            
            {/* Comments section */}
            <View>
              <Text className="font-bold text-lg mb-4">
                Comments {comments.length > 0 ? `(${comments.length})` : ''}
              </Text>
              
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
              {commentsLoading ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : comments.length > 0 ? (
                comments.map((comment: types.Comment) => (
                  <CommentItem 
                    key={comment.id} 
                    comment={{
                      id: comment.id,
                      username: comment.author?.name || 'Anonymous',
                      timeAgo: getTimeAgo(comment.createdAt),
                      text: comment.content,
                      likes: 0,
                      dislikes: 0
                    }} 
                  />
                ))
              ) : (
                <Text className="text-gray-500 italic">No comments yet</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
