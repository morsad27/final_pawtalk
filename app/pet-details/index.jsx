import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubInfo from '../../components/PetDetails/PetSubInfo';
import AboutPet from '../../components/PetDetails/AboutPet';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';
import Colors from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { initiateChat } from '../../services/UserChatService';

export default function PetDetails() {
    const pet = useLocalSearchParams();
    const navigation = useNavigation();
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        navigation.setOptions({
            headerTransparent: true,
            headerTitle: ''
        });
    }, []);

    const handleInitiateChat = async () => {
        const chatId = await initiateChat(user, pet);
        if (chatId) {
            router.push({
                pathname: '/chat',
                params: { id: chatId }, 
            });
        }
    };

    
    const isOwner = user && pet.email && user.email === pet.email;

    return (
        <View>
            <ScrollView>
                {/* Pet info */}
                <PetInfo pet={pet} />
                {/* Pet properties */}
                <PetSubInfo pet={pet} />
                {/* About */}
                <AboutPet pet={pet} />
                {/* Owner details */}
                <OwnerInfo pet={pet} />
                <View style={{ height: 70 }}></View>
            </ScrollView>

            {/* Adopt button - Show only if the current user is NOT the owner */}
            {!isOwner && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={handleInitiateChat} style={styles.adoptBtn}>
                        <Text style={{
                            textAlign: 'center',
                            fontFamily: 'medium',
                            fontSize: 20
                        }}>Adopt Me</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    adoptBtn: {
        padding: 15,
        backgroundColor: Colors.PRIMARY
    },
    bottomContainer: {
        position: 'absolute',
        width: '100%',
        bottom: 0
    }
});
