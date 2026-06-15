import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SortModal = ({ visible, onClose, onSelectSort, currentSort }) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Exact options from your Figma CSS
  const sortOptions = [
    'Newest arrivals',
    'Price - low to high',
    'Price - high to low',
    'Offers and dicounts', // Kept spelling exact to Figma
    'Best sellers'
  ];

  const handleSelect = (option) => {
    onSelectSort(option);
    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={true}
      statusBarTranslucent={true} 
      navigationBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Clickable backdrop to dismiss */}
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
        
        {/* Bottom Sheet Container (Rectangle 82 - height 296px) */}
        <View style={[styles.sheetContent, { maxHeight: Math.min(320, height * 0.48), paddingBottom: 16 + insets.bottom }] }>
          
          <Text style={styles.title}>Sort by</Text>

          <ScrollView
            style={styles.optionsScroller}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {sortOptions.map((option) => {
              const isActive = currentSort === option;
              return (
                <TouchableOpacity 
                  key={option} 
                  style={styles.optionButton}
                  onPress={() => handleSelect(option)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText, 
                    isActive && styles.activeOptionText // Highlights the selected sort
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(38, 35, 35, 0.76)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContent: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    width: '100%',
    minHeight: 260,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#4342FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsScroller: {
    flexGrow: 0,
  },
  optionsContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 12, // Spaces options ~42px apart to match Figma spacing
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '400',
    color: '#29292C',
  },
  activeOptionText: {
    color: '#4342FF', // Highlights active sort in blue
    fontWeight: '600',
  }
});

export default SortModal;