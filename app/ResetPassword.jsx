import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp } from '../helpers/common';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../assets/icons';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Manage password visibility
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP & password
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendMagicLink = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      setLoading(false);

      if (error) throw error;
      Alert.alert('Success', 'OTP sent to your email.');
      setStep(2);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: 'magiclink',
        email: email.trim(),
        token: otp.trim(),
      });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({ password: password.trim() });
      setLoading(false);

      if (updateError) throw updateError;
      Alert.alert('Success', 'Password reset successfully!');
      router.replace('/login');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrowLeft" strokeWidth={2.5} size={26} color={theme.colors.text} />
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {step === 1 ? 'Enter your email to receive an OTP.' : 'Enter the OTP and set a new password.'}
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.form}>
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={setEmail}
          />
          <Button title="Send OTP" loading={loading} onPress={handleSendMagicLink} />
        </View>
      ) : (
        <View style={styles.form}>
          <Input
            icon={<Icon name="susi" size={26} strokeWidth={1.6} />}
            placeholder="Enter OTP"
            onChangeText={setOtp}
          />
          <View style={styles.passwordContainer}>
            <Input
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              placeholder="Enter new password"
              secureTextEntry={!showPassword} // Toggle visibility
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
              <Icon
                name={showPassword ? "open" : "off"} // Change icon based on visibility
                size={25}
                color={theme.colors.gray}
              />
            </Pressable>
          </View>
          <Button title="Reset Password" loading={loading} onPress={handleResetPassword} />
        </View>
      )}
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  header: {
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.dark,
    marginTop: hp(0.5),
  },
  form: {
    gap: 25,
  },
  passwordContainer: {
    position: 'relative', // Allows absolute positioning for the Pressable
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10,
    top: 15, // Adjust based on your Input height
  },
});
