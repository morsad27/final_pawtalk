import { Alert, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import Input from '../components/Input';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import Icon from '../assets/icons';

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', "Please fill all the fields!");
      return;
    }
  
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);
  
    // Step 1: Sign in the user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    setLoading(false);
  
    if (loginError) {
      Alert.alert('Login', loginError.message);
      return;
    }
  
    // Step 2: Fetch the logged-in user's information from auth.users
    const { data: authUser, error: authError } = await supabase.auth.getUser();
  
    if (authError || !authUser) {
      Alert.alert('Error', 'Failed to retrieve user information. Please try again.');
      return;
    }
  
    const userId = authUser.user.id; // Get the user's unique ID
  
    // Step 3: Fetch the user's group from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('Group')
      .eq('id', userId) // Match based on the user's ID from auth.users
      .single();
  
    if (userError || !userData) {
      Alert.alert('Error', 'Failed to fetch user group. Please try again.');
      return;
    }
  
      router.push('/(tabs)/home'); // Navigate to general user dashboard or any default page
    
  };
  
  
  return (
    <ScreenWrapper bg="white">
      <StatusBar style='dark' />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please login to continue
          </Text>
          
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={value => emailRef.current = value}
          />
          
          <View style={styles.passwordContainer}>
            <Input
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              placeholder="Enter your password"
              secureTextEntry={!showPassword} // Show/hide password based on state
              onChangeText={value => passwordRef.current = value}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
              <Icon
                name={showPassword ? "open" : "off"} // Change icon based on visibility
                size={25}
                color={theme.colors.gray}
              />
            </Pressable>

          </View>
          
          <Pressable onPress={() => router.push('/ForgotPass')}>
            <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}>
              Forgot Password?
            </Text>
          </Pressable>

          

          {/* Login button */}
          <Button title={'Login'} loading={loading} onPress={onSubmit} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.push('signUp')}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  passwordContainer: {
    position: 'relative', // Position to allow absolute icon positioning
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  forgotPassword: {
    textAlign: 'center',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
