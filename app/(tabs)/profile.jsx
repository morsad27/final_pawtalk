  import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
  import React, { useEffect, useState } from 'react'
  import ScreenWrapper from '../../components/ScreenWrapper'
  import { useAuth } from '../../contexts/AuthContext'
  import { Link, useRouter } from 'expo-router'
  import Header from '../../components/Header'
  import { wp, hp } from '../../helpers/common'
  import Icon from '../../assets/icons'
  import { theme } from '../../constants/theme'
  import { supabase } from '../../lib/supabase'
  import Avatar from '../../components/Avatar'
  import { fetchPosts } from '../../services/postService'
  import PostCard from '../../components/PostCard'
  import Loading from '../../components/Loading'
  import { getUserData } from '../../services/userService'
  import MaterialIcons from '@expo/vector-icons/MaterialIcons';
  import Colors from '../../constants/Colors'
  import Ionicons from '@expo/vector-icons/Ionicons';
  

  var limit = 0;

  const Profile = () => {
    const { user, setAuth } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true); // Loading state for the profile data
    const [verificationStatus, setVerificationStatus] = useState('pending'); // State for verification status
    const [status, setStatus] = useState(null);

    const onLogout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Sign out', "Error signing out!"); // Alert on sign out error
      }
    };


    useEffect(() => {
      const fetchStatus = async () => {
        const { data, error, count } = await supabase
          .from('verification_requests')
          .select('status')
          .eq('user_id', user.id);
      
        if (error) {
          console.error('Error fetching verification status:', error);
          setStatus('Unverified'); // Set status to 'Unverified' if error occurs
        } else {
          if (count === 0) {
            setStatus('Unverified'); // Handle case where no rows are returned
          } else if (count > 1) {
            console.warn('Multiple verification requests found for user. Using the first one.');
            setStatus(data[0]?.status || 'Unverified'); // Handle multiple rows by picking the first
          } else {
            setStatus(data[0]?.status || 'Unverified'); // Handle a single row
          }
          console.log('Verification Status:', data[0]?.status); // Log to check if status is being updated
        }
      };
    
      fetchStatus();
    }, []);
    
    
    useEffect(() => {
      setLoading(true); // Start loading when profile is being loaded

      // Fetch the initial verification status
      const fetchVerificationStatus = async () => {
        const { data, error, count } = await supabase
          .from('verification_requests')
          .select('status')
          .eq('user_id', user.id);
      
        if (error) {
          console.error('Error fetching verification status:', error);
          setVerificationStatus('Unverified'); // Set status to 'Unverified' if error occurs
        } else {
          if (count === 0) {
            setVerificationStatus('Unverified'); // Handle case where no rows are returned
          } else if (count > 1) {
            console.warn('Multiple verification requests found for user. Using the first one.');
            setVerificationStatus(data[0]?.status || 'Unverified'); // Handle multiple rows by picking the first
          } else {
            setVerificationStatus(data[0]?.status || 'Unverified'); // Handle a single row
          }
          console.log('Verification Status:', data[0]?.status); // Log to check if status is being updated
        }
      };

      // Fetch posts and status data
      fetchVerificationStatus();
      getPosts(); // Fetch the posts when profile is loaded

      // Real-time listener for updates to the verification status
      const verificationChannel = supabase
        .channel('verification_status')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'verification_requests' }, (payload) => {
          if (payload.new.user_id === user.id) {
            setVerificationStatus(payload.new.status); // Update verification status on changes
          }
        })
        .subscribe();

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(verificationChannel);
      };
    }, []); // Empty dependency array to run on mount

    
    const handlePostEvent = async (payload) => {
      console.log('payload:', payload)
      if (payload.eventType == 'INSERT' && payload?.new?.id) {
        let newPost = { ...payload.new };
        let res = await getUserData(newPost.userId);
        newPost.postLikes = [];
        newPost.comments = [{ count: 0 }];
        newPost.user = res.success ? res.data : {};
        setPosts(prevPosts => [newPost, ...prevPosts]);
      }
      if (payload.eventType == 'DELETE' && payload.old.id) {
        setPosts(prevPosts => {
          let updatedPosts = prevPosts.filter(post => post.id != payload.old.id);
          return updatedPosts;
        });
      }
      // Handle possible updates to post content
      if (payload.eventType == 'UPDATE' && payload?.new?.id) {
        setPosts(prevPosts => {
          let updatedPosts = prevPosts.map(post => {
            if (post.id == payload.new.id) {
              post.body = payload.new.body;
              post.file = payload.new.file;
            }
            return post;
          });
          return updatedPosts;
        });
      }
    };

    useEffect(() => {
      // Simulating the profile load
      setLoading(true); // Start loading when profile is being loaded

      let postChannel = supabase
        .channel('posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
        .subscribe();

      getPosts(); // Fetch the posts when the profile is loaded

      return () => {
        supabase.removeChannel(postChannel);
      };
    }, []);

    const getPosts = async () => {
      // Simulate fetching posts from API
      if (!hasMore) return null;
      limit = limit + 10;

      console.log('fetching posts:', limit);
      let res = await fetchPosts(limit, user.id);
      if (res.success) {
        if (posts.length == res.data.length) setHasMore(false);
        setPosts(res.data);
        setLoading(false); // Set loading to false once posts are fetched
      }
    };

    const handleLogout = async () => {
      Alert.alert('Confirm', "Are you sure you want to log out?", [
        {
          text: 'Cancel',
          onPress: () => console.log('modal cancelled'),
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => onLogout(),
          style: 'destructive'
        }
      ]);
    };

    return (
      <ScreenWrapper>
        {/* Display loading indicator while fetching profile data */}
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={posts}
            ListHeaderComponent={<UserHeader user={user} router={router} handleLogout={handleLogout} verificationStatus={verificationStatus} status={status} />}
            ListHeaderComponentStyle={{ marginBottom: 30 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listStyle}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <PostCard item={item} currentUser={user} router={router} />}
            onEndReached={() => {
              getPosts();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={hasMore ? (
              <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )}
          />
        )}
      </ScreenWrapper>
    );
  };

  // UserHeader component to display user information
  const UserHeader = ({ user, router, handleLogout, verificationStatus, status }) => {
    console.log('Verification Status in UserHeader:', verificationStatus);

    const onPressMenu = (menu) => {
      router.push(menu.path);
    };

    const Menu = [
      {
        id: 1,
        name: 'Add New Pet',
        icon: 'add-circle',
        path: '/add-new-pet',
      },
      { 
        id: 2,
        name: 'My Post',
        icon: 'bookmark',
        path: '/../user-post',
      },
    ];

    const filteredMenu = Menu.filter((menuItem) => {
      if (menuItem.id === 1 && status !== 'approved') {
        return false; // Exclude "My Post" if user is not verified
      }
      return true; // Include other menu items
    });

    const getStatusStyles = (status) => {
      switch (status) {
        case 'approved':
          return { color: 'green', text: 'Verified', backgroundColor: 'lightgreen' };
        case 'pending':
          return { color: 'orange', text: 'Pending Verification', backgroundColor: 'orange' };
        case 'unverified':
          return { color: 'red', text: 'Unverified', backgroundColor: 'lightcoral' };
        default:
          return { color: 'red', text: 'Unverified', backgroundColor: 'lightcoral' };
      }
    };

    const statusStyles = getStatusStyles(verificationStatus);

    // Disable the Pressable if user is verified or pending
    const isVerifiedOrPending = verificationStatus === 'approved' || verificationStatus === 'pending';

    return (
      <View style={{ flex: 1, paddingHorizontal: wp(4) }}>
        <View>
          <Header title="Profile" mb={30} />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" color={theme.colors.rose} />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <View style={{ gap: 15 }}>
            <View style={styles.avatarContainer}>
              <Avatar
                uri={user?.image}
                size={hp(12)}
                rounded={theme.radius.xxl * 1.4}
              />
              <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
                <Icon name="edit" strokeWidth={2} size={20} />
              </Pressable>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.infoText}>{user?.address}</Text>

              {/* Show verification status with dynamic styles */}
              <View>
              <Pressable
                  style={{
                      flexDirection: 'row',
                      gap: 4,
                  }}
                  disabled={isVerifiedOrPending}
                  onPress={!isVerifiedOrPending ? () => router.push('verifyProfile') : null} // Handle press on the whole area
                  >
                  <Ionicons
                      name="shield-checkmark-outline"
                      size={hp(3)}
                      color={statusStyles.color}
                  />
                  <Text style={[styles.verificationStatus, { color: statusStyles.color }]}>
                      {statusStyles.text}
                  </Text>
              </Pressable>
                          </View>
                      </View>
                      <View style={{ gap: 10 }}>
                          <View style={styles.info}>
                              <Icon name="mail" size={20} color={theme.colors.textLight} />
                              <Text style={styles.infoText}>{user?.email}</Text>
                          </View>
                          {user?.phoneNumber && (
                              <View style={{ gap: 10 }}>
                                  <View style={styles.info}>
                                      <Icon name="call" size={20} color={theme.colors.textLight} />
                                      <Text style={styles.infoText}>{user?.phoneNumber}</Text>
                                  </View>
                              </View>
                          )}
                          {user?.bio && <Text style={styles.infoText}>{user?.bio}</Text>}
                      </View>

                      <FlatList
                          data={filteredMenu}
                          renderItem={({ item, index }) => (
                              <TouchableOpacity
                                  onPress={() => onPressMenu(item)}
                                  key={index}
                                  style={{
                                      marginVertical: 10,
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                      backgroundColor: Colors.WHITE,
                                      gap: 10,
                                      padding: 10,
                                      borderRadius: 10,
                                  }}
                              >
                                  <Ionicons
                                      name={item?.icon}
                                      size={30}
                                      color={Colors.PRIMARY}
                                      style={{
                                          padding: 10,
                                          backgroundColor: Colors.LIGHT_PRIMARY,
                                          borderRadius: 10,
                                      }}
                                  />
                                  <Text style={{ fontFamily: 'regular', fontSize: 20 }}>{item.name}</Text>
                              </TouchableOpacity>
                          )}
                      />
                  </View>
              </View>
          </View>
      );
  };



  export default Profile;


  const styles = StyleSheet.create({
    verificationStatus: {
        fontSize: hp(1.8),
       fontWeight: '600',
    },
      container: {
          flex: 1
      },
      headerContainer: {
          marginHorizontal: wp(4),
          marginBottom: 20
      },
      avatarContainer: {
          height: hp(12),
          width: hp(12),
          alignSelf: 'center',
      },
      editIcon: {
          position: 'absolute',
          bottom: 0,
          right: -12,
          padding: 7,
          borderRadius: 50,
          backgroundColor: 'white',
          shadowColor: theme.colors.textLight,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 7
      },
      userName: {
          fontSize: hp(3),
          fontWeight: '500',
          color: theme.colors.textDark
      },
      info: {
          flexDirection: 'row',
          gap: 10,
      },
      infoText: {
          fontSize: hp(1.6),
          fontWeight: '500',
          color: theme.colors.textLight 
      },
      logoutButton: {
          position: 'absolute',
          right: 0,
          padding: 5,
          borderRadius: theme.radius.sm,
          backgroundColor: '#fee2e2'
      },
      noPosts:{
          fontSize: hp(2),
          textAlign:'center',
          color: theme.colors.text
        },
        addNewPetContainer:{
          textAlign:'center',
          display: 'flex',
          flexDirection:'row',
          gap: 10,
          padding: 20,
          alignItems: 'center',
          marginTop: 20,
          backgroundColor: Colors.LIGHT_PRIMARY,
          borderWidth: 1,
          borderColor:Colors.PRIMARY,
          borderRadius:15,
          borderStyle:'dashed',
          justifyContent: 'center'
      },
  });
