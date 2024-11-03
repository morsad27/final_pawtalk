import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { GetUserDetails } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';
import { GiftedChat } from 'react-native-gifted-chat';
import { supabase } from '../../lib/supabase';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const [chatDetails, setChatDetails] = useState(null);
  const { user } = useAuth();   
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);

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

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .eq('chat_id', params.id)
      .order('created_at', { ascending: false }); // Assuming you have a timestamp column 'created_at'

    if (error) {
      console.log('Error fetching messages:', error.message);
    } else {
      const formattedMessages = data.map((message) => ({
        _id: message.id,
        text: message.chat,
        createdAt: new Date(message.created_at),
        user: {
          _id: message.user_id,
        }
      }));
      setMessages(formattedMessages);
    }
  };

  useEffect(() => {
    fetchMessages();

    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${params.id}` },
        (payload) => {
          const newMessage = {
            _id: payload.new.id,
            text: payload.new.chat,
            createdAt: new Date(payload.new.created_at),
            user: {
              _id: payload.new.user_id,
            }
          };
          setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessage));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [params.id]);

  const onSend = async (newMessage) => {
    setMessages((previousMessage) => GiftedChat.append(previousMessage, newMessage));
    
    // Insert new message into the Supabase messages table
    const { error } = await supabase
      .from('messages')
      .insert([
        { 
          user_id: user.email, // Assuming you're using email as user_id
          chat: newMessage[0].text, // Adjust based on your message structure
          chat_id: params.id // This assumes you're passing chat_id as params
        }
      ]);

    if (error) {
      console.log('Error inserting message:', error.message);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      // showUserAvatar={true}
      user={{
        _id: user?.email,
        name: user?.name,
        // avatar: user?.image
      }}
    />
  );
}
