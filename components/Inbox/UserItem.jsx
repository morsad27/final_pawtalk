import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from './../../constants/Colors';
import { useRouter } from 'expo-router';

export default function UserItem({ userInfo }) {
  const router = useRouter();

  const handlePress = () => {
    
    router.push('/chat?id=' + userInfo.docId);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{ width: '100%' }}>
      <View style={{ 
          marginVertical: 7, 
          flexDirection: 'row', 
          alignItems: 'center',
          gap: 10,
        }}>
        <Image
          source={{ uri: userInfo?.imageUrl }} 
          style={{
            width: 40,
            height: 40,
            borderRadius: 20 
          }}
          onError={() => {
            console.log('Image failed to load');
          }}
        />
        <Text style={{ 
          fontFamily: 'medium',
          fontSize: 20,
        }}>
          {userInfo.otherUserName}
        </Text>
      </View>
      <View style={{ borderWidth: 0.2, marginVertical: 7, borderColor: Colors.GRAY }} />
    </TouchableOpacity>
  );
}
