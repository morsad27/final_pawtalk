import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext'; // Using your existing useAuth hook
import { uploadFile } from '../../services/imageService'; // Existing upload service
import Colors from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase'; // Import Supabase client
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for icon

export default function UploadVerificationDocs() {
  const { user } = useAuth(); // Access user data
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Function to pick image from library
  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      cameraType: ImagePicker.CameraType.back, // Use the front camera
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to capture selfie using the front camera
  const captureSelfie = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      ToastAndroid.show('Camera permission is required!', ToastAndroid.SHORT);
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      cameraType: ImagePicker.CameraType.front, // Use the front camera
    });

    if (!result.canceled) {
      setSelfieImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!idImage || !selfieImage) {
      ToastAndroid.show('Both ID and Selfie are required.', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);

    try {
      // Upload ID image
      const idUploadResult = await uploadFile(`user-docs/${user.name}`, idImage, true);
      if (!idUploadResult.success) throw new Error('Failed to upload ID image.');

      // Upload Selfie image
      const selfieUploadResult = await uploadFile(`user-docs/${user.name}`, selfieImage, true);
      if (!selfieUploadResult.success) throw new Error('Failed to upload selfie.');

      // Prepare database record for verification
      const verificationData = {
        user_id: user.id, // Use authenticated user's ID
        user_name: user.name,
        id_image_url: idUploadResult.data, // URL for ID image
        selfie_image_url: selfieUploadResult.data, // URL for Selfie image
        status: 'pending', // Set default status for verification
      };

      // Insert record into the verification_requests table (via Supabase)
      const { data, error } = await supabase
        .from('verification_requests') // Replace with your table name
        .insert(verificationData);

      if (error) {
        console.error('Database Insert Error:', error.message);
        throw new Error('Failed to save verification data.');
      }

      // Update the user's verification status in the users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: 'pending' }) // Update verification status
        .eq('id', user.id); // Ensure you're updating the correct user

      if (updateError) {
        console.error('Failed to update user verification status:', updateError.message);
        throw new Error('Failed to update user verification status.');
      }

      ToastAndroid.show('Documents uploaded and verification status set to pending!', ToastAndroid.SHORT);
      ToastAndroid.show('Please reload the app', ToastAndroid.SHORT);

      // Fetch the updated user data to reflect the new status
      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('status') // Select the status field
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated user data:', fetchError.message);
        throw new Error('Failed to fetch updated user data.');
      }

      // Update the local user context with the new status if needed
      // Assuming useAuth context provides a way to set user data
      user.status = updatedUser.status;

      // Navigate to the Profile screen after successful upload and status update
      navigation.navigate('Profile'); // Replace 'Profile' with your actual profile screen name

    } catch (error) {
      ToastAndroid.show(error.message || 'An error occurred.', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={Colors.PRIMARY} />
      </TouchableOpacity>

      <Text style={styles.title}>Upload Verification Documents</Text>

      {/* ID Upload Section */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => pickImage(setIdImage)}
        >
          {idImage ? (
            <Image source={{ uri: idImage }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholderText}>Upload ID Image</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.checkText}>Check photo</Text>
        <Text style={styles.instructionText}>- Can you read the details?</Text>
        <Text style={styles.instructionText}>- Is the photo clear?</Text>
      </View>

      {/* Selfie Capture Section */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={captureSelfie}
        >
          {selfieImage ? (
            <Image source={{ uri: selfieImage }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholderText}>Capture Selfie</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.instructionText}>Ensure that your face is clearly visible.</Text>
        <Text style={styles.instructionText}>Please wait for 5-10 minutes for the verification process. Please reload the application.</Text>
      </View>

      {/* Upload Button */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.buttonText}>Verify Account</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: 20,
    justifyContent: 'center', // This will center the button vertically
  },
  title: {
    marginTop: 25,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  imagePicker: {
    width: 200,
    height: 200,
    backgroundColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.GRAY,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholderText: {
    color: Colors.GRAY,
    fontSize: 16,
    textAlign: 'center',
  },
  checkText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 10,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'left',
    marginTop: 5,
  },
  uploadButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center', // Centers the button horizontally
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    justifyContent: 'center',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
});