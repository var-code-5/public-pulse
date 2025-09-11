import { CameraView, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Capture() {
  const [image, setImage] = useState<string | null>(null)
  const [type, setType] = useState<"front" | "back">("back")
  const [flash, setFlash] = useState<"on" | "off">("off")
  const [permission, requestPermission] = useCameraPermissions()
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions()
  const cameraRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
      
      if (!mediaLibraryPermission) {
        await requestMediaLibraryPermission();
      }
    })();
  }, [permission, mediaLibraryPermission, requestPermission, requestMediaLibraryPermission]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // @ts-ignore - The type definitions might be incomplete for the CameraView ref
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 })
        console.log('Photo captured:', photo.uri)
        setImage(photo.uri)
        
        if (mediaLibraryPermission?.granted) {
          const asset = await MediaLibrary.saveToLibraryAsync(photo.uri)
          console.log('Saved to media library:', asset)
        }
      } catch (error) {
        console.error('Error taking picture:', error)
      }
    } else {
      console.warn('Camera reference is null')
    }
  }

  const saveImage = async () => {
    if (image) {
      try {
        // Import AsyncStorage
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        // Store the image URI for later use
        await AsyncStorage.default.setItem('capturedImage', image);
        console.log('Image saved to AsyncStorage');
        
        // Navigate back to the report page
        router.back();
      } catch (error) {
        console.error('Error saving image:', error);
      }
    }
  }

  const retakePicture = () => {
    setImage(null)
  }

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>No access to camera</Text>
        <TouchableOpacity 
          className="mt-4 bg-purple-600 px-4 py-2 rounded-full"
          onPress={requestPermission}
        >
          <Text className="text-white">Request Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="mt-4 bg-gray-600 px-4 py-2 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {!image ? (
        <View className="flex-1">
          <CameraView
            className="flex-1"
            facing={type}
            ref={cameraRef}
            enableTorch={flash === "on"}
          />
          {/* Camera Controls Overlay */}
          <View className="absolute inset-0">
            <View className="flex-1 flex-row">
              <View className="flex-1 flex-row justify-between items-end p-5">
                {/* Close button */}
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                  onPress={() => router.back()}
                >
                  <Text className="text-white text-xl">×</Text>
                </TouchableOpacity>
                
                {/* Flip camera */}
                <TouchableOpacity
                  className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                  onPress={() => setType(
                    type === "back" ? "front" : "back"
                  )}
                >
                  <Text className="text-white text-sm">Flip</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Bottom controls */}
            <View className="flex-row justify-around items-center bg-black/70 h-20 absolute bottom-0 left-0 right-0">
              {/* Flash toggle */}
              <TouchableOpacity
                onPress={() => 
                  setFlash(
                    flash === "off" ? "on" : "off"
                  )
                }
              >
                <Text className={`text-${flash === "off" ? 'white' : 'yellow-400'}`}>
                  ⚡
                </Text>
              </TouchableOpacity>
              
              {/* Capture button */}
              <TouchableOpacity
                className="w-16 h-16 bg-white rounded-full border-2 border-gray-400"
                onPress={takePicture}
              />
              
              {/* Empty space for symmetry */}
              <View className="w-10" />
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1">
          <Image source={{ uri: image }} className="flex-1" />
          
          {/* Preview controls */}
          <View className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center bg-black/70 h-20">
            <TouchableOpacity
              className="px-4 py-2 bg-red-500 rounded-full"
              onPress={retakePicture}
            >
              <Text className="text-white">Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="px-4 py-2 bg-purple-600 rounded-full"
              onPress={saveImage}
            >
              <Text className="text-white">Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Bottom tab bar styling to match the image */}
      <View className="flex-row justify-around items-center bg-black h-14">
        <TouchableOpacity className="w-12 h-12 bg-purple-600 rounded-md items-center justify-center" />
        <TouchableOpacity className="w-16 h-16 bg-purple-600 rounded-full -mt-8 items-center justify-center">
          <View className="w-12 h-12 rounded-full border-2 border-black bg-transparent" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 bg-purple-600 rounded-md items-center justify-center" />
      </View>
    </View>
  )
}