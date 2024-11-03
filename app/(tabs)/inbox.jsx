import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import UserItem from '../../components/Inbox/UserItem';

export default function Inbox() {
  const [chatList, setChatList] = useState([]);
  const { user } = useAuth();
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (user) {
      GetUserList();
    }
  }, [user]);

  const GetUserList = async () => {
    setLoader(true); 
    try {
      console.log('Fetching chats for user:', user.email);
  
      // Fetch chats where the user is either `email1` or `email2`
      const { data, error } = await supabase
        .from('chat')
        .select('*')
        .or(`email1.eq.${user.email},email2.eq.${user.email}`);
  
      if (error) {
        console.error('Error fetching chat list:', error);
        return;
      }
  
      console.log('Raw data from Supabase:', data);
  
      if (data) {
        const supabaseUrl = 'https://zzaneglbcaviidinehsa.supabase.co';
        const bucketName = 'uploads'; 
  
        // Map through the chats to find the other user
        const formattedList = data.map(record => {
          const isUser1 = record.email1 === user.email;
  
         
          const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${isUser1 ? record.image2 : record.image1}`;
          
          // console.log('Image URL:', imageUrl); // Log the image URL
  
          return {
            docId: record.id,
            otherUserEmail: isUser1 ? record.email2 : record.email1,
            otherUserName: isUser1 ? record.name2 : record.name1,
            imageUrl: imageUrl 
          };
        });
  
        setChatList(formattedList);
        console.log('Formatted chat list:', formattedList);
      }
    } catch (error) {
      console.error('Error retrieving chats:', error);
    } finally {
      setLoader(false); 
    }
  };

  const handleRefresh = () => {
    GetUserList(); 
  };

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'medium', fontSize: 30 }}>Inbox</Text>

      {/* Display the chat list using FlatList */}
      <FlatList
        data={chatList}
        style={{
          marginTop: 20
        }}
        keyExtractor={item => item.docId} 
        renderItem={({ item }) => (
          <UserItem userInfo={item} />
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>
            No chats available.
          </Text>
        )}
        refreshing={loader} 
        onRefresh={handleRefresh} 
        ListFooterComponent={loader ? <ActivityIndicator size="large" color="#0000ff" /> : null} 
      />
    </View>
  );
}
