import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Catergory from './Catergory';
import { getPetCategory } from '../../services/postService';
import PetListItem from './PetListItem';

export default function PetListByCategory() {
  const [petList, setPetList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    GetPetList('Dogs');
  }, []);

  // Fetch pets from the database and filter out adopted pets
  const GetPetList = async (category) => {
    setLoader(true);
    setPetList([]);
    let res = await getPetCategory(category);

    if (res.success) {
      // Filter out pets with adoptstatus === 'adopted'
      const availablePets = res.data.filter((pet) => pet.adoptstatus !== 'adopted');
      setPetList(availablePets);
    }
    setLoader(false);
  };

  return (
    <View>
      <Catergory category={(value) => GetPetList(value)} />

      <FlatList
        style={{ marginTop: 10 }}
        data={petList}
        refreshing={loader}
        onRefresh={() => GetPetList('Dogs')}
        renderItem={({ item }) => <PetListItem pet={item} />}
      />
    </View>
  );
}
