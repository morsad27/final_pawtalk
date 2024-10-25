import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { GetUserDetails } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';
import { GiftedChat } from 'react-native-gifted-chat'

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const [chatDetails, setChatDetails] = useState(null);
  const { user } = useAuth();   
  const navigation = useNavigation();
  const [messages, setMessages] = useState([])


  useEffect(() => {
    if (params?.id && user?.email) {
      UserChat(params.id, user.email);
    }
  }, [params.id, user.email]);

  const UserChat = async (id, currentUserEmail) => {
    let res = await GetUserDetails(id, currentUserEmail);
    console.log('Response Data:', res.data); 
  
    if (res.success) {
      setChatDetails(res.data);
      
      const otherUser = res.data.email1 === currentUserEmail ? {
        email: res.data.email2,
        name: res.data.name2,
        image: res.data.image2
      } : {
        email: res.data.email1,
        name: res.data.name1,
        image: res.data.image1
      };
  
      console.log('Other User Details:', otherUser); 
  
     
      console.log('Setting header title to:', otherUser.name); 
      navigation.setOptions({
        headerTitle: otherUser.name, 
      });
    } else {
      console.log('Failed to fetch chat details'); 
    }
  };
  
  const onSend=(newMessage)=>{
    setMessages((previousMessage)=>GiftedChat.append(previousMessage,newMessage));

  }
  return (
    <GiftedChat
    messages={messages}
    onSend={messages => onSend(messages)}
    showUserAvatar={true}
    user={{
      _id: user?.email,
      name:user?.name,
      avatar: user?.image
    }}
  />
  );
}
