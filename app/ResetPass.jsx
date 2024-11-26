import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import BackButton from '../components/BackButton';
import { hp, wp } from '../helpers/common';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

const ResetPass = () => {
  const passwordRef = useRef('');
  const confirmPasswordRef = useRef('');
  const [loading, setLoading] = useState(false);

  // Use useEffect to handle password recovery event (triggered after redirect)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Password recovery event triggered
        Alert.alert('Info', 'Please enter your new password to reset it.');
      }
    });

    // Clean up listener on component unmount
    // return () => {
    //   listener?.unsubscribe();
    // };
  }, []);

  const handleUpdatePassword = async () => {
    const password = passwordRef.current;
    const confirmPassword = confirmPasswordRef.current;

    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Password updated successfully!');
        // Optionally navigate back to login or another screen
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={'login'} />

        <View style={styles.textContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.punchLine}>
            Enter your new password below.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            onChangeText={(value) => (confirmPasswordRef.current = value)}
          />
          <Button title="Update Password" loading={loading} onPress={handleUpdatePassword} />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ResetPass;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
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
    marginTop: hp(2),
  },
  form: {
    gap: 25,
  },
  input: {
    height: hp(7.2),
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    paddingHorizontal: 18,
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
});