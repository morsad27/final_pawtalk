import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Shared from '../../shared/Shared';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PetListItem from './../../components/Home/PetListItem';

export default function Favorite() {
  const { user } = useAuth(); 
  const [favIds, setFavIds] = useState([]); 
  const [favPets, setFavPets] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false); 

  useEffect(() => {
    if (user) {
      GetFavPetIds(); // Fetch favorite pet IDs when user is available
    }
  }, [user]);

  const GetFavPetIds = async () => {
    setLoading(true); 
    const result = await Shared.GetFavList(user);
    console.log('Fetched favorites:', result); // Log the result for debugging

    // Extract IDs directly from objects
    const ids = result?.favorites?.map(fav => fav.favorites) || [];
    console.log('Extracted Favorite IDs:', ids);
    setFavIds(ids);
    await FetchFavPets(ids); // Fetch pets after getting the IDs
    setLoading(false); 
  };

  const FetchFavPets = async (ids) => {
    if (ids.length === 0) {
      setFavPets([]); // If no favorites, set to empty
      return;
    }

    // Fetch pet details from Supabase using the favorite IDs
    const { data, error } = await supabase
      .from('pets') 
      .select('*') // Select all fields
      .in('id', ids); // Filter based on favorite IDs

    if (error) {
      console.error('Error fetching pets:', error.message);
    } else {
      setFavPets(data); 
      console.log('Fetched pets:', data); 
    }
  };

  const onRefresh = async () => {
    setRefreshing(true); 
    await GetFavPetIds(); 
    setRefreshing(false); 
  };

  if (loading) {
   
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>
      <FlatList
        data={favPets}
        renderItem={({ item }) => (
          <PetListItem pet={item} />
        )}
        keyExtractor={(item) => item.id.toString()} 
        ListEmptyComponent={<Text style={styles.emptyText}>No favorite pets found.</Text>} // Show when no pets
        refreshing={refreshing} 
        onRefresh={onRefresh} 
      />
    </View>
  );
}

// Define styles using StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontFamily: 'medium',
    fontSize: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
