import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../assets/constants/icons'

const Report = () => {
  const router = useRouter()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [reportTitle, setReportTitle] = useState<string | null>(null)
  const [reportDetails, setReportDetails] = useState<string | null>(null)
  
  useEffect(() => {
    // Check for captured data when component mounts or becomes focused
    const loadReportData = async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage')
        
        // Load image
        const storedImage = await AsyncStorage.default.getItem('capturedImage')
        if (storedImage) {
          setCapturedImage(storedImage)
        }
        
        // Load text descriptions
        const title = await AsyncStorage.default.getItem('reportTitle')
        if (title) {
          setReportTitle(title)
        }
        
        const details = await AsyncStorage.default.getItem('reportDetails')
        if (details) {
          setReportDetails(details)
        }
      } catch (error) {
        console.error('Error loading report data:', error)
      }
    }
    
    loadReportData()
  }, [])
  
  const handleCapturePress = () => {
    router.push('/report/capture')
  }
  
  const handleDescriptionPress = () => {
    router.push('/report/description')
  }
  
  const handleReportPress = () => {
    // Only proceed if both image and title are provided
    if (capturedImage && reportTitle) {
      // In a real app, you would send the report data to a server here
      console.log('Submitting report:', {
        image: capturedImage,
        title: reportTitle,
        details: reportDetails
      })
      
      router.push('/report/ack')
    } else {
      // Could add a visual indication that fields are required
      console.log('Missing required fields')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <Text className="text-purple-600 text-xl font-bold">Public Pulse</Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity>
            <icons.Notification width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity>
            <icons.MenuBurger width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Map View */}
      <View className="flex-1 bg-gray-200">
        <Image 
          source={require('../../assets/images/highlight.png')}
          className="w-full h-full opacity-50"
          resizeMode="cover"
        />
      </View>
      
      {/* Bottom Content */}
      <View className="bg-purple-600 rounded-t-3xl p-5 space-y-4">
        <View className="items-center">
          <View className="w-16 h-1.5 bg-white/50 rounded-full" />
        </View>
        
        <Text className="text-white text-xl font-bold text-center">Report Your Issue</Text>
        
        {/* Capture Button */}
        <TouchableOpacity 
          className="flex-row items-center bg-white rounded-full p-3 px-5"
          onPress={handleCapturePress}
        >
          {capturedImage ? (
            <>
              <Image 
                source={{ uri: capturedImage }} 
                className="w-8 h-8 rounded-full mr-3" 
                resizeMode="cover"
              />
              <Text className="text-purple-600 font-semibold">Change Photo</Text>
            </>
          ) : (
            <>
              <icons.CameraAltPurple width={24} height={24} />
              <Text className="ml-3 text-purple-600 font-semibold">Capture The Problem</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Description Button */}
        <TouchableOpacity 
          className="flex-row items-center bg-white rounded-full p-3 px-5"
          onPress={handleDescriptionPress}
        >
          <icons.ModeCommentPurple width={24} height={24} />
          <Text className="ml-3 text-purple-600 font-semibold">
            {reportTitle ? 'Edit Description' : 'Add Text For Your Problem'}
          </Text>
        </TouchableOpacity>
        
        {/* Submit Button */}
        <TouchableOpacity 
          className={`${!capturedImage || !reportTitle ? 'bg-white/70' : 'bg-white'} rounded-full p-4 mt-2`}
          onPress={handleReportPress}
          disabled={!capturedImage || !reportTitle}
        >
          <Text className="text-purple-600 font-semibold text-center">Report Your Problem</Text>
          {(!capturedImage || !reportTitle) && (
            <Text className="text-purple-500/70 text-xs text-center mt-1">
              {!capturedImage && !reportTitle 
                ? 'Please add a photo and description' 
                : !capturedImage 
                  ? 'Please add a photo' 
                  : 'Please add a description'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Report

const styles = StyleSheet.create({})