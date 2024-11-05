import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';
import {useRouter} from 'expo-router';
import { getSupabaseFileUrl } from '../../services/imageService';
import MarkFav from '../MarkFav';

export default function PetListItem({ pet }) {
  const router = useRouter();
  return (
    <TouchableOpacity
    onPress={()=>router.push({
      pathname:'/pet-details',
      params:pet
    })}
      style={{
        padding: 10,
        marginHorizontal: 10,  
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        marginTop: 20
      }}
    >
      <View style={{
        position:'absolute',
        zIndex:10,
        right: 10,
        top: 10
      }}>
        
      </View>

      <Image
            source={getSupabaseFileUrl(pet?.file)}
        style={{
          width: 285,
          height: 285,
          borderRadius: 10,
          resizeMode: 'cover', 
        }}
      />
      <Text
        style={{
          fontFamily: 'medium',
          fontSize: 18,
          marginVertical: 8, 
        }}
      >
        {pet?.name}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: Colors.GRAY,
            fontFamily: 'regular',
          }}
        >
          {pet?.breed}
        </Text>
        <Text
          style={{
            fontFamily: 'regular',
            color: Colors.PRIMARY,
            paddingHorizontal: 7,
            borderRadius: 10,
            fontSize: 14,
            backgroundColor: Colors.LIGHT_PRIMARY,
          }}
        >
          {pet?.age}YRS
        </Text>
      </View>
    </TouchableOpacity>
  );
}
