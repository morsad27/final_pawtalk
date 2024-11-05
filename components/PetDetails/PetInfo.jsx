import { View, Text, Image } from 'react-native'
import React from 'react'
import { getSupabaseFileUrl } from '../../services/imageService'
import Colors from '../../constants/Colors';
import Icon from '../../assets/icons';
import { hp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import MarkFav from '../MarkFav';

export default function PetInfo({pet}) {
  return (
    <View>
      <Image
            source={getSupabaseFileUrl(pet?.file)}
        style={{
          width: '100%',
          height: 400,
          objectFit:'cover'
         
        }}
      />
      <View style={{
        padding: 20,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
      }}>
        <View>
          <Text style={{
            fontFamily: 'bold',
            fontSize:  27
          }}>{pet?.name}</Text>

          <Text style={{
            fontFamily: 'regular',
            fontSize: 16,
            color: Colors.GRAY
          }}>{pet?.address}</Text>
        </View>
        <MarkFav pet={pet}/>
      </View>
    </View>
  )
}