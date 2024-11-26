import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const VerifyProfileScreen = () => {
    const [idImage, setIdImage] = useState(null);
    const [selfieImage, setSelfieImage] = useState(null);

    const pickImage = async (setter) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setter(result.uri);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Text style={styles.title}>Verify Your Profile</Text>
            <Text style={styles.subtitle}>Upload a valid ID and a selfie to verify your account.</Text>

            {/* ID Placeholder */}
            <TouchableOpacity style={styles.placeholder} onPress={() => pickImage(setIdImage)}>
                {idImage ? (
                    <Image source={{ uri: idImage }} style={styles.image} />
                ) : (
                    <Text style={styles.placeholderText}>Upload ID</Text>
                )}
            </TouchableOpacity>

            {/* Selfie Placeholder */}
            <TouchableOpacity style={styles.placeholder} onPress={() => pickImage(setSelfieImage)}>
                {selfieImage ? (
                    <Image source={{ uri: selfieImage }} style={styles.image} />
                ) : (
                    <Text style={styles.placeholderText}>Take Selfie</Text>
                )}
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Submit for Verification</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    placeholder: {
        width: '80%',
        height: 150,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    placeholderText: {
        color: '#888',
        fontSize: 16,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    button: {
        marginTop: 30,
        width: '80%',
        padding: 15,
        backgroundColor: '#007bff',
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default VerifyProfileScreen;
