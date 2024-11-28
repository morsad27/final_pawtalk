import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { wp, hp } from '../helpers/common';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../assets/icons';
import { supabase } from '../lib/supabase';
import { theme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Manage password visibility
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter OTP & password
  const [loading, setLoading] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState({}); // Track OTP attempts
  const router = useRouter();

  useEffect(() => {
    // Load OTP attempts from AsyncStorage
    const loadOtpAttempts = async () => {
      try {
        const storedAttempts = await AsyncStorage.getItem('otpAttempts');
        if (storedAttempts) {
          setOtpAttempts(JSON.parse(storedAttempts));
        }
      } catch (error) {
        console.error('Failed to load OTP attempts:', error);
      }
    };

    loadOtpAttempts();

    // Reset OTP attempts at midnight
    const resetOtpAttempts = async () => {
      await AsyncStorage.setItem('otpAttempts', JSON.stringify({}));
      setOtpAttempts({});
    };

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeout = midnight.getTime() - Date.now();
    const timer = setTimeout(resetOtpAttempts, timeout);

    return () => clearTimeout(timer);
  }, []);



  const handleSendMagicLink = async () => {
    const emailKey = email.trim();

    if (!emailKey) {
      Alert.alert('Error', 'Please enter a valid email.');
      return;
    }

    // Check OTP attempts for the current email
    if (otpAttempts[emailKey] && otpAttempts[emailKey] >= 3) {
      Alert.alert('Limit Reached', 'You can request an OTP only 3 times per day.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({ email: emailKey });
      setLoading(false);

      if (error) throw error;

      // Update OTP attempts and save to AsyncStorage
      const updatedAttempts = {
        ...otpAttempts,
        [emailKey]: (otpAttempts[emailKey] || 0) + 1,
      };
      setOtpAttempts(updatedAttempts);
      await AsyncStorage.setItem('otpAttempts', JSON.stringify(updatedAttempts));

      Alert.alert('Success', 'Check your email and follow our instructions.');
      setStep(2);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

   const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

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
      Alert.alert('Success', 'You can now login to your account.');
      router.replace('/login');
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      router.back();
    }
  };

  
  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
              <Icon
                name={showPassword ? "open" : "off"}
                size={25}
                color={theme.colors.gray}
              />
            </Pressable>
          </View>
          <View>
            <Input
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              placeholder="Confirm new password"
              secureTextEntry={!showPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
              <Icon
                name={showPassword ? "open" : "off"}
                size={25}
                color={theme.colors.gray}
              />
            </Pressable>
          </View>
          <Button title="Reset Password" loading={loading} onPress={handleResetPassword} />
        </View>
      )}
    </ScrollView>
  </KeyboardAvoidingView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(30),
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
    zIndex: 10,
  },
  header: {
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.dark,
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  form: {
    gap: 25,
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
});
