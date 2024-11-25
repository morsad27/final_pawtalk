import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { getSupabaseFileUrl } from '../../services/imageService';

export default function PetListItem({ pet }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/pet-details',
        params: pet,
      })}
      style={{
        padding: 10,
        marginHorizontal: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        marginTop: 20,
      }}
    >
      <View style={{
        position: 'absolute',
        zIndex: 10,
        right: 10,
        top: 10,
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
        <Text
          style={{
            fontFamily: 'medium',
            fontSize: 18,
          }}
        >
          {pet?.name}
        </Text>
        {pet?.adoptstatus === 'adopted' && (
          <Text style={{
            fontFamily: 'medium',
            fontSize: 14,
            color: 'green',
            marginLeft: 10, 
          }}>
            Adopted
          </Text>
        )}
      </View>
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
