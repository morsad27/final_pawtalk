import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const  createOrUpdatePost = async (post) => {
    try{ 
            //upload ng image dito
        if(post.file && typeof post.file == 'object'){
            let isImage = post?.file?.type == 'image';
            let folderName = isImage? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
            if(fileResult.success) post.file = fileResult.data;
            else{
                return fileResult;
            }
        }

        const {data, error} = await supabase
        .from('posts')
        .upsert(post)
        .select()
        .single();
        
        if(error){
            console.log('createPost error:', error);
            return {success: false, msg: 'Could not create your post'};
        }
        return{success: true, data: data}
    } catch (error) {
        console.log('createPost error:', error);
        return {success: false, msg: 'Could not create your post'};
    }
}

export const  fetchPosts = async (limit=10, userId) => {
    try{ 
      if(userId){
        const {data, error} = await supabase
        .from('posts')
        .select(`
             *,
            user: users (id, name, image),
            postLikes (*),
            comments (count)
         `)
        .order('created_at', {ascending:false})
        .eq('userId', userId)
        .limit(limit);
 
        if(error){
         console.log('fetchPosts error:', error);
         return {success: false, msg: 'Could not fetch the posts'};
        }
 
        return{success: true, data:data};
      }else{
        const {data, error} = await supabase
        .from('posts')
        .select(`
             *,
            user: users (id, name, image),
            postLikes (*),
            comments (count)
         `)
        .order('created_at', {ascending:false})
        .limit(limit);
 
        if(error){
         console.log('fetchPosts error:', error);
         return {success: false, msg: 'Could not fetch the posts'};
        }
 
        return{success: true, data:data};
      }
       
    } catch (error) {
        console.log('fetchPosts error:', error);
        return {success: false, msg: 'Could not fetch the posts'};
    }
}
export const  fetchPostDetails = async (postId) => {
    try{ 
       const {data, error} = await supabase
       .from('posts')
       .select(`
            *,
           user: users (id, name, image),
           postLikes (*),
           comments(*, user: users(id, name, image))
        `)
       .eq('id',postId)
       .order("created_at", {ascending:false, foreignTable: 'comments'})
        .single();

       if(error){
        console.log('fetchpostdetails error:', error);
        return {success: false, msg: 'Could not fetch the posts'};
       }

       return{success: true, data:data};
       
    } catch (error) {
        console.log('fetchpostdetails error:', error);
        return {success: false, msg: 'Could not fetch the posts'};
    }
}
export const  createPostLikes = async (postLike) => {
    try{ 
       const {data,error} = await supabase
       .from ('postLikes')
       .insert(postLike)
       .select()
       .single();
       if(error){
        console.log('postLike error:', error);
        return {success: false, msg: 'Could not like the posts'};
       }

       return{success: true, data:data};
       
    } catch (error) {
        console.log('postLike error:', error);
        return {success: false, msg: 'Could not like the posts'};
    }
}
export const  removePostLike = async (postId, userId) => {
    try{ 
       const {error} = await supabase
       .from ('postLikes')
       .delete()
       .eq ('userId', userId)
       .eq('postId', postId)
       if(error){
        console.log('postLike error:', error);
        return {success: false, msg: 'Could not remove the posts like'};
       }

       return{success: true};
       
    } catch (error) {
        console.log('postLike error:', error);
        return {success: false, msg: 'Could not remove the posts like'};
    }
}
export const  createComment = async (comment) => {
    try{ 
       const {data,error} = await supabase
       .from ('comments')
       .insert(comment)
       .select()
       .single();
       if(error){
        console.log('comment error:', error);
        return {success: false, msg: 'Could not create comment'};
       }

       return{success: true, data:data};
       
    } catch (error) {
        console.log('comment error:', error);
        return {success: false, msg: 'Could not create comment'};
    }
}
export const  removeComment = async (commentId) => {
    try{ 
       const {error} = await supabase
       .from ('comments')
       .delete()
       .eq('id', commentId)
       if(error){
        console.log('remove comment error:', error);
        return {success: false, msg: 'Could not remove the comment'};
       }

       return{success: true, data:{commentId}};
       
    } catch (error) {
        console.log('remove comment error:', error);
        return {success: false, msg: 'Could not remove the comment'};
    }
}
export const  removePost = async (postId) => {
    try{ 
       const {error} = await supabase
       .from ('posts')
       .delete()
       .eq('id', postId)
       if(error){
        console.log('remove post error:', error);
        return {success: false, msg: 'Could not remove the post'};
       }

       return{success: true, data:{postId}};
       
    } catch (error) {
        console.log('remove post error:', error);
        return {success: false, msg: 'Could not remove the post'};
    }
}

export const  fetchBanner = async () => {
    try{ 
       const {data,error} = await supabase
       .from ('banner')
       .select()
       
       if(error){
        console.log('banner error:', error);
        return {success: false, msg: 'Could not display banner'};
       }

       return{success: true, data:data};
       
    } catch (error) {
        console.log('comment error:', error);
        return {success: false, msg: 'Could not display banner'};
    }
}

export const  fetchCategory = async () => {
    try{ 
       const {data,error} = await supabase
       .from ('category')
       .select()
       
       if(error){
        console.log('category error:', error);
        return {success: false, msg: 'Could not display category'};
       }

       return{success: true, data:data};
       
    } catch (error) {
        console.log('comment error:', error);
        return {success: false, msg: 'Could not display category'};
    }
}

export const getPetCategory = async (category) => {
    try {
      
      const { data, error } = await supabase
        .from('pets')                 
        .select('*')                 
        .eq('category', category);  
  
      if (error) {
        console.error('Error fetching pets by category:', error);
        return { success: false, msg: 'Could not fetch pets in category' };
      }
  
      console.log('Fetched pets in category:', data);  
      return { success: true, data: data };
  
    } catch (err) {
      console.error('Unexpected error:', err);  
      return { success: false, msg: 'Unexpected error occurred' };
    }
  };

  export const InsertPet = async (petData) => {
    
    const { name, category, breed, age, sex, weight, address, about,file, username, email,userImage } = petData;

    try {
        // Insert new pet into the pets table
        const { data, error } = await supabase
            .from('pets')
            .insert([{
                name,
                category,
                breed,
                age,
                sex,
                weight,
                address,
                about,
                file,
                username,
                email,
                userImage
            }]);

        
        if (error) {
            throw new Error(error.message); 
        }

        return { success: true, data: data }; 
    } catch (error) {
        console.error('Error creating pet:', error);
        return { success: false, msg: error.message }; 
    }
};
  
export const GetUserDetails = async (id, currentUserEmail) => {
    try {
      const { data, error } = await supabase
        .from('chat') // Ensure this matches the chat table name
        .select('*')
        .eq('id', id)
        .or(`email1.eq.${currentUserEmail},email2.eq.${currentUserEmail}`); // Exclude current user's email
  
      if (error || !data || data.length === 0) {
        console.error('Error fetching chat details:', error);
        return { success: false, data: null };
      }
  
      return { success: true, data: data[0] }; // Return the fetched data if successful
    } catch (err) {
      console.error('Fetch error:', err);
      return { success: false, data: null };
    }
  };