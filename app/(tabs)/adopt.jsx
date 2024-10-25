import { FlatList, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Header from '../../components/Home/Header'
import Slider from '../../components/Slider'
import PetListByCategory from '../../components/Home/PetListByCategory'

const Adopt = () => {
  const data = [];
  return (
    <View style={{
      padding:20, marginTop:20
    }}>

      <FlatList
        ListHeaderComponent={
          <>
            {/*header*/}
            <Header />
            {/*slider*/}
            <Slider />
          </> //short syntax for react fragment
        }
        data={data} // No actual data; just using FlatList for optimized scroll handling
        renderItem={null} // No items to render in the list itself
        ListFooterComponent={<PetListByCategory />} // Adding PetListByCategory at the bottom
        keyExtractor={(item, index) => index.toString()} // Required for FlatList
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
      />
    </View>
  )
}

export default Adopt

const styles = StyleSheet.create({})