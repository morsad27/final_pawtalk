import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../Avatar';
import { hp } from '../../helpers/common';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase'; // Adjust according to where you initialize supabase

const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const updateAgreementStatus = async () => {
      if (user) {
        // Fetch the current status
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('signinagreement')
          .eq('id', user.id)
          .single(); // Fetch a single user

        if (fetchError) {
          console.error('Failed to fetch user status:', fetchError.message);
          return;
        }

        // Check if the status is null and update it to 'agree'
        if (data.signinagreement === null) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ signinagreement: 'agree' })
            .eq('id', user.id); // Ensure you're updating the correct user

          if (updateError) {
            console.error('Failed to update user terms agreement status:', updateError.message);
          }
        }
      }
    };

    updateAgreementStatus();
  }, [user]); // Run this effect when `user` changes

  return (
    <View style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <View>
        <Text style={{
          fontFamily: 'regular',
          fontSize: 17
        }}>Welcome,</Text>
        <Text style={{
          fontFamily: 'medium',
          fontSize: 25
        }}>{user && user.name}</Text>
      </View>
      <Pressable onPress={() => router.push('profile')}>
        <Avatar
          uri={user?.image}
          style={{
            width: 40,
            height: 40
          }}
        />
      </Pressable>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({})
