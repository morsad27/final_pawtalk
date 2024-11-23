import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from './../../constants/Colors'

export default function TabLayout () {
  return (
    
      <Tabs
      screenOptions={{
        tabBarActiveTintColor:Colors.PRIMARY
    }}
      >
        <Tabs.Screen name= 'pets'
        options={{
          title: 'Pets',
          headerShown: false,
          tabBarIcon:({color})=><Ionicons name="paw" size={30} color={color} />
      }}/>
      
        <Tabs.Screen name= 'posts'options={{
        title: 'Posts',
        headerShown: false,
        tabBarIcon:({color})=><Ionicons name="home" size={24} color={color} /> 
    }}/>
       
      </Tabs>
    
  )
}