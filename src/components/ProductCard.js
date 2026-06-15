import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToBag } from '../redux/cartSlice';
import { Ionicons } from '@expo/vector-icons';

// Dimensions logic allows perfect 2-column layout on any screen width
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44 - 10) / 2; // (TotalWidth - AppPadding - Gap) / 2

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isLoved, setIsLoved] = useState(false);

  // Fallback brand processing for FakeStore API
  const brandName = product.category === "men's clothing" ? 'Vashions' : 'Zudio';
  
  const currentPrice = Math.round(product.price * 83); // Converted to roughly match ₹599 / ₹1249
  const oldPrice = Math.round(currentPrice * 1.64); // Simulate ₹3499
  const discountText = "64% OFF";

  return (
    <View style={styles.cardContainer}>
      
      {/* --- IMAGE AREA --- */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        
        {/* Heart Icon (Top Right Over Image) */}
        <TouchableOpacity 
          style={styles.heartButton} 
          onPress={() => setIsLoved(!isLoved)}
        >
          <Ionicons 
            name={isLoved ? "heart" : "heart-outline"} 
            size={14} 
            color={isLoved ? "#DB3022" : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      {/* --- DETAILS AREA --- */}
      <View style={styles.infoContainer}>
        
        <Text style={styles.brand} numberOfLines={1}>{brandName}</Text>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
        
        {/* Try N Buy + Cart Action */}
        <View style={styles.tryBuyContainer}>
          <Text style={styles.tryBuyText}>TRY </Text>
          <Text style={styles.tryBuyN}>N</Text>
          <Text style={styles.tryBuyText}> BUY</Text>
          
          <TouchableOpacity 
            style={styles.addToBagBtn} 
            onPress={() => dispatch(addToBag({ ...product, price: currentPrice }))}
          >
            <Ionicons name="bag-add-outline" size={16} color="#4342FF" />
          </TouchableOpacity>
        </View>

        {/* Pricing Row */}
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₹{currentPrice}</Text>
          
          <View style={styles.oldPriceContainer}>
            <Text style={styles.oldPriceText}>₹{oldPrice}</Text>
            <View style={styles.oldPriceStrike} />
          </View>
          
          <Text style={styles.discountText}>{discountText}</Text>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 175 / 256, // Enforces exact Figma proportions (175x256)
    backgroundColor: '#F0F2F4',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(126, 126, 137, 0.66)', // Matches Figma "streamline-flex:heart-remix" background
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingTop: 8, // Derived from absolute positioning gap
  },
  brand: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '700',
    color: '#29292C',
    lineHeight: 18,
  },
  title: {
    fontFamily: 'League Spartan',
    fontSize: 14,
    fontWeight: '400',
    color: '#505050',
    marginTop: 3,
    lineHeight: 14,
  },
  tryBuyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tryBuyText: {
    fontFamily: 'League Spartan',
    fontSize: 14,
    fontWeight: '600',
    color: '#676769',
    textTransform: 'uppercase',
  },
  tryBuyN: {
    fontFamily: 'League Spartan',
    fontSize: 12,
    fontWeight: '700',
    color: '#4342FF',
    fontStyle: 'italic',
  },
  addToBagBtn: {
    marginLeft: 'auto', // Pushes icon to the right
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  currentPrice: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '600',
    color: '#505050',
    lineHeight: 18,
  },
  oldPriceContainer: {
    justifyContent: 'center',
    marginLeft: 6,
  },
  oldPriceText: {
    fontFamily: 'League Spartan',
    fontSize: 12,
    fontWeight: '400',
    color: '#505050',
  },
  oldPriceStrike: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#505050',
    top: '50%',
  },
  discountText: {
    fontFamily: 'League Spartan',
    fontSize: 12,
    fontWeight: '600',
    color: '#4342FF',
    marginLeft: 6,
  },
});

export default ProductCard;