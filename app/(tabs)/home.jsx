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
import { useNavigation, useFocusEffect } from '@react-navigation/native';

var limit = 0;

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState(''); // New state for search query
  const [results, setResults] = useState([]); // New state for search results
  const [loading, setLoading] = useState(true); // Global loading state for page
  const [searchLoading, setSearchLoading] = useState(false); // Loading state for search bar
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigation = useNavigation();
  const [group, setGroup] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      // Clear the search query whenever the screen loses focus
      setQuery('');
      setResults([]);
    }, [])
  );

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

  const handleLogout = async () => {
    Alert.alert('Confirm', "Are you sure you want to log out?", [
      {
        text: 'Cancel',
        onPress: () => console.log('Logout cancelled'),
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          await supabase.auth.signOut();
          router.push('/login');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleUserClick = (item) => {
    if (item) {
      router.push({
        pathname: '/Visit/VisitProfile',
        params: item,
      });
    }
  };

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_with_email', { search_text: text });

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
      setSearchLoading(false);
    }
  };

  const handlePostEvent = async (payload) => {
    if (payload.eventType === 'INSERT' && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
    if (payload.eventType === 'DELETE' && payload.old.id) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== payload.old.id));
    }
    if (payload.eventType === 'UPDATE' && payload?.new?.id) {
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === payload.new.id ? { ...post, ...payload.new } : post))
      );
    }
  };

  const handleNewNotification = async (payload) => {
    if (payload.eventType === 'INSERT' && payload.new.id) {
      setNotificationCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
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
    if (!hasMore) return;
    limit += 10;
    try {
      setLoading(true); // Start loading posts
      const res = await fetchPosts(limit);
      if (res.success) {
        if (posts.length === res.data.length) setHasMore(false);
        setPosts(res.data);
      }
    } finally {
      setLoading(false); // Stop loading posts
    }
  };

  return (
    <ScreenWrapper bg="white">
      {loading ? (
        <Loading />
      ) : (
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
              {group === 'ADMIN' ? (
                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                  <Icon name="logout" size={hp(3.2)} color={theme.colors.rose} />
                </Pressable>
              ) : (
                <Pressable onPress={() => router.push('profile')}>
                  <Avatar uri={user?.image} size={hp(4.3)} rounded={theme.radius.sm} style={{ borderWidth: 2 }} />
                </Pressable>
              )}
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
            {searchLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.primary} />}
          </View>

          {/* Display Search Results or Posts */}
          <FlatList
            data={query.length > 0 ? results : posts}
            extraData={posts}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listStyle}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) =>
              query.length > 0 ? (
                <Pressable onPress={() => handleUserClick(item)} style={styles.resultItem}>
                  <Avatar uri={item.image} size={hp(4.5)} rounded={theme.radius.md} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.resultText}>{item.name}</Text>
                  </View>
                </Pressable>
              ) : (
                <PostCard item={item} currentUser={user} router={router} />
              )
            }
            onEndReached={() => {
              if (query.length === 0) getPosts();
            }}
            onEndReachedThreshold={0.5}
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
      )}
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
