import { View, Text, FlatList, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getSupabaseFileUrl } from '../../services/imageService';

const Verify = () => {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // New state for refreshing

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
  const updateStatus = async (user_id) => {
    const { error } = await supabase
      .from('verification_requests')
      .update({ status: 'approved' })
      .eq('user_id', user_id);
    
    if (error) {
      console.error('Error updating status:', error);
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

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true); // Start refreshing
    await fetchRequests(); // Fetch new data
    setRefreshing(false); // Stop refreshing
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Verification Requests</Text>
      <FlatList
        data={requests}
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
            
            {item.status === 'pending' && (
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => updateStatus(item.user_id)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshing={refreshing} // Pass refreshing state to FlatList
        onRefresh={handleRefresh} // Trigger refresh on pull-to-refresh
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
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
