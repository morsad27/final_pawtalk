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

export default function UploadVerificationDocs() {
  const { user } = useAuth(); // Access user data
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Function to pick image from library
  const pickImage = async (setImage) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
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
      const idUploadResult = await uploadFile('user-docs', idImage, true);
      if (!idUploadResult.success) throw new Error('Failed to upload ID image.');

      // Upload Selfie image
      const selfieUploadResult = await uploadFile('user-docs', selfieImage, true);
      if (!selfieUploadResult.success) throw new Error('Failed to upload selfie.');

      // Prepare database record
      const verificationData = {
        user_id: user.id, // Use authenticated user's ID
        user_name: user.name,
        id_image_url: idUploadResult.data, // URL for ID image
        selfie_image_url: selfieUploadResult.data, // URL for Selfie image
        status: 'pending', // Set default status for verification
      };

      // Insert record into the database (via Supabase)
      const { data, error } = await supabase
        .from('verification_requests') // Replace with your table name
        .insert(verificationData);

      if (error) {
        console.error('Database Insert Error:', error.message);
        throw new Error('Failed to save verification data.');
      }

      ToastAndroid.show('Documents uploaded successfully!', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (error) {
      ToastAndroid.show(error.message || 'An error occurred.', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Verification Documents</Text>

      {/* ID Upload Section */}
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

      {/* Selfie Capture Section */}
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

      {/* Upload Button */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.buttonText}>Verify Account</Text>
        </TouchableOpacity>
      )}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imagePicker: {
    width: 200,
    height: 200,
    backgroundColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholderText: {
    color: Colors.GRAY,
  },
  uploadButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
});
