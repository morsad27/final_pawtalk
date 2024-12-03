import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getSupabaseFileUrl } from '../../services/imageService';

const Verify = () => {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch verification requests from Supabase
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('user_id, id_image_url, selfie_image_url, status');
    
    if (error) {
      console.error('Error fetching data:', error);
    } else {
      setRequests(data);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Update status to 'approved'
  const approveStatus = async (user_id) => {
    const { error } = await supabase
      .from('verification_requests')
      .update({ status: 'approved' })
      .eq('user_id', user_id);
    
    if (error) {
      console.error('Error updating status to approved:', error);
    } else {
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.user_id === user_id
            ? { ...request, status: 'approved' }
            : request
        )
      );
    }
  };

  // Update status to 'declined'
  const declineStatus = async (user_id) => {
    const { error } = await supabase
      .from('verification_requests')
      .update({ status: 'declined' })
      .eq('user_id', user_id);
    
    if (error) {
      console.error('Error updating status to declined:', error);
    } else {
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.user_id === user_id
            ? { ...request, status: 'declined' }
            : request
        )
      );
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  // Filter requests to exclude 'approved' and 'declined' statuses
  const filteredRequests = requests.filter(
    (request) => request.status === 'pending'
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verification Requests</Text>
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <View style={styles.requestContainer}>
            <Text style={styles.userIdText}>User ID: {item.user_id}</Text>
            
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>ID Image:</Text>
              <Image
                source={getSupabaseFileUrl(item?.id_image_url)}
                style={styles.image}
              />
            </View>

            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Selfie Image:</Text>
              <Image
                source={getSupabaseFileUrl(item?.selfie_image_url)}
                style={styles.image}
              />
            </View>

            <Text style={styles.statusText}>Status: {item.status}</Text>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => approveStatus(item.user_id)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => declineStatus(item.user_id)}
              >
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingTop: 50,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  requestContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 10,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Verify;
