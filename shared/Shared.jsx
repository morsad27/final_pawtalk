import { supabase } from "../lib/supabase";

// Function to get the user's favorites
export const GetFavList = async (user) => {
    if (!user?.email) {
        throw new Error("User email is required.");
    }

    const { data, error } = await supabase
        .from('userfavpet')
        .select('favorites')
        .eq('user_email', user.email);

    if (error) {
        console.error('Error fetching favorites:', error);
        throw new Error('Error fetching favorites: ' + error.message);
    }

    return { favorites: data }; // Return the list of favorite pets
};

// Function to add or remove a favorite pet
export const UpdateFav = async (user, favorites, isAdding) => {
    if (!user?.email) {
        throw new Error("User email is required.");
    }

    if (isAdding) {
        // Add the favorite pet
        const { error } = await supabase
            .from('userfavpet')
            .insert([{ user_email: user.email, favorites: favorites }]);

        if (error) {
            console.error('Error adding favorite:', error);
            throw new Error('Error adding favorite: ' + error.message);
        }
    } else {
        // Remove the favorite pet
        const { error } = await supabase
            .from('userfavpet')
            .delete()
            .eq('user_email', user.email)
            .eq('favorites', favorites);

        if (error) {
            console.error('Error removing favorite:', error);
            throw new Error('Error removing favorite: ' + error.message);
        }
    }

    console.log('Favorite updated successfully');
};

// Export both functions
export default {
    GetFavList,
    UpdateFav
};
