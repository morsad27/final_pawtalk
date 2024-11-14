import { Alert, Button, FlatList, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';
import { useRouter } from 'expo-router';
import Avatar from '../../components/Avatar';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import { getUserData } from '../../services/userService';

var limit = 0;

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState(''); // New state for search query
  const [results, setResults] = useState([]); // New state for search results
  const [loading, setLoading] = useState(false); // New state for search loading indicator
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, image')
        .ilike('name', `%${text}%`);

      if (error) {
        console.error('Search error:', error.message);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostEvent = async (payload) => {
    console.log('payload:', payload)
    if(payload.eventType == 'INSERT' &&  payload?.new?.id){
      let newPost = {...payload.new};
      let res = await getUserData(newPost.userId);
      newPost.postLikes =[];
      newPost.comments = [{count:0}]
      newPost.user = res.success? res.data : {};
      setPosts(prevPosts=>[newPost, ...prevPosts]);
    }
    if(payload.eventType=='DELETE' && payload.old.id){
      setPosts(prevPosts=>{
        let updatedPosts = prevPosts.filter(post=> post.id!=payload.old.id);
        return updatedPosts;
      })

      
    }
    //POSSIBLE NA PWEDENG PAGKUHAAN NG UPDATE NG LIKE BUTTON OR COMMENT SA NEWSFEED------------------------------------------------------------------------------
    if(payload.eventType == 'UPDATE' &&  payload?.new?.id){
      setPosts(prevPosts=>{
        let updatedPosts = prevPosts.map(post=>{
          if(post.id == payload.new.id){
            post.body = payload.new.body;;
            post.file = payload.new.file; 
          }
          return post;
        });
        return updatedPosts;
      })
      
    }
    
    //console.log('got post event:', payload);
  }


  const handleNewNotification = async (payload)=>{
    console.log('got new notification:', payload);
    if(payload.eventType == 'INSERT' && payload.new.id){
      setNotificationCount(prev=> prev+1);
    }
  }


  useEffect(() => {
    // console.log("Subscribing to Supabase channels");
    let postChannel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
      .subscribe();
    
    let notificationChannel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiverId=eq.${user.id}` }, handleNewNotification)
      .subscribe();
      
    getPosts();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 10;

    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* Header with Search and Icons */}
        <View style={styles.header}>
          <Text style={styles.title}>Header</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => { setNotificationCount(0); router.push('notifications'); }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="add" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar uri={user?.image} size={hp(4.3)} rounded={theme.radius.sm} style={{ borderWidth: 2 }} />
            </Pressable>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Search for users..."
            value={query}
            onChangeText={handleSearch}
          />
          {loading && <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.primary} />}
        </View>

        {/* Display Search Results */}
        <FlatList
          data={query.length > 0 ? results : posts}
          extraData={posts} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            query.length > 0 ? (
              // Render user search results
              <View style={styles.resultItem}>
                <Avatar uri={item.image} size={hp(4.5)} rounded={theme.radius.md} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.resultText}>{item.name}</Text>
                  <Text style={styles.resultSubText}>{item.email}</Text>
                </View>
              </View>
            ) : (
              // Render posts if no search query is present
              <PostCard item={item} currentUser={user} router={router} />
            )
          }
          onEndReached={() => {
            if (query.length === 0) getPosts();
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={
            hasMore && query.length === 0 ? (
              <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>{query.length === 0 ? 'No more posts' : ''}</Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 10, 
    marginHorizontal: wp(4) 
  },
  title: { 
    color: theme.colors.text, 
    fontSize: hp(3.2), 
    fontWeight: theme.fonts.bold 
  },
  icons: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 18 
  },
  listStyle: { paddingTop: 20, 
    paddingHorizontal: wp(4) 
  },
  searchContainer: { 
    flexDirection: 'row',
    alignItems: 'center', 
    marginHorizontal: wp(4),
    marginBottom: 10 
  },
  icon: { 
    marginRight: 10 
  },
  input: { flex: 1, 
    borderWidth: 1, 
    borderRadius: 10, 
    borderColor: theme.colors.gray, 
    paddingHorizontal: 10, 
    paddingVertical: 8, 
    fontSize: hp(1.8) 
  },
  loadingIndicator: { 
    marginLeft: 10 
  },
  resultItem: { flexDirection: 'row',
    alignItems: 'center', 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray, 
    backgroundColor: theme.colors.white, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  resultText: { fontSize: 16, 
    fontWeight: 'bold', 
    color: theme.colors.text 
  },
  resultSubText: { fontSize: 14, 
    color: theme.colors.gray 
  },
  pill: { position: 'absolute', 
    right: -10, 
    top: -4, 
    height: hp(2.2), 
    width: hp(2.2), 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 20, 
    backgroundColor: theme.colors.roseLight 
  },
  pillText: { 
    color: 'white', 
    fontSize: hp(1.2), 
    fontWeight: theme.fonts.bold 
  },
  noPosts: { 
    fontSize: hp(2), 
    textAlign: 'center', 
    color: theme.colors.text 
  },
});
