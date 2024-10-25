import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Catergory from './Catergory'
import { getPetCategory } from '../../services/postService';
import PetListItem from './PetListItem';

export default function PetListByCategory() {
  
  const [petList,setPetList] = useState([]);
  const [loader, setLoader]=useState(false);

  useEffect(()=>{
    GetPetList('Dogs')
  },[])

  //PARA MAKUHA YUNG MGA PET FROM DB
  const GetPetList = async (category) => {
    setLoader(true)
    setPetList([]);
    let res = await getPetCategory(category);  
    //console.log('Got pet list for category:', res);  
  
    if (res.success) {
      setPetList(res.data);
      
    }
    setLoader(false);
  };
  return (
    <View>
      <Catergory category={(value)=>GetPetList(value)}/>
        
        <FlatList
        style={{marginTop: 10}}
        data={petList}
        refreshing={loader}
        onRefresh={()=>GetPetList('Dogs')}
        renderItem={({item,index})=>(
          <PetListItem pet={item}/>
        )}
        />
    </View>
  )
}