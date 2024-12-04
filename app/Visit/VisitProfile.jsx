import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Avatar from '../../components/Avatar';
import Icon from '../../assets/icons';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import Colors from '../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../../lib/supabase';

let limit = 0;

const VisitProfile = () => {
  const item = useLocalSearchParams();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('unverified');
  const router = useRouter();

  useEffect(() => {
    getPosts();
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('status')
      .eq('user_id', item.id);

    if (error || !data || data.length === 0 || !data[0]?.status) {
      setVerificationStatus('unverified');
    } else {
      setVerificationStatus(data[0].status.toLowerCase());
    }
  };

  const getPosts = async () => {
    if (!hasMore) return;
    limit = limit + 10;

    setLoading(true);

    const res = await fetchPosts(limit, item.id);
    if (res.success) {
      if (posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }

    setLoading(false);
  };

  return (
    <ScreenWrapper>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            item={item}
            router={router}
            verificationStatus={verificationStatus}
          />
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(post) => post.id.toString()}
        renderItem={({ item }) => <PostCard item={item} currentUser={item} router={router} />}
        onEndReached={() => getPosts()}
        onEndReachedThreshold={0}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
        ListEmptyComponent={
          loading && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Loading />
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ item, router, verificationStatus }) => {
  const [group, setGroup] = useState(false);
  const [isBanned, setIsBanned] = useState(false); // Track banned status

  useEffect(() => {
    fetchUserGroup();
    fetchUserBanStatus(); // Fetch if user is banned
  }, []);

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

  const fetchUserBanStatus = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('Banned_Status')
        .eq('id', item.id)
        .single();

      if (data) {
        setIsBanned(data.Banned_Status); // Update banned status
      }
    } catch (err) {
      console.error('Error fetching banned status:', err);
    }
  };

  const banUser = async () => {
    const { data, error } = await supabase
      .from('users')
      .update({ Banned_Status: true })
      .eq('id', item.id);

    if (error) {
      Alert.alert('Error', 'Unable to ban the user.');
    } else {
      Alert.alert('Success', 'User has been banned.');
      setIsBanned(true); // Update UI to show the ban status
    }
  };

  const unbanUser = async () => {
    const { data, error } = await supabase
      .from('users')
      .update({ Banned_Status: false })
      .eq('id', item.id);

    if (error) {
      Alert.alert('Error', 'Unable to unban the user.');
    } else {
      Alert.alert('Success', 'User has been unbanned.');
      setIsBanned(false); // Update UI to show the unban status
    }
  };

  const onPressMenu = (menu) => {
    router.push({
      pathname: menu.path,
      params: {
        email: item.email,
        name: item.name,
      },
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'green', text: 'Verified', backgroundColor: 'lightgreen' };
      case 'pending':
        return { color: 'orange', text: 'Pending Verification', backgroundColor: 'lightyellow' };
      default:
        return { color: 'red', text: 'Unverified', backgroundColor: 'lightcoral' };
    }
  };

  const statusStyles = getStatusStyles(verificationStatus);

  const Menu = [
    {
      id: 1,
      name: 'Pet',
      icon: 'bookmark',
      path: '/../user-post',
    },
  ];

  return (
    <View style={{ flex: 1, paddingHorizontal: wp(4) }}>
      <Header title="Profile" mb={30} />

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar uri={item?.image} size={hp(12)} rounded={theme.radius.xxl * 1.4} />
          </View>

          {/* User info */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.infoText}>{item.address}</Text>

            {/* Verification Status */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                padding: 5,
                borderRadius: 10,
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={hp(3)}
                color={statusStyles.color}
              />
              <Text style={[styles.verificationStatus, { color: statusStyles.color }]}>
                {statusStyles.text}
              </Text>
            </View>
          </View>

          {/* Email, Phone, Bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{item.email}</Text>
            </View>
            {item.phonenumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{item.phonenumber}</Text>
              </View>
            )}
            {item.bio && <Text style={styles.infoText}>{item.bio}</Text>}

            <FlatList
              data={Menu}
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

            {/* Ban Button */}
            {group === 'ADMIN' && !isBanned && (
              <TouchableOpacity
                style={styles.banButton}
                onPress={banUser}
              >
                <Text style={styles.banButtonText}>Ban User</Text>
              </TouchableOpacity>
            )}

            {/* Unban Button */}
            {group === 'ADMIN' && isBanned && (
              <TouchableOpacity
                style={styles.banButton}
                onPress={unbanUser}
              >
                <Text style={styles.banButtonText}>Unban User</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default VisitProfile;

const styles = StyleSheet.create({
  container: { flex: 1 },
  avatarContainer: { height: hp(12), width: hp(12), alignSelf: 'center' },
  userName: { fontSize: hp(3), fontWeight: '500', color: theme.colors.textDark },
  verificationStatus: { fontSize: hp(1.8), fontWeight: '600' },
  infoText: { fontSize: hp(1.6), fontWeight: '500', color: theme.colors.textLight },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  noPosts: { fontSize: hp(2), textAlign: 'center', color: theme.colors.text },
  banButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  banButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
