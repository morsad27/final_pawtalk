import { LogBox, StyleSheet } from 'react-native';
import React, { useEffect } from 'react'; 
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/userService';
import { useFonts } from "expo-font";

LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']);

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useFonts({
    'regular': require('./../assets/fonts/LTSaeada-Regular.otf'),
    'medium': require('./../assets/fonts/LTSaeada-Medium.otf'),
    'bold': require('./../assets/fonts/LTSaeada-Bold.otf'),
  });

  useEffect(() => {
    // Call onAuthStateChange and get the subscription object or function
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session.user);
        updatedUserData(session.user, session.user.email);
        router.replace('/(tabs)/home'); // Move to home screen
      } else {
        setAuth(null);
        router.replace('/welcome'); // Move to welcome screen
      }
    });
  
    // Cleanup the subscription on unmount
    return () => {
      if (typeof subscription === 'function') {
        subscription(); // Directly call if it's a function
      } else if (subscription?.unsubscribe) {
        subscription.unsubscribe(); // Otherwise, call unsubscribe if it exists
      }
    };
  }, []);
  
  const updatedUserData = async (user, email) => {
    let res = await getUserData(user.id);
    if (res.success) setUserData({ ...res.data, email });
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header by default
      }}
    >
      <Stack.Screen
        name="chat/index" // Reference to chat screen
        options={{
          headerShown: true, // Show header on ChatScreen
        }}
      />
      <Stack.Screen
        name="pet-details/index" // Reference to pet-details screen
        options={{
          headerShown: true, // Show header on PetDetails
        }}
      />
       <Stack.Screen
        name="user-post/index" // Reference to pet-details screen
        options={{
          headerShown: true, // Show header on PetDetails
        }}
      />
      {/* Include other screens as needed */}
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
