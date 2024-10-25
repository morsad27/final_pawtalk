import { View, Text, Pressable } from 'react-native';
import React, { useState } from 'react';
import Colors from '../../constants/Colors';

export default function AboutPet({ pet }) {
  const [readMore, setReadMore] = useState(true);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{
        fontFamily: 'medium',
        fontSize: 20
      }}>
        About {pet?.name}
      </Text>
      
      <Text numberOfLines={readMore ? 3 : undefined} style={{
        fontFamily: 'regular',
        fontSize: 14
      }}>
        {pet?.about}
      </Text>
      
      <Pressable onPress={() => setReadMore(!readMore)}>
        <Text style={{
          fontFamily: 'medium',
          fontSize: 14,
          color: Colors.SECONDARY
        }}>
          {readMore ? 'Read More' : 'Read Less'}
        </Text>
      </Pressable>
    </View>
  );
}
