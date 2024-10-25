import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchBanner } from '../services/postService';
import { getSupabaseFileUrl } from '../services/imageService';

const Slider = () => {
    const [banner, setBanner] = useState([]);  // Use correct state name 'setBanner'

    useEffect(() => {
        getBanner();
    }, []);

    const getBanner = async () => {
        setBanner([]);
        let res = await fetchBanner();
        if (res.success) {
            setBanner(res.data);  
        }
    };

    return (
        <View>
            <FlatList
                data={banner}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View>
                        {item?.file && item?.file.includes('banner') && (
                            <Image
                                source={getSupabaseFileUrl(item?.file)}  
                                style={styles.sliderImage}
                            />
                        )}
                    </View>
                )}
            />
        </View>
    );
};

export default Slider;

const styles = StyleSheet.create({
    sliderImage: {
        width: Dimensions.get('screen').width*0.9,
        height: 170,
        borderRadius: 15,
        marginRight: 15
        //resizeMode: 'contain',
    },
});
