import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { GetUserDetails } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';
import { GiftedChat } from 'react-native-gifted-chat';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur'; 
import CheckBox from 'expo-checkbox';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const [chatDetails, setChatDetails] = useState(null);
  const { user } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [isTermsVisible, setIsTermsVisible] = useState(false); 
  const [isAgreed, setIsAgreed] = useState(false); // Track agreement

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

      const otherUserData = res.data.email1 === currentUserEmail ? {
        email: res.data.email2,
        name: res.data.name2,
        image: res.data.image2
      } : {
        email: res.data.email1,
        name: res.data.name1,
        image: res.data.image1
      };

      setOtherUser(otherUserData); // Set other user details
      console.log('Other User Details:', otherUserData);

      navigation.setOptions({
        headerTitle: otherUserData.name, 
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
      .order('created_at', { ascending: false });

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

    const { error } = await supabase
      .from('messages')
      .insert([ 
        { 
          user_id: user.email, 
          chat: newMessage[0].text, 
          chat_id: params.id 
        }
      ]);

    if (error) {
      console.log('Error inserting message:', error.message);
    }
  };

  const toggleTermsVisibility = () => {
    setIsTermsVisible(!isTermsVisible); 
  };

  const handleAgreementChange = (newValue) => {
    setIsAgreed(newValue); // Update isAgreed when checkbox is toggled
    console.log('Is Agreed:', newValue); // Log the value to check if it's updating
  };

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: user?.email,
          name: user?.name,
        }}
      />
      
      {otherUser && (
        <Pressable style={styles.termsContainer} onPress={toggleTermsVisibility}>
          <Text style={styles.termsText}>Terms and Conditions</Text>
        </Pressable>
      )}

      {/* Floating Terms and Conditions with Blur */}
      {isTermsVisible && (
        <BlurView intensity={100} style={styles.blurContainer}>
          <View style={styles.floatingTermsContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.termsHeading}>Temporary Terms and Conditions</Text>
              <Text style={styles.termsSubheading}>Effective Date: [Insert Date]</Text>
              <Text style={styles.termsContent}>
                These Temporary Terms and Conditions ("Terms") govern your use of [insert service name or website] ("Service").
                {/* Add content of the Terms and Conditions here */}
              </Text>
              <View style={styles.checkboxContainer}>
                <CheckBox value={isAgreed} onValueChange={handleAgreementChange} />
                <Text style={styles.checkboxText}>I agree to the Terms and Conditions</Text>
              </View>
              <Pressable 
                style={[styles.continueButton, { opacity: isAgreed ? 1 : 0.5 }]} 
                disabled={!isAgreed}
                onPress={() => {
                  console.log('Continue clicked');
                  // Temporarily go back to the previous screen (Chat screen)
                  navigation.goBack();  // This will navigate back to the previous screen
                }}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </Pressable>
            </ScrollView>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  termsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#007bff', 
    textDecorationLine: 'underline', 
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
  },
  floatingTermsContainer: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    right: '5%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    zIndex: 3,
  },
  modalContent: {
    paddingHorizontal: 10,
  },
  termsHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termsSubheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  termsContent: {
    fontSize: 16,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
  },
  continueButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
