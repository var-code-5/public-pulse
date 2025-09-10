import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons } from '../../assets/constants/icons'

const Acknowledgment = () => {
  const router = useRouter()
  const [reportData, setReportData] = useState<{
    title: string;
    details: string;
    image: string | null;
    reportId: string;
    timestamp: Date;
  }>({
    title: '',
    details: '',
    image: null,
    reportId: `PUL-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date()
  })
  
  useEffect(() => {
    // Get the report data from storage before clearing
    const getReportData = async () => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage')
        const [imageUri, title, details] = await Promise.all([
          AsyncStorage.default.getItem('capturedImage'),
          AsyncStorage.default.getItem('reportTitle'),
          AsyncStorage.default.getItem('reportDetails')
        ])
        
        setReportData(prev => ({
          ...prev,
          title: title || 'Report Submitted',
          details: details || 'No details provided',
          image: imageUri
        }))
        
        // Clear data after retrieving it
        await AsyncStorage.default.multiRemove([
          'capturedImage', 
          'reportTitle', 
          'reportDetails'
        ])
      } catch (error) {
        console.error('Error handling report data:', error)
      }
    }
    
    // Trigger success haptic feedback
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    )
    
    getReportData()
  }, [])
  
  const handleGoBack = () => {
    router.push('/')
  }
  
  const handleAddComments = () => {
    // In a real app, this would open a comments section
    console.log('Opening comments section')
  }
  
  const handleShare = () => {
    // In a real app, this would open a share dialog
    console.log('Opening share dialog')
  }
  
  const formatTimestamp = () => {
    const now = new Date()
    const diffMs = now.getTime() - reportData.timestamp.getTime()
    const minutes = Math.floor(diffMs / (1000 * 60))
    
    if (minutes < 60) {
      return `${minutes} Minutes Ago`
    } else {
      const hours = Math.floor(minutes / 60)
      return `${hours} Hours Ago`
    }
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header - Success Banner */}
      <View className="bg-purple-600 px-4 py-3">
        <Text className="text-white text-center font-semibold">
          Grievance Reported Successfully
        </Text>
      </View>
      
      {/* Map View with Pin */}
      <View className="h-64 bg-gray-200 relative">
        <Image 
          source={require('../../assets/images/highlight.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Centered Pin */}
        <View className="absolute left-0 right-0 top-0 bottom-0 items-center justify-center">
          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-purple-600 items-center justify-center">
              <Image 
                source={reportData.image ? { uri: reportData.image } : require('../../assets/images/highlight.png')}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
            </View>
            {/* Pin Pointer */}
            <View style={styles.triangle} />
          </View>
        </View>
        
        {/* Bottom handle bar */}
        <View className="absolute bottom-0 left-0 right-0 items-center pb-2">
          <View className="w-16 h-1.5 bg-purple-600 rounded-full" />
        </View>
      </View>
      
      {/* Report Details Section */}
      <ScrollView className="flex-1 bg-purple-600 px-4 pt-4">
        <Text className="text-white font-bold text-lg mb-4">• Report Details</Text>
        
        <View className="bg-white rounded-xl p-4 mb-4">
          {/* User and timestamp */}
          <View className="flex-row items-center mb-3">
            <View className="w-4 h-4 rounded-full bg-purple-600 mr-2" />
            <Text className="text-gray-600 text-xs">Owned By @MrUserRoadHero | {formatTimestamp()}</Text>
          </View>
          
          {/* Image if available */}
          {reportData.image && (
            <View className="h-40 bg-gray-200 rounded-lg mb-3">
              <Image 
                source={{ uri: reportData.image }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            </View>
          )}
          
          {/* Title and description */}
          <Text className="text-gray-800 font-bold mb-2">{reportData.title}</Text>
          <Text className="text-gray-600 text-sm mb-3">{reportData.details}</Text>
          <TouchableOpacity>
            <Text className="text-purple-600 text-xs">Read More...</Text>
          </TouchableOpacity>
          
          {/* Action buttons */}
          <View className="flex-row mt-4">
            <View className="flex-row items-center mr-4">
              <View className="w-6 h-6 rounded-full bg-red-500 mr-1" />
              <View className="w-6 h-6 rounded-full bg-green-500" />
            </View>
            
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={handleAddComments}
            >
              <icons.ModeComment width={16} height={16} />
              <Text className="text-gray-600 text-xs ml-1">Add Comments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center ml-4"
              onPress={handleShare}
            >
              <icons.ShareOutline width={16} height={16} />
              <Text className="text-gray-600 text-xs ml-1">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Go Back Button */}
      <View className="p-4 bg-white">
        <TouchableOpacity 
          className="bg-purple-600 rounded-full p-4"
          onPress={handleGoBack}
        >
          <Text className="text-white font-semibold text-center">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Acknowledgment

const styles = StyleSheet.create({
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#9333EA', // purple-600
  }
})