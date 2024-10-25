import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Pressable, ToastAndroid, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Colors from '../../constants/Colors';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { fetchCategory, InsertPet } from '../../services/postService'; 
import { uploadFile } from '../../services/imageService';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../components/Avatar';

export default function AddNewPet() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({ category: 'Dogs', sex: 'Male' });
    const [gender, setGender] = useState();
    const [categoryList, setcategoryList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState();
    const [image, setImage] = useState(null); 
    const { user, setAuth } = useAuth();
    const [loader, setLoader]=useState(false);
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({ headerTitle: 'Add New Pet' });
        getCategory();
    }, []);

    const getCategory = async () => {
        setcategoryList([]);
        let res = await fetchCategory();
      //  console.log('got category result:', res);
        if (res.success) {
            setcategoryList(res.data);
        }
    };

    // Function to pick an image
    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

      //  console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri); 
        }
    };

    const handleInputChange = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }));
    };

    const onsubmit = async () => {
        setLoader(true);
       
        const completeData = {
            ...formData,
            username: user.name,
            email: user.email,
            userImage: user.image
        };
    
        
        if (!completeData.name || !completeData.category || !completeData.breed ||
            !completeData.age || !completeData.sex || !completeData.weight ||
            !completeData.address || !completeData.about) { 
            ToastAndroid.show('Enter all Details', ToastAndroid.SHORT);
            return;
        }
    
       
        if (typeof image === 'string') {
            let imageRes = await uploadFile('pets', image, true);
            if (imageRes.success) {
                completeData.file = imageRes.data; 
            } else {
                completeData.file = null; 
            }
        }
    
        // Call InsertPet function
        const result = await InsertPet(completeData);
    
        if (result.success) {
            ToastAndroid.show('Pet added successfully!', ToastAndroid.SHORT);
        } else {
            ToastAndroid.show(`Error: ${result.msg}`, ToastAndroid.SHORT);
        }
        setLoader(false);
        router.replace('/(tabs)/adopt')
    };
    
    return (
        <ScrollView style={{ padding: 20, marginTop: 20 }}>
            <Text style={{ fontFamily: 'medium', fontSize: 20 }}>Add new pet for adoption</Text>

            <Pressable onPress={imagePicker}>
                {!image ? (
                    <Image source={require('./../../assets/images/placeholder.png')}
                        style={{ width: 100, height: 100, borderRadius: 15, borderWidth: 1, borderColor: Colors.GRAY }} />
                ) : (
                    <Image source={{ uri: image }}
                        style={{ width: 100, height: 100, borderRadius: 15, borderWidth: 1, borderColor: Colors.GRAY }} />
                )}
            </Pressable>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Pet Name*</Text>
                <TextInput style={styles.input}
                    onChangeText={(value) => handleInputChange('name', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Pet Category*</Text>
                <Picker
                    selectedValue={selectedCategory}
                    style={styles.input}
                    onValueChange={(itemValue, itemIndex) => {
                        setSelectedCategory(itemValue);
                        handleInputChange('category', itemValue);
                    }}>
                    {categoryList.map((category, index) => (
                        <Picker.Item key={index} label={category.name} value={category.name} />
                    ))}
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Breed*</Text>
                <TextInput style={styles.input}
                    onChangeText={(value) => handleInputChange('breed', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Age*</Text>
                <TextInput style={styles.input}
                    keyboardType='numeric'
                    onChangeText={(value) => handleInputChange('age', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Gender*</Text>
                <Picker
                    selectedValue={gender}
                    style={styles.input}
                    onValueChange={(itemValue, itemIndex) => {
                        setGender(itemValue);
                        handleInputChange('sex', itemValue);
                    }}>
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Weight*</Text>
                <TextInput style={styles.input}
                    keyboardType='numeric'
                    onChangeText={(value) => handleInputChange('weight', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Address*</Text>
                <TextInput style={styles.input}
                    onChangeText={(value) => handleInputChange('address', value)} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>About*</Text>
                <TextInput style={styles.input}
                    numberOfLines={5}
                    multiline={true}
                    onChangeText={(value) => handleInputChange('about', value)} />
            </View>

            <TouchableOpacity 
            style={styles.button}
            disabled={loader}
             onPress={onsubmit}>
                {loader?<ActivityIndicator size={'large'}/>:
                <Text style={{ fontFamily: 'medium', textAlign: 'center' }}>Submit</Text> }
                
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 5
    },
    input: {
        padding: 10,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        fontFamily: 'regular'
    },
    label: {
        marginVertical: 5,
        fontFamily: 'regular'
    },
    button: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 7,
        marginVertical: 10,
        marginBottom: 50,
    }
});
