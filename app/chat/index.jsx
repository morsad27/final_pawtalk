import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert  } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { GetUserDetails } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';
import { GiftedChat } from 'react-native-gifted-chat';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur'; 
import CheckBox from 'expo-checkbox';
import { Linking } from 'react-native'; 
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { decode } from 'base64-arraybuffer';



export default function ChatScreen() {
  const params = useLocalSearchParams();
  const [chatDetails, setChatDetails] = useState(null);
  const { user } = useAuth();
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [isTermsVisible, setIsTermsVisible] = useState(false); 
  const [isAgreed, setIsAgreed] = useState(false); 
  const [isUploadModalVisible, setUploadModalVisible] = useState(false); 
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [agreementStatus, setAgreementStatus] = useState(null);
  



  useEffect(() => {
    if (params?.id && user?.email) {
      UserChat(params.id, user.email);
    }
  }, [params.id, user.email]);

  const UserChat = async (id, currentUserEmail) => {
    let res = await GetUserDetails(id, currentUserEmail);
    // console.log('Response Data:', res.data);

    if (res.success) {
      setChatDetails(res.data);

      const otherUserData = res.data.email1 === currentUserEmail ? {
        email: res.data.email2,
        name: res.data.name2,
        image: res.data.image2
      } : {
        email: res.data.email1,
        name: res.data.name1,
        image: res.data.image1
      };

      setOtherUser(otherUserData); // Set other user details
      // console.log('Other User Details:', otherUserData);

      navigation.setOptions({
        headerTitle: otherUserData.name, 
      });

      fetchPets(otherUserData.email);
    }
  };



  const fetchPets = async (email) => {
    const { data, error } = await supabase
      .from('pets')
      .select()
      .eq('email', email);

    if (error) {
      console.log('Error fetching pets:', error.message);
    } else {
      // console.log('Pets of other user:', data); 
      setPets(data);
    }
  };

  
  const handleFileUpload = async () => {
    if (!selectedPet) {
      alert('Please select a pet before uploading.');
      return;
    }
    setIsUploading(true); // Start loading
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all file types
        copyToCacheDirectory: true,
      });
  
      console.log('Document Picker Result:', result);
  
      // Check if the file was selected
      if (result.canceled || !result.assets || result.assets.length === 0) {
        alert('File selection failed or no valid file selected.');
        setIsUploading(false); // Stop loading
        return;
      }
  
      // Extract file details from the assets array
      const file = result.assets[0];
      const fileUri = file.uri;
      const fileName = file.name;
      const fileMimeType = file.mimeType;
      const filePath = `adoptdocument/${selectedPet}/${fileName}`;
  
      // Fetch file and get it as a base64 string
      const base64Data = await fetch(fileUri)
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get base64 string
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });
  
      if (!base64Data) {
        throw new Error('Failed to convert file to base64.');
      }
  
      // Decode base64 data to ArrayBuffer
      const arrayBuffer = decode(base64Data);
  
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, arrayBuffer, {
          contentType: fileMimeType, // Set correct MIME type
          upsert: true, // Allow overwriting
        });
  
      if (uploadError) {
        console.error('Supabase Upload Error:', uploadError.message);
        alert(`Failed to upload file: ${uploadError.message}`);
        setIsUploading(false); // Stop loading
        return;
        
      }
  
      console.log('File uploaded successfully:', uploadData);
  
      // Insert file details into the 'documents' table
      const { data: insertData, error: insertError } = await supabase
        .from('documents')
        .insert([
          {
            filepath: filePath,
            userid: user.email,
            otheruserid: otherUser.email, // Assuming otherUser contains the other user's info
            petid: selectedPet,
            chatid: params.id,
          },
        ]);
  
      if (insertError) {
        console.error('Error inserting into documents table:', insertError.message);
        alert(`Failed to save document details: ${insertError.message}`);
        setIsUploading(false); // Stop loading
        return;
      }
  
      console.log('Document details inserted successfully:', insertData);
      Alert.alert('Upload success','Kindly wait for adoption confirmation');
    } catch (error) {
      console.error('Error during file upload:', error.message);
      alert(`Error during file upload: ${error.message}`);
    }finally{
      setIsUploading(false); // Stop loading
    }
  };
  

  const handlePetSelection = (value) => {
    setSelectedPet(value);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .eq('chat_id', params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetching messages:', error.message);
    } else {
      const formattedMessages = data.map((message) => ({
        _id: message.id,
        text: message.chat,
        createdAt: new Date(message.created_at),
        user: {
          _id: message.user_id,
        }
      }));
      setMessages(formattedMessages);
    }
  };

  useEffect(() => {
    fetchMessages();

    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${params.id}` },
        (payload) => {
          const newMessage = {
            _id: payload.new.id,
            text: payload.new.chat,
            createdAt: new Date(payload.new.created_at),
            user: {
              _id: payload.new.user_id,
            }
          };
          setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessage));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [params.id]);

  const onSend = async (newMessage) => {
    setMessages((previousMessage) => GiftedChat.append(previousMessage, newMessage));

    const { error } = await supabase
      .from('messages')
      .insert([ 
        { 
          user_id: user.email, 
          chat: newMessage[0].text, 
          chat_id: params.id 
        }
      ]);

    if (error) {
      console.log('Error inserting message:', error.message);
    }
  };

  const toggleTermsVisibility = () => {
    setIsTermsVisible(!isTermsVisible); 
  };

  const handleAgreementChange = async (newValue) => {
    setIsAgreed(newValue); // Update isAgreed when checkbox is toggled
    
    if (newValue) {
      // Update the 'Agree' column in the users table to true when checkbox is checked
      const { data, error } = await supabase
        .from('users')
        .update({ Agree: true })
        .eq('id', user.id); // Assuming user is logged in and you want to update the logged-in user
  
      if (error) {
        console.error('Error updating Agree column:', error);
      } else {
        console.log('Agreement status updated:', data);
      }
    } else {
      // Optionally, handle case for when checkbox is unchecked, if you want to update the database for that as well
      const { data, error } = await supabase
        .from('users')
        .update({ Agree: null })
        .eq('id', user.id);
  
      if (error) {
        console.error('Error updating Agree column:', error);
      } else {
        console.log('Agreement status updated:', data);
      }
    }
  };

  useEffect(() => {
    const fetchAgreementStatus = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('Agree')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching agreement status:', error);
      } else {
        setAgreementStatus(data?.Agree);
      }
    };

    fetchAgreementStatus();
  }, []);


  
  return (
    <View style={{ flex: 1 }}>
      {agreementStatus === null ? (
        <Text style={styles.agreementText}>Agree to the terms and conditions</Text> // Add styles to make sure it's visible
      ) : (
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
              _id: user?.email,
              name: user?.name,
            }}
            showUserAvatar={false} // Hide the user avatar
            renderAvatar={() => null} // Ensure no avatar is rendered at all
          />

      )}



  
      
      {otherUser && (
        <Pressable style={styles.termsContainer} onPress={toggleTermsVisibility}>
          <Text style={styles.termsText}>Terms and Conditions</Text>
        </Pressable>
      )}
           {/* Upload Button */}
      <Pressable
        style={styles.uploadButton}
        onPress={() => setUploadModalVisible(true)}
      >
        <Text style={styles.uploadButtonText}>Upload</Text>
      </Pressable>

      {/* Upload Modal */}
      <Modal
      animationType="slide"
      transparent={true}
      visible={isUploadModalVisible}
      onRequestClose={() => setUploadModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select the pet and Upload File</Text>
          {pets.length > 0 ? (
            <Picker
              selectedValue={selectedPet}
              onValueChange={handlePetSelection}
              style={styles.picker}
            >
              <Picker.Item label="Select a pet" value={null} />
              {pets.map((pet) => (
                <Picker.Item key={pet.id} label={pet.name} value={pet.id} />
              ))}
            </Picker>
          ) : (
            <Text style={styles.noPetsMessage}>No pets found for this user.</Text>
          )}

          {isUploading ? ( // Show spinner or loading text
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Pressable style={styles.uploadFileButton} onPress={handleFileUpload}>
              <Text style={styles.uploadFileButtonText}>Pick a File</Text>
            </Pressable>
          )}
            {/* {selectedFile && (
              <View style={styles.filePreviewContainer}>
                <Text style={styles.fileName}>File Name: {selectedFile.name}</Text>
                <Pressable
                  style={styles.uploadFileButton}
                  onPress={async () => {
                    if (selectedFile && selectedFile.uri) {
                      await uploadFileToSupabase(selectedFile.uri, selectedPet);
                      setSelectedFile(null); // Clear selected file after upload
                      setUploadModalVisible(false);
                    } else {
                      alert('No file selected for upload.');
                    }
                  }}
                >
                  <Text style={styles.uploadFileButtonText}>Upload File</Text>
                </Pressable>



              </View>
            )} */}

            <TouchableOpacity
            onPress={() => setUploadModalVisible(false)}
            style={styles.closeModalButton}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>


    {/* Floating Terms and Conditions with Blur */}
    {isTermsVisible && (
  <BlurView intensity={100} style={styles.blurContainer}>
    <View style={styles.floatingTermsContainer}>
      <ScrollView style={styles.modalContent}>
        <Text style={styles.termsHeading}>Terms and Conditions</Text>
        
        <Text style={styles.termsSubheading}>1. Certification Requirement</Text>
        <Text style={styles.termsContent}>
           Both parties involved in pet adoption must sign and upload a notarized adoption certification document to finalize the process. 
        </Text>

        <Text style={styles.termsSubheading}>2. Responsibility</Text>
        <Text style={styles.termsContent}>
        The adopter assumes full responsibility for the care, well-being, and humane treatment of the adopted pet.
        </Text>

        <Text style={styles.termsSubheading}>3. Return Policy</Text>
        <Text style={styles.termsContent}>
           If unable to care for the pet, the adopter must contact the previous owner or authorized parties.
        </Text>

        <Text style={styles.termsSubheading}>4. Fraud Prevention</Text>
        <Text style={styles.termsContent}>
        Misrepresentation in the adoption process is strictly prohibited and may lead to account suspension or legal action.
        </Text>
        
        <Text style={styles.termsSubheading}>Contact Information</Text>
        <Text style={styles.termsContent}>
          For questions or concerns about these terms, please contact us at:{"\n"}
          Email: support@pawtalkapp.com{"\n"}
          
        </Text>


        {/* Downloadable file */}
        <Pressable
          onPress={() => Linking.openURL('https://zzaneglbcaviidinehsa.supabase.co/storage/v1/object/public/uploads/adoptdocument/Adoption-Agreement-PDF.pdf')}
          style={styles.downloadLink}>
          <Text style={styles.downloadLinkText}>Download Terms and Conditions</Text>
        </Pressable>

        <View style={styles.checkboxContainer}>
          {agreementStatus === true ? ( // Check if Agree is TRUE
            <Text style={styles.agreedText}>Agreed to the Terms and Conditions</Text> // Display this message if Agree is TRUE
          ) : (
            <>
              <CheckBox value={isAgreed} onValueChange={handleAgreementChange} />
              <Text style={styles.checkboxText}>I agree to the Terms and Conditions</Text>
            </>
          )}
        </View>


        <Pressable
          style={[styles.continueButton, { opacity: isAgreed ? 1 : 0.5 }]}
          disabled={!isAgreed}
          onPress={() => {
            // console.log('Continue clicked');
            navigation.goBack();
          }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </View>
  </BlurView>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  termsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#007bff', 
    textDecorationLine: 'underline', 
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
  },
  floatingTermsContainer: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    right: '5%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
    zIndex: 3,
  },
  modalContent: {
    paddingHorizontal: 10,
  },
  termsHeading: {
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
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
  },
  continueButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
  },
  downloadLink: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  downloadLinkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 16,
    textAlign: 'center',
  },
  uploadButton: {
    position: 'absolute',
    top: 50,
    right: -10,
    backgroundColor: '#007bff',
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderRadius: 99,
    zIndex: 10,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 50, 
    marginBottom: 20,
  },
  pickerItem: {
    fontSize: 18,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputField: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  uploadFileButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  uploadFileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 20,
  },
  closeModalText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  
  noPetsMessage: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  filePreviewContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileUri: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  agreementText: {
    fontSize: 18,
    color: 'black',  // Ensure the text color is visible
    textAlign: 'center', // Center align the text
    marginTop: 650, // Add some spacing at the top for better visibility
  },
  agreedText: {
    fontSize: 16,
    color: 'green',  // Optional: change color for better visibility
    marginLeft: 10,
  },
  
  
});
