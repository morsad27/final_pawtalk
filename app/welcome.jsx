import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { wp , hp} from '../helpers/common'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const router = useRouter();
  return (
    <ScreenWrapper bg ="white">
        <StatusBar style="dark"/>
        <View style={styles.container}>
            {/* Welcome Image */}
        <Image
          style={styles.welcomeImage} 
          resizeMode='contain' 
          source={require('../assets/images/front.png')}
        />
         {/* Title and Punchline */}
         <View>
                <Text style={styles.title}>Get Started!</Text>
                  <Text style={styles.punchLine}>
                    "Adopting a pet is not just giving them a home. It's joining a community that believes in love, care, and second chances."
                </Text>
          </View>
        <View style={styles.footer}>
          <Button
          title="Get Started"
          buttonStyle={{marginHorizontal: wp(3)}}
          onPress={()=> router.push('signUp')}
          />
          <View style={styles.bottonTextContainer}>
            <Text style = {styles.loginText}>
              Already have an account!
            </Text>
            <Pressable onPress={()=> router.push('login')}>
              <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight:theme.fonts.semibold}]}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
        
        
        
        </View>
    
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems:'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingHorizontal: wp(4)
  },
  welcomeImage: {
    height: hp(50),
    width: wp(100),
    alignSelf: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold,
  },
  punchLine: {
    textAlign: 'center',
    fontSize: hp(1.7),
    color: theme.colors.text,
    marginTop: hp(2),  // Adjust spacing between title and punchline
  },
  footer:{
    marginTop: hp(10),
    gap:30,
    width: '100%'
  },
  bottonTextContainer:{
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  loginText:{
    textAlign: 'center',
    color:theme.colors.text,
    fontSize: hp(1.6)
  },
  textContainer: {
    padding: 20,
    marginHorizontal: 20,
    backgroundColor: '#f9f9f9', // Light background for contrast
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
    alignItems: 'center',
    justifyContent: 'center',
  },

  
})