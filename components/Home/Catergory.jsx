import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchCategory } from '../../services/postService';
import { getSupabaseFileUrl } from '../../services/imageService';
import Colors from '../../constants/Colors';

export default function Catergory({category}) {

  const [categoryList, setcategoryList] = useState([]);  
  const [selectedCategory, setSelectedCategory] = useState('Dogs');

    useEffect(() => {
      getCategory();
    }, []);
//USE TO GET CATEGORY FROM THE DB  OF THE SUPABASE

    const getCategory = async () => {
      setcategoryList([]);
        let res = await fetchCategory();
       // console.log('got category result:', res)
        if (res.success) {
          setcategoryList(res.data);  
        }
    };

  return (
    <View style={{
        marginTop: 20
    }}>
      <Text style={{
        fontFamily: 'medium',
        fontSize: 20
      }}>Catergory</Text>

      <FlatList
          data={categoryList}
          numColumns={4}
          renderItem={({ item }) => (
            <TouchableOpacity 
            onPress={()=> {
              setSelectedCategory(item.name)
              category(item.name)
            }}
            style={{
              flex: 1
            }}>
                <View style={[styles.container,
                  selectedCategory==item.name&&styles.selectedCategoryContainer
                ]}>
                      {item?.file && item?.file.includes('category') && (
                            <Image
                                source={getSupabaseFileUrl(item?.file)}
                                style={{
                                  width: 40,
                                  height: 40
                                }}
                            />
                      )}
                  </View>
                  <Text style={{
                    textAlign:'center',
                    fontFamily: 'regular'
                  }}>
                    {item?.name}
                  </Text>
             </TouchableOpacity>
            )}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 15,
    margin: 5,
  },
  selectedCategoryContainer: {
    backgroundColor: Colors.SECONDARY,
    borderColor: Colors.SECONDARY,
    borderWidth: 2,
  },
});
