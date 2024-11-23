import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';
import Profile from '../(tabs)/profile';
import Inbox from '../(tabs)/inbox';
import Favorite from '../(tabs)/favorite';
import Documents from '../(tabs)/documents';
import Home from '../(tabs)/home';
import Adopt from '../(tabs)/adopt';
const Tab = createBottomTabNavigator();

export default function HomeTabs() {
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const fetchUserGroup = async () => {
      try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Error fetching authenticated user:', authError);
          return;
        }

        const userId = authUser.user.id;

        const { data, error } = await supabase
          .from('users')
          .select('Group')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user group:', error);
        } else {
          setGroup(data?.Group);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchUserGroup();
  }, []);

  if (group === null) {
    return null; // Return a loading indicator or null while fetching group
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Adopt') {
            iconName = 'paw';
          } else if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Documents') {
            iconName = 'document';
          } else if (route.name === 'Favorite') {
            iconName = 'heart';
          } else if (route.name === 'Inbox') {
            iconName = 'chatbox-ellipses';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Hides the header
      })}
    >
      <Tab.Screen name="Adopt" component={Adopt} />
      <Tab.Screen name="Favorite" component={Favorite} />
      {group === 'ADMIN' && (
        <Tab.Screen name="Documents" component={Documents} />
      )}
      {group !== 'ADMIN' && (
        <>
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Inbox" component={Inbox} />
          <Tab.Screen name="Profile" component={Profile} />
        </>
      )}
    </Tab.Navigator>
  );
}
