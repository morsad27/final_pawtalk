import { View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from '../assets/icons';
import { hp } from '../helpers/common';
import { theme } from '../constants/theme';
import Shared from '../shared/Shared';
import { useAuth } from '../contexts/AuthContext';

export default function MarkFav({ pet, color = 'black' }) {
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false); 

    useEffect(() => {
        if (user) {
            CheckIfFavorited(); 
        }
    }, [user]);

    const CheckIfFavorited = async () => {
        const result = await Shared.GetFavList(user);
        const favorites = result?.favorites || [];
        
        const favorited = favorites.some(fav => fav.favorites === pet.id); 
        setIsFavorited(favorited);
    };

    const AddToFav = async () => {
        await Shared.UpdateFav(user, pet.id, true); // Add the favorite
        setIsFavorited(true); 
    };

    const removeFromFav = async () => {
        await Shared.UpdateFav(user, pet.id, false); // Remove the favorite
        setIsFavorited(false); 
    };

    return (
        <View>
            {isFavorited ? (
                <Pressable onPress={removeFromFav}>
                    <Icon 
                        name='heart' 
                        size={hp(4)} 
                        fill={theme.colors.rose} 
                        color="transparent" 
                    />
                </Pressable>
            ) : (
                <Pressable onPress={AddToFav}>
                    <Icon name="heart" size={hp(4)} strokeWidth={2} color={color} />
                </Pressable>
            )}
        </View>
    );
}
