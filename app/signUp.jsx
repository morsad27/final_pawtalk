import { Alert, Modal, Pressable, StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import Icon from '../assets/icons';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import Input from '../components/Input';
import Button from '../components/Button';
import CheckBox from 'expo-checkbox';
import { supabase } from '../lib/supabase';

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [isAgreed, setIsAgreed] = useState(false); // State for agreement checkbox
  const [isTermsVisible, setIsTermsVisible] = useState(false); // State to control Terms and Conditions modal visibility

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !isAgreed) {
      Alert.alert('Sign Up', "Please fill all the fields and agree to the terms!");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Sign Up', error.message);
    }
  };

  // Toggle the visibility of the Terms and Conditions modal
  const toggleTermsVisibility = () => {
    setIsTermsVisible(!isTermsVisible);
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style='dark' />
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.button}>
          <Icon name="arrowLeft" strokeWidth={2.5} size={26} color={theme.colors.text} />
        </Pressable>

        {/* Welcome */}
        <View>
          <Text style={styles.welcomeText}>Let's,</Text>
          <Text style={styles.welcomeText}>Get Started!</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please enter the details to create an account
          </Text>

          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            onChangeText={value => nameRef.current = value}
          />

          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={value => emailRef.current = value}
          />

          <View style={styles.passwordContainer}>
            <Input
              icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
              placeholder="Enter your password"
              secureTextEntry={!showPassword} // Toggle based on showPassword state
              onChangeText={value => passwordRef.current = value}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
              <Icon
                name={showPassword ? "open" : "off"} // Icon changes based on showPassword
                size={25}
                color={theme.colors.gray}
              />
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/ResetPassword')}>
            <Text style={[styles.loginText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Forgot Password?
            </Text>
          </Pressable>

          {/* Terms and Conditions */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isAgreed}
              onValueChange={setIsAgreed}
              style={styles.checkbox}
            />
            <Pressable style={{ display: 'flex', flexDirection: 'row'}} onPress={toggleTermsVisibility}>
              <Text style={{fontWeight: theme.fonts.bold, fontSize: 16}}>I agree to </Text>
              <Text style={styles.checkboxText}>Terms and Conditions</Text>
            </Pressable>
          </View>

          {/* Sign Up Button */}
          {isAgreed && (
            <Button title={'Sign Up'} loading={loading} onPress={onSubmit} />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push('login')}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Login
            </Text>
          </Pressable>
        </View>

        {/* Terms and Conditions Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isTermsVisible}
          onRequestClose={toggleTermsVisibility}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              
              <ScrollView style={styles.scrollView}>
                <Text style={styles.termsContent}>
                  {/* Your Terms and Conditions content here */}
                  
                  <Text style={styles.termsSubheading}>1. Acceptance of Terms{"\n"}</Text>
                  By using PawTalk, you confirm that you are at least 
                    18 years old or have the permission of a legal guardian. Continued use of the app constitutes agreement to these terms. 
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>2. Account Registration{"\n"}</Text>
                  You are responsible for providing accurate and truthful information when registering.{"\n"}  
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>3. Security{"\n"}</Text>
                  Protect your account login credentials. You are solely responsible for activities under your account.{"\n"}  
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>4. Appropriate Use{"\n"}</Text>
                  Use the app for its intended purposes. Do not engage in illegal, abusive, or harmful behavior on the platform.{"\n"}  
                  {"\n"}{"\n"}  
                  <Text style={styles.termsSubheading}>5. Content and Community Guidelines{"\n"}</Text>
                  -Language Filtering: To maintain a respectful community, the app uses a language filtering algorithm to monitor and restrict harmful or inappropriate content.{"\n"}  
                  -Ownership of Content: You retain ownership of any content you post but grant PawTalk the right to use, display, or distribute it for promotional or operational purposes.{"\n"}  
                  -Prohibited Content: Do not post content that is offensive, defamatory, harmful, or violates copyright laws.{"\n"}  
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>6. Privacy Policy{"\n"}</Text>
                  Your privacy is important to us. PawTalk collects and uses your data as outlined in our [Privacy Policy]. By using the app, you consent to data collection and usage in compliance with applicable laws.{"\n"}  
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>7. Limitations of Liability{"\n"}</Text>
                  - PawTalk is not responsible for disputes or issues arising between users, including pet ownership conflicts.{"\n"}  
                  - We do not guarantee uninterrupted access or the absence of errors in the app.{"\n"}  
                  - To the extent permitted by law, PawTalk disclaims liability for damages resulting from the use or inability to use the app.{"\n"}  
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>8. Termination of Use{"\n"}</Text>
                  PawTalk reserves the right to suspend or terminate your account if you violate these terms or engage in behavior detrimental to the community.{"\n"}
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>9. Updates and Modifications{"\n"}</Text>
                  We may update these terms periodically. Continued use of the app after changes constitutes acceptance of the revised terms.{"\n"} 
                  {"\n"}{"\n"}
                  <Text style={styles.termsSubheading}>Contact Information{"\n"}</Text>
                  For questions or concerns about these terms, please contact us at:{"\n"}  
                  Email: support@pawtalkapp.com
                  {"\n"}
                  {/* Add more sections of your terms here */}
                </Text>
              </ScrollView>

              {/* Close button */}
              <Pressable style={styles.closeButton} onPress={toggleTermsVisibility}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  checkbox: {
    marginRight: 10,
    height: 24,
    width: 24,
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: theme.fonts.bold,
    color: theme.colors.primaryDark,
  },
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
    position: 'relative', // Position container for absolute icon
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
  },
  forgotPassword: {
    textAlign: 'right',
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
  button: {
    alignSelf: 'flex-start',
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termsSubheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  termsContent: {
    fontSize: 16,
    paddingHorizontal: 10,
    color: '#333',
  },
  scrollView: {
    marginBottom: 20,
  },
  termsContent: {
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
