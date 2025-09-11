import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Settings = () => {
  const router = useRouter()
  
  // Mock user data
  const userData = {
    name: 'Aayush Raj',
    initials: 'SM',
    grievancesReported: 5,
    solved: 1
  }

  const handleLogout = () => {
    // Add logout functionality here
    console.log('Logging out...')
    // Navigate to login screen or clear auth state
  }

  const handleDeleteAccount = () => {
    // Add delete account functionality here
    console.log('Deleting account...')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-purple-600 p-4">
        <Text className="text-white text-xl font-medium">Profile</Text>
      </View>
      
      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="items-center mt-6 mb-4">
          <View className="w-20 h-20 rounded-2xl bg-purple-100 items-center justify-center mb-2">
            <Text className="text-purple-700 text-3xl font-bold">{userData.initials}</Text>
          </View>
          
          {/* Status indicator */}
          <View className="absolute top-14 right-[155] bg-green-500 w-3 h-3 rounded-full border border-white" />
          
          <Text className="text-xs text-gray-400">Edit Profile</Text>
          <Text className="text-lg font-bold mt-2">{userData.name}</Text>
          
          <View className="flex-row w-full justify-center space-x-8 mt-4">
            <View className="items-center">
              <Text className="text-lg font-bold">{userData.grievancesReported}</Text>
              <Text className="text-xs text-gray-500">Grievances Reported</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold">{userData.solved}</Text>
              <Text className="text-xs text-gray-500">Solved</Text>
            </View>
          </View>
        </View>
        
        {/* Options List */}
        <View className="px-5 mt-4">
          <Text className="text-lg font-semibold mb-2">Personal Information</Text>
          
          <TouchableOpacity 
            className="py-3 border-b border-gray-200"
            onPress={() => console.log('Edit Avatar')}
          >
            <Text className="text-base">Edit Avatar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="py-3 border-b border-gray-200"
            onPress={() => console.log('Verify yourself')}
          >
            <Text className="text-base">Verify yourself</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="py-3 border-b border-gray-200"
            onPress={() => console.log('Terms & Conditions')}
          >
            <Text className="text-base">Terms & Conditions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="py-3 border-b border-gray-200"
            onPress={() => console.log('Privacy policy')}
          >
            <Text className="text-base">Privacy policy</Text>
          </TouchableOpacity>
        </View>
        
        {/* Delete Account Button */}
        <View className="px-5 mt-8">
          <TouchableOpacity 
            className="border border-gray-300 rounded-lg py-3 items-center"
            onPress={handleDeleteAccount}
          >
            <Text>Delete Account</Text>
          </TouchableOpacity>
          
          {/* Logout Button */}
          <TouchableOpacity 
            className="bg-purple-600 rounded-lg py-3 items-center mt-3"
            onPress={handleLogout}
          >
            <Text className="text-white">Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Settings