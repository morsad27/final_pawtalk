import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { getSupabaseFileUrl } from '../../services/imageService'
import Colors from '../../constants/Colors'

export default function OwnerInfo({pet}) {
  return (
    <View style={styles.container}>
      <Image
            source={getSupabaseFileUrl(pet?.userImage)}
        style={{
          width: 50,
          height: 50,
          borderRadius: 99
        }}
      />
      <View>
        <Text style={{
            fontFamily: 'medium',
            fontSize: 17
        }}>{pet?.username}</Text>
        <Text style={{
            fontFamily: 'regular',
            color:Colors.GRAY
        }}>Pet Owner</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({

    container:{
        marginHorizontal: 20,
        paddingHorizontal: 20,
        display:'flex', 
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        borderWidth: 1,
        borderRadius: 15,
        padding: 20,
        backgroundColor: Colors.WHITE,
        
        
    }
})