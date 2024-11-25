import { StyleSheet, Text, View, FlatList, Image} from 'react-native';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          Id,
          filepath,
          userid,
          otheruserid,
          petid,
          pets (
            name,
            breed,
            age
          )
        `);
      if (error) {
        throw error;
      }
      console.log('Fetched documents:', data);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const renderPetListItem = ({ item }) => (
    <View style={styles.petItem}>
      <Text style={styles.petName}>{item.pets?.name || 'Unknown Pet'}</Text>
      <Text style={styles.petBreed}>Breed: {item.pets?.breed || 'N/A'}</Text>
      <Text style={styles.petAge}>Age: {item.pets?.age || 'N/A'} years</Text>
      <Text style={styles.petFile}>File Path: {item.filepath}</Text>
      <Text style={styles.petAdoptedFrom}>Adopted From: {item.otheruserid || 'N/A'}</Text>
      <Text style={styles.petAdoptedBy}>Adopted By: {item.userid || 'N/A'}</Text>

    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        refreshing={loading}
        onRefresh={fetchDocuments}
        showsVerticalScrollIndicator={false}
        data={documents}
        keyExtractor={(item) => item.Id.toString()}
        renderItem={renderPetListItem}
        ListEmptyComponent={() =>
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pet uploaded</Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default Documents;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 60,
    backgroundColor: '#fff',
  },
  petItem: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  petBreed: {
    fontSize: 16,
    color: '#555',
  },
  petAge: {
    fontSize: 16,
    color: '#555',
  },
  petFile: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#aaa',
  },
});
