import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PetListItem from '../../components/Home/PetListItem';
import Colors from '../../constants/Colors';
import { useLocalSearchParams } from 'expo-router';

export default function UserPost() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [loader, setLoader] = useState(false);

  // Get parameters from route to identify the visited user
  const params = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: ''
    });

    GetUserPost();
  }, []);

  const GetUserPost = async () => {
    setLoader(true);
    try {
      
      const userEmail = params?.email || user?.email;

      if (!userEmail) {
        setLoader(false);
        return;
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('email', userEmail);

      if (error) {
        console.error('Error fetching user posts:', error);
      } else {
        console.log(data);
        setUserPosts(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoader(false);
  };

  const DeletePost = (docId) => {
    Alert.alert('Delete', 'Do you want to delete this post?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Click'),
        style: 'cancel'
      },
      {
        text: 'Delete',
        onPress: () => deletePost(docId)
      }
    ]);
  };

  const deletePost = async (docId) => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', docId);

      if (error) {
        console.error('Error deleting post:', error);
      } else {
        console.log('Post deleted');
        GetUserPost();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 60 }}>
      <FlatList
        refreshing={loader}
        onRefresh={GetUserPost}
        showsVerticalScrollIndicator={false}
        data={userPosts}
        renderItem={({ item, index }) => (
          <View key={index}>
            <PetListItem pet={item} />
            {/* Allow deletion only for logged-in user's posts */}
            {!params?.email && (
              <Pressable onPress={() => DeletePost(item?.id)} style={styles.deleteButton}>
                <Text style={{
                  fontFamily: 'regular',
                  textAlign: 'center',
                  fontSize: 15
                }}>Delete</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          !loader && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: Colors.GRAY }}>
                No pet uploaded
              </Text>
            </View>
          )
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10
  }
});
