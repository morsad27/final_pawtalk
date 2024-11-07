import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PetListItem from '../../components/Home/PetListItem'

export default function UserPost() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'User Post'
    });

    if (user) {
      GetUserPost();
    }
  }, [user]);

  const GetUserPost = async () => {
    try {
      const { data, error } = await supabase
        .from('pets') 
        .select('*')
        .eq('email', user?.email); 

      if (error) {
        console.error('Error fetching user posts:', error);
      } else {
        console.log(data); 
        setUserPosts(data); 
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={{
      padding: 20,
    }}>
      <Text style={{
        fontFamily: 'medium',
        fontSize: 25
      }}>User Posts</Text>

      <FlatList
      showsVerticalScrollIndicator={false}
      data={userPosts}
      renderItem={({item,index})=>(
        <PetListItem pet ={item} key ={index}/>
      )}
      
      
      />

    </View>
  );
}
