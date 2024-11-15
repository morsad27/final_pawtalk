import { View, Text, StyleSheet, FlatList } from 'react-native';
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

var limit = 0;
const VisitProfile = () => {
  const item = useLocalSearchParams();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true); 
  const router = useRouter(); 

  useEffect(() => {
    getPosts();  
  }, []);

  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 10;

    setLoading(true);  

    let res = await fetchPosts(limit, item.id);  
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
        ListHeaderComponent={<UserHeader item={item}  router={router}/>}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} 
          currentUser={item}
          router={router} />
        )}
        onEndReached={() => {
          getPosts();
        }}
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

const UserHeader = ({ item }) => {
  return (
    <View style={{ flex: 1, paddingHorizontal: wp(4) }}>
      <View>
        <Header title="Profile" mb={30} />
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar uri={item?.image} size={hp(12)} rounded={theme.radius.xxl * 1.4} />
          </View>

          {/* visited user info */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.infoText}>{item.address}</Text>
          </View>

          {/* email, phone, bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{item.email}</Text>
            </View>
            {item.phonenumber && (
              <View style={{ gap: 10 }}>
                <View style={styles.info}>
                  <Icon name="call" size={20} color={theme.colors.textLight} />
                  <Text style={styles.infoText}>{item.phonenumber}</Text>
                </View>
              </View>
            )}
            {item.bio && <Text style={styles.infoText}>{item.bio}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
};

export default VisitProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center',
  },
  userName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.textDark,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noPosts:{
    fontSize: hp(2),
    textAlign:'center',
    color: theme.colors.text
  },
});
