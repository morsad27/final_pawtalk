import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubInfo from '../../components/PetDetails/PetSubInfo';
import AboutPet from '../../components/PetDetails/AboutPet';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { initiateChat } from '../../services/UserChatService';
import { supabase } from '../../lib/supabase';

export default function PetDetails() {
    const pet = useLocalSearchParams();
    const { petid } = useLocalSearchParams();
    const navigation = useNavigation();
    const { user } = useAuth();
    const router = useRouter();
    const [group, setGroup] = useState(null);
    const [adoptStatus, setAdoptStatus] = useState(pet.adoptstatus);

    useEffect(() => {
        const fetchUserGroup = async () => {
            try {
                const { data: authUser, error: authError } = await supabase.auth.getUser();

                if (authError) {
                    console.error('Error fetching authenticated user:', authError);
                    return;
                }

                const userId = authUser.user.id;

                const { data, error } = await supabase
                    .from('users')
                    .select('Group')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Error fetching user group:', error);
                } else {
                    setGroup(data?.Group);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        fetchUserGroup();
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerTransparent: true,
            headerTitle: ''
        });
    }, []);

    const handleAdopted = async () => {
        try {
            const { error } = await supabase
                .from('pets')
                .update({ adoptstatus: 'adopted' })
                .eq('id', pet.id);

            if (error) {
                console.error('Error updating adopt status:', error);
                Alert.alert('Error', 'Failed to update adopt status. Please try again.');
            } else {
                Alert.alert('Success', 'Pet marked as adopted.');
                setAdoptStatus('adopted'); 
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    const handleInitiateChat = async () => {
        const chatId = await initiateChat(user, pet);
        if (chatId) {
            router.push({
                pathname: '/chat',
                params: { id: chatId },
            });
        }
    };

    const handleDeletePet = async () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this pet?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('pets')
                                .delete()
                                .eq('id', pet.id);

                            if (error) {
                                console.error('Error deleting pet:', error);
                                Alert.alert('Error', 'Failed to delete pet. Please try again.');
                            } else {
                                Alert.alert('Success', 'Pet deleted successfully.');
                                router.push('/adopt'); 
                            }
                        } catch (err) {
                            console.error('Unexpected error:', err);
                            Alert.alert('Error', 'An unexpected error occurred.');
                        }
                    },
                },
            ]
        );
    };

    const isOwner = user && pet.email && user.email === pet.email;

    if (group === null) {
        return null; // Show a loading indicator or return null while fetching the group
    }

    return (
        <View>
            <ScrollView>
                {/* Pet info */}
                <PetInfo pet={pet} />
                <Text style={styles.adoptedText}>
                    {adoptStatus === 'adopted' ? ' (Adopted)' : ''}
                </Text>
                {/* Pet properties */}
                <PetSubInfo pet={pet} />
                {/* About */}
                <AboutPet pet={pet} />
                {/* Owner details */}
                <OwnerInfo pet={pet} />

                {/* Delete button - Show only if user is ADMIN */}
                {group === 'ADMIN' && (
                    <View style={styles.deleteContainer}>
                        <TouchableOpacity onPress={handleDeletePet} style={styles.deleteBtn}>
                            <Text style={styles.deleteText}>Delete Pet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAdopted} style={styles.adoptedBtn}>
                            <Text style={styles.markasadopted}>Mark as Adopted</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 70 }}></View>
            </ScrollView>

            {/* Adopt button - Show only if the current user is NOT the owner */}
            {!isOwner && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={handleInitiateChat} style={styles.adoptBtn}>
                        <Text style={styles.adoptText}>Adopt Me</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    adoptBtn: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
    },
    adoptText: {
        textAlign: 'center',
        fontFamily: 'medium',
        fontSize: 20,
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
    },
    deleteContainer: {
        marginTop: 10, // Space between owner info and delete button
        paddingHorizontal: 20,
    },
    deleteBtn: {
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 5,
        marginBottom: 10,
    },
    deleteText: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'medium',
        fontSize: 16,
    },
    adoptedBtn: {
        padding: 12,
        backgroundColor: 'green',
        borderRadius: 5,
        marginTop: 10,
    },
    adoptedText: {
        color: 'black',
        textAlign: 'center',
        fontFamily: 'medium',
        fontSize: 16,
    },
    markasadopted: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'medium',
        fontSize: 16,
    },
});
