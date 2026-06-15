import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { increaseQuantity, decreaseQuantity, removeFromBag } from '../redux/cartSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BagScreen = ({ navigation }) => {
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const isEmpty = cartItems.length === 0;

  const [isLoved, setIsLoved] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [showPayableAmount, setShowPayableAmount] = useState(false);

  useEffect(() => {
    setSelectedItemIds(cartItems.map((item) => item.id));
  }, [cartItems]);

  const toggleItemSelection = (itemId) => {
    setSelectedItemIds((currentSelected) => {
      if (currentSelected.includes(itemId)) {
        return currentSelected.filter((selectedId) => selectedId !== itemId);
      }

      return [...currentSelected, itemId];
    });
  };

  const handleDeleteSelectedItems = () => {
    selectedItemIds.forEach((itemId) => {
      dispatch(removeFromBag(itemId));
    });

    setSelectedItemIds([]);
  };

  const payableItems = selectedItemIds.length > 0
    ? cartItems.filter((item) => selectedItemIds.includes(item.id))
    : cartItems;

  const totalPayableAmount = payableItems.reduce(
    (sum, item) => sum + (Number(item.price) * item.quantity),
    0
  );

  const handleProceedToPay = () => {
    setShowPayableAmount(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemWrapper}>
      {/* RESPONSIVE IMAGE CONTAINER */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          style={[styles.checkbox, !selectedItemIds.includes(item.id) && styles.checkboxUnselected]}
          onPress={() => toggleItemSelection(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={selectedItemIds.includes(item.id) ? 'checkmark' : 'ellipse-outline'}
            size={16}
            color={selectedItemIds.includes(item.id) ? '#FFFFFF' : '#676769'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>Product description line 1{'\n'}Product description line 2</Text>
        
        <View style={styles.pricesContainer}>
          <Text style={styles.priceText}>₹{item.price.toFixed(0)}</Text>
          <Text style={styles.oldPriceText}>₹{(item.price * 1.4).toFixed(0)}</Text>
        </View>

        <View style={styles.tryBuyContainer}>
          <Text style={styles.tryBuyText}>TRY </Text>
          <Text style={styles.tryBuyN}>N</Text>
          <Text style={styles.tryBuyText}> BUY</Text>
        </View>

        <View style={styles.stepperContainer}>
          <TouchableOpacity onPress={() => dispatch(decreaseQuantity(item.id))} style={styles.stepperBtn}>
            <Ionicons name="trash-outline" size={16} color="#29292C" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => dispatch(increaseQuantity(item.id))} style={styles.stepperBtn}>
            <Ionicons name="add" size={18} color="#29292C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* --- RESPONSIVE HEADER --- */}
      <View style={[styles.header, isEmpty && styles.headerEmpty]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={28} color="#29292C" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Bag</Text>
        
        <TouchableOpacity onPress={() => setIsLoved(!isLoved)} style={styles.headerIcon}>
          <Ionicons name={isLoved ? "heart" : "heart-outline"} size={24} color={isLoved ? "#DB3022" : "#29292C"} />
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        /* --- RESPONSIVE EMPTY STATE UI --- */
        <View style={styles.emptyContainer}>
          <View style={styles.oopsRow}>
            <Text style={styles.oopsText}>OOPS</Text>
            <Ionicons name="sad-outline" size={26} color="#000000" />
          </View>
          
          <Text style={styles.emptySubtitle}>Your bag is empty.</Text>
          
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/859/859270.png' }} 
            style={styles.emptyImage}
            resizeMode="contain"
          />

          <Text style={styles.addItemsText}>Add items to your bag now</Text>
          
          <TouchableOpacity 
            style={styles.startShoppingBtn} 
            onPress={() => navigation.navigate('Products')} 
          >
            <Text style={styles.startShoppingText}>Start shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* --- FILLED STATE UI --- */
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={() => (
              <View style={styles.topContent}>
                <View style={styles.deliveryRow}>
                  <View style={styles.deliveryIconPlaceholder}>
                     <Image
                       source={require('../../assets/iconDelivery.png')}
                       style={styles.deliveryIconImage}
                       resizeMode="contain"
                     />
                  </View>
                  <View style={styles.deliveryTexts}>
                    <Text style={styles.deliveryTitle}>Delivering in just 60 min</Text>
                    <Text style={styles.deliveryAddress}>Full address - 29 Aparna Complex, Gurgaon...</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#676769" />
                </View>

                <View style={styles.freeDeliveryBanner}>
                  <MaterialCommunityIcons name="check-decagram" size={20} color="#4342FF" />
                  <Text style={styles.freeDeliveryText}>Yayy! Your order is eligible for FREE delivery.</Text>
                </View>

                <TouchableOpacity
                  style={styles.deselectBtn}
                  onPress={handleDeleteSelectedItems}
                  activeOpacity={0.8}
                  disabled={selectedItemIds.length === 0}
                >
                  <Text style={styles.deselectText}>
                    Delete selected items
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />

          {/* RESPONSIVE BOTTOM ACTION BAR */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleProceedToPay}>
              <Text style={styles.checkoutText}>Proceed to pay</Text>
            </TouchableOpacity>
            {showPayableAmount && (
              <Text style={styles.totalPayableText}>Total amount to pay: ₹{totalPayableAmount.toFixed(0)}</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /* --- Responsive Header Styles --- */
  header: {
    backgroundColor: '#F0F2F4',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // Dynamic padding instead of fixed height handles iOS notch/Android status bar
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    shadowColor: 'rgba(229, 229, 241, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  headerEmpty: {
    paddingBottom: 15,
  },
  headerTitle: {
    fontFamily: 'League Spartan',
    fontSize: 28, 
    fontWeight: '500',
    color: '#29292C',
  },
  headerIcon: {
    padding: 8,
    width: 44, 
    alignItems: 'center',
  },

  /* --- Responsive Empty State Styles --- */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20, // Prevents text from hitting screen edges on narrow devices
  },
  oopsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  oopsText: {
    fontFamily: 'League Spartan',
    fontSize: 30,
    fontWeight: '600',
    color: '#29292C',
    marginRight: 8,
  },
  emptySubtitle: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#29292C',
    marginBottom: 25,
  },
  emptyImage: {
    width: '55%', // Fluid width relative to screen
    aspectRatio: 1, // Keeps image a perfect square
    marginBottom: 25,
  },
  addItemsText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#29292C',
    marginBottom: 10,
    textAlign: 'center',
  },
  startShoppingBtn: {
    width: '65%', // Fluid button
    minWidth: 200, // Ensures it doesn't get too small on tiny phones
    height: 50,
    backgroundColor: '#4342FF',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  startShoppingText: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
  },

  /* --- Filled State Styles --- */
  topContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  deliveryIconPlaceholder: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deliveryIconImage: {
    width: 100,
    height: 100,
  },
  deliveryTexts: {
    flex: 1,
  },
  deliveryTitle: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#29292C',
  },
  deliveryAddress: {
    fontFamily: 'League Spartan',
    fontSize: 16,
    color: '#676769',
    marginTop: 2,
  },
  freeDeliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    flexWrap: 'wrap', // Text wraps safely on small screens
  },
  freeDeliveryText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '500',
    color: '#4342FF',
    marginLeft: 8,
    textAlign: 'center',
  },
  deselectBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  deselectText: {
    fontFamily: 'League Spartan',
    fontSize: 17,
    color: '#4342FF',
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Ensures scroll clears the bottom bar
  },
  separator: {
    height: 1.5,
    backgroundColor: 'rgba(101, 101, 231, 0.12)',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  itemWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  
  /* --- Responsive Cart Item Card --- */
  imageContainer: {
    width: '32%', // Replaced fixed 136px width
    aspectRatio: 0.95, // Maintains the slightly tall rectangular shape from Figma
    backgroundColor: '#E7E7E7',
    borderRadius: 8.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '85%',
    height: '85%',
    borderRadius: 8.6,
  },
  checkbox: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    backgroundColor: '#3231D8',
    borderRadius: 4.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.6,
    borderColor: '#FFFFFF',
  },
  checkboxUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8D8DF',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  productTitle: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#29292C',
  },
  productDesc: {
    fontFamily: 'League Spartan',
    fontSize: 15,
    color: '#29292C',
    marginTop: 4,
    lineHeight: 18,
  },
  pricesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap', // Prevents overflow on very narrow devices
  },
  priceText: {
    fontFamily: 'League Spartan',
    fontSize: 22,
    fontWeight: '600',
    color: '#29292C',
  },
  oldPriceText: {
    fontFamily: 'League Spartan',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '300',
    color: '#29292C',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  tryBuyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#4342FF',
    fontStyle: 'italic',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(101, 101, 231, 0.74)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(229, 229, 241, 0.4)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  stepperBtn: {
    paddingHorizontal: 5,
  },
  quantityText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '500',
    color: '#29292C',
    marginHorizontal: 15,
  },

  /* --- Responsive Bottom Bar --- */
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 15, // Safe area lift for iOS
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20, // Padding allows the width to be 100% inside safely
  },
  checkoutBtn: {
    width: '100%', // Fully responsive width
    height: 54,
    backgroundColor: '#4342FF',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4342FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  checkoutText: {
    fontFamily: 'League Spartan',
    fontSize: 21,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  totalPayableText: {
    marginTop: 10,
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '500',
    color: '#29292C',
    textAlign: 'center',
    marginBottom:20,
  },
});

export default BagScreen;