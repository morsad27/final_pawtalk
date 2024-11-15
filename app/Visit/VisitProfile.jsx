
import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Avatar from '../../components/Avatar';

const VisitProfile = () => {
  const item = useLocalSearchParams();
  return (
    <ScreenWrapper bg="white">
      <UserHeader item={item}/>
      
    </ScreenWrapper>
  )
}

const UserHeader = ({item}) => {
  return(
    <View style={{flex: 1, backgroundColor:'white', paddingHorizontal: wp(4)}}>
      <View>
        <Header title = "Profile" showbackButton={true}/>
      </View>

      <View style={styles.container}>
        <View style={{gap: 15}}>
            <Avatar
            uri={item?.image} 
            size={hp(12)}
            rounded={theme.radius.xxl * 1.4}
            />
        </View>
      </View>
    </View>
  )
}

export default VisitProfile;

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  }
})
  