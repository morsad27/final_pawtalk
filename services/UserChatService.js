import { router } from "expo-router";
import { supabase } from "../lib/supabase";


export const initiateChat = async (user, pet) => {
    const docId1 = `${user?.email}_${pet?.email}`;
    const docId2 = `${pet?.email}_${user?.email}`;

    // Query to check if chat already exists
    const { data, error } = await supabase
        .from('chat')
        .select('*')
        .in('id', [docId1, docId2]);

    if (error) {
        console.error('Error fetching chat:', error);
        return null; // Return null in case of error
    }

    // Check if no chats exist
    if (data.length === 0) {
        // Insert new chat record
        const { error: insertError } = await supabase
            .from('chat')
            .insert([
                {
                    id: docId1,
                    email1: user?.email,
                    image1: user.image,
                    name1: user.name,
                    email2: pet?.email,
                    image2: pet?.userImage,
                    name2: pet?.username,
                },
            ]);

        if (insertError) {
            console.error('Error inserting chat:', insertError);
            return null; // Return null in case of error
        }
    }

    return docId1; // Return the chat ID
};