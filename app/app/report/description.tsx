import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Description = () => {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    // Load the captured image from AsyncStorage if available
    const loadCapturedImage = async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage')
        const storedImage = await AsyncStorage.default.getItem('capturedImage')
        if (storedImage) {
          setCapturedImage(storedImage)
        }
      } catch (error) {
        console.error('Error loading captured image:', error)
      }
    }
    
    loadCapturedImage()
  }, [])
  
  const saveDescription = async () => {
    try {
      // Save the description to AsyncStorage
      const AsyncStorage = await import('@react-native-async-storage/async-storage')
      await AsyncStorage.default.setItem('reportTitle', title)
      await AsyncStorage.default.setItem('reportDetails', details)
      
      // Navigate back to the report page
      router.back()
    } catch (error) {
      console.error('Error saving description:', error)
    }
  }
  
  const handleCapturePress = () => {
    router.push('/report/capture')
  }
  
  return (
    <SafeAreaView className="flex-1 bg-purple-600">
      <StatusBar style="light" />
      
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="py-4 items-center">
          <Text className="text-white text-lg font-bold">Report Your Issue</Text>
        </View>
        
        {/* Image Section */}
        <TouchableOpacity 
          className="mx-4 rounded-2xl overflow-hidden bg-gray-200 h-52"
          onPress={handleCapturePress}
        >
          {capturedImage ? (
            <Image 
              source={{ uri: capturedImage }} 
              className="w-full h-full" 
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">Tap to add an image</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Description Form */}
        <View className="m-4 bg-white p-4 rounded-2xl">
          <TextInput
            className="p-2 border-b border-gray-300 text-gray-800"
            placeholder="Add Your Problem Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="p-2 h-28 text-gray-800 mt-2"
            placeholder="Description..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />
        </View>
        
        {/* Spacer */}
        <View className="h-10" />
      </ScrollView>
      
      {/* Submit Button */}
      <View className="p-4">
        <TouchableOpacity 
          className="bg-white rounded-full p-4"
          onPress={saveDescription}
        >
          <Text className="text-purple-600 font-semibold text-center">Report Your Problem</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Description

const styles = StyleSheet.create({})