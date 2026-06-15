import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';

const menuTabs = [
  'Suggested filters',
  'Category',
  'Gender',
  'Price',
  'Brand',
  'Fabric',
  'Fit',
  'Size',
  'Color',
  'Discounts',
  'Delivery time',
];

const categoryOptions = [
  { label: 'All', value: null },
  { label: 'Men', value: "men's clothing" },
  { label: 'Women', value: "women's clothing" },
  { label: 'Jewellery', value: 'jewelery' },
  { label: 'Electronics', value: 'electronics' },
];

const genderOptions = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
const suggestedOptions = ['2 days delivery', 'Under ₹700', '50% off', 'Brown'];
const priceOptions = ['Under ₹700', '₹700 - ₹1500', 'Above ₹1500'];
const brandOptions = ['Vashions', 'Zudio', 'Aurum', 'TechPro'];
const fabricOptions = ['Cotton', 'Polyester', 'Denim', 'Silk', 'Wool', 'Linen'];
const fitOptions = ['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Oversized'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
const colorOptions = ['Black', 'White', 'Blue', 'Brown', 'Red', 'Green', 'Pink', 'Beige'];
const discountOptions = ['10% off', '30% off', '50% off'];
const deliveryOptions = ['2 days delivery', '4 days delivery', '7 days delivery'];

const genderToCategory = {
  Men: "men's clothing",
  Women: "women's clothing",
  Boys: "men's clothing",
  Girls: "women's clothing",
  Unisex: null,
};

const categoryToGender = {
  "men's clothing": 'Men',
  "women's clothing": 'Women',
};

const normalizeCategoryValue = (value) => {
  if (!value) {
    return null;
  }

  const normalized = String(value).toLowerCase().trim();

  if (normalized.includes('women')) return "women's clothing";
  if (normalized.includes('men')) return "men's clothing";
  if (normalized.includes('jewel')) return 'jewelery';
  if (normalized.includes('electronic')) return 'electronics';

  return normalized;
};

const FilterModal = ({ visible, onClose, onApply, currentCategory, currentFilters = {} }) => {
  const [activeTab, setActiveTab] = useState('Suggested filters');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedSuggested, setSelectedSuggested] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState([]);
  const [selectedFit, setSelectedFit] = useState([]);
  const [selectedSize, setSelectedSize] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState([]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const normalizedCategory = normalizeCategoryValue(currentFilters.category || currentCategory);

    setSelectedCategory(normalizedCategory);
    setSelectedGender(currentFilters.gender || categoryToGender[normalizedCategory] || null);
    setSelectedPrice(currentFilters.price || null);
    setSelectedSuggested(currentFilters.suggested || []);
    setSelectedBrand(currentFilters.brand || []);
    setSelectedFabric(currentFilters.fabric || []);
    setSelectedFit(currentFilters.fit || []);
    setSelectedSize(currentFilters.size || []);
    setSelectedColor(currentFilters.color || []);
    setSelectedDiscounts(currentFilters.discounts || []);
    setSelectedDeliveryTime(currentFilters.deliveryTime || []);
    setActiveTab(normalizedCategory ? 'Category' : 'Suggested filters');
  }, [visible, currentCategory, currentFilters]);

  const toggleValue = (value, selectedValues, setSelectedValues) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
      return;
    }

    setSelectedValues([...selectedValues, value]);
  };

  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    setSelectedGender(categoryToGender[value] || null);
  };

  const handleGenderSelect = (value) => {
    setSelectedGender(value);
    setSelectedCategory(genderToCategory[value]);
  };

  const handleClearAll = () => {
    const normalizedCategory = normalizeCategoryValue(currentCategory);

    setSelectedCategory(normalizedCategory);
    setSelectedGender(categoryToGender[normalizedCategory] || null);
    setSelectedPrice(null);
    setSelectedSuggested([]);
    setSelectedBrand([]);
    setSelectedFabric([]);
    setSelectedFit([]);
    setSelectedSize([]);
    setSelectedColor([]);
    setSelectedDiscounts([]);
    setSelectedDeliveryTime([]);
    setActiveTab(normalizedCategory ? 'Category' : 'Suggested filters');
  };

  const handleApply = () => {
    onApply?.({
      category: selectedCategory,
      gender: selectedGender,
      price: selectedPrice,
      suggested: selectedSuggested,
      brand: selectedBrand,
      fabric: selectedFabric,
      fit: selectedFit,
      size: selectedSize,
      color: selectedColor,
      discounts: selectedDiscounts,
      deliveryTime: selectedDeliveryTime,
    });
    onClose();
  };

  const renderChip = (label, isActive, onPress) => (
    <TouchableOpacity
      key={label}
      style={[styles.pillChip, isActive && styles.pillChipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.pillChipText, isActive && styles.pillChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const subtitleByTab = {
    'Suggested filters': 'Choose the quickest shortcuts to narrow results',
    Category: 'Pick the product category to browse',
    Gender: 'Select the matching gender filter',
    Price: 'Choose a price bucket',
    Brand: 'Pick one or more brands',
    Fabric: 'Filter by fabric type',
    Fit: 'Choose the fit you want',
    Size: 'Select available sizes',
    Color: 'Choose product colors',
    Discounts: 'Select discount thresholds',
    'Delivery time': 'Choose the delivery speed',
  };

  const renderTabContent = () => {
    if (activeTab === 'Suggested filters') {
      return suggestedOptions.map((option) =>
        renderChip(option, selectedSuggested.includes(option), () => toggleValue(option, selectedSuggested, setSelectedSuggested))
      );
    }

    if (activeTab === 'Category') {
      return categoryOptions.map((option) =>
        renderChip(option.label, selectedCategory === option.value, () => handleCategorySelect(option.value))
      );
    }

    if (activeTab === 'Gender') {
      return genderOptions.map((option) =>
        renderChip(option, selectedGender === option, () => handleGenderSelect(option))
      );
    }

    if (activeTab === 'Price') {
      return priceOptions.map((option) => renderChip(option, selectedPrice === option, () => setSelectedPrice(option)));
    }

    if (activeTab === 'Brand') {
      return brandOptions.map((option) =>
        renderChip(option, selectedBrand.includes(option), () => toggleValue(option, selectedBrand, setSelectedBrand))
      );
    }

    if (activeTab === 'Fabric') {
      return fabricOptions.map((option) =>
        renderChip(option, selectedFabric.includes(option), () => toggleValue(option, selectedFabric, setSelectedFabric))
      );
    }

    if (activeTab === 'Fit') {
      return fitOptions.map((option) =>
        renderChip(option, selectedFit.includes(option), () => toggleValue(option, selectedFit, setSelectedFit))
      );
    }

    if (activeTab === 'Size') {
      return sizeOptions.map((option) =>
        renderChip(option, selectedSize.includes(option), () => toggleValue(option, selectedSize, setSelectedSize))
      );
    }

    if (activeTab === 'Color') {
      return colorOptions.map((option) =>
        renderChip(option, selectedColor.includes(option), () => toggleValue(option, selectedColor, setSelectedColor))
      );
    }

    if (activeTab === 'Discounts') {
      return discountOptions.map((option) =>
        renderChip(option, selectedDiscounts.includes(option), () => toggleValue(option, selectedDiscounts, setSelectedDiscounts))
      );
    }

    if (activeTab === 'Delivery time') {
      return deliveryOptions.map((option) =>
        renderChip(option, selectedDeliveryTime.includes(option), () => toggleValue(option, selectedDeliveryTime, setSelectedDeliveryTime))
      );
    }

    return <Text style={styles.placeholderText}>Select options</Text>;
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
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheetContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.headerTitle}>Filters</Text>
            <Text style={styles.headerSubtitle}>{subtitleByTab[activeTab]}</Text>
          </View>

          <View style={styles.splitBody}>
            <View style={styles.leftPanel}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {menuTabs.map((tab, index) => {
                  const isActive = activeTab === tab;

                  return (
                    <View key={tab}>
                      <TouchableOpacity
                        style={[styles.tabItemButton, isActive && styles.tabItemButtonActive]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.8}
                      >
                        {isActive && <View style={styles.activeVerticalBar} />}
                        <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>{tab}</Text>
                      </TouchableOpacity>
                      {index < menuTabs.length - 1 && <View style={styles.menuLineSeparator} />}
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.rightPanel}>
              <ScrollView contentContainerStyle={styles.chipsScrollGrid} showsVerticalScrollIndicator={false}>
                {renderTabContent()}
              </ScrollView>
            </View>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll} activeOpacity={0.8}>
              <Text style={styles.clearButtonText}>Clear all</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>Apply filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, // GUARANTEES 100% coverage top-to-bottom
    backgroundColor: 'rgba(38, 35, 35, 0.76)',
    justifyContent: 'flex-end', // Pushes the sheet strictly to the bottom edge
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContent: {
    width: '100%',     
    height: '75%', // Set to '100%' if you want it to cover the entire screen to the top    
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontFamily: 'League Spartan',
    fontSize: 20,
    fontWeight: '500',
    color: '#4342FF',
    lineHeight: 18,
  },
  headerSubtitle: {
    fontFamily: 'League Spartan',
    fontSize: 16,
    fontWeight: '400',
    color: '#29292C',
    marginTop: 6,
    lineHeight: 18,
  },
  splitBody: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: '40%',      
    backgroundColor: '#F0F2F4',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tabItemButton: {
    height: 48,
    justifyContent: 'center',
    paddingLeft: '15%', 
    position: 'relative',
  },
  tabItemButtonActive: {
    backgroundColor: '#FAFAFA',
  },
  activeVerticalBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#4342FF',
  },
  tabItemText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '400',
    color: '#29292C',
  },
  tabItemTextActive: {
    color: '#4342FF',
  },
  menuLineSeparator: {
    height: 1,
    backgroundColor: '#DDDDEB',
    marginHorizontal: 12,
  },
  chipsScrollGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 24,
  },
  pillChip: {
    height: 28,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8D8DF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: Platform.OS === 'android' ? 6 : 0, 
    marginBottom: Platform.OS === 'android' ? 8 : 0,
  },
  pillChipActive: {
    borderColor: '#4342FF',
  },
  pillChipText: {
    fontFamily: 'League Spartan',
    fontSize: 16,
    fontWeight: '400',
    color: '#29292C',
  },
  pillChipTextActive: {
    color: '#29292C',
  },
  placeholderText: {
    fontFamily: 'League Spartan',
    fontSize: 14,
    color: '#676769',
    textAlign: 'center',
    marginTop: 20,
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Ensures safety around iOS home indicator
    paddingTop: 12,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
  },
  clearButton: {
    flex: 1,           
    height: 44,        
    borderWidth: 1,
    borderColor: '#4342FF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(229, 229, 241, 0.4)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    marginRight: 8, 
  },
  clearButtonText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '400',
    color: '#29292C',
  },
  applyButton: {
    flex: 1,           
    height: 44,
    backgroundColor: '#4342FF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.4,
    borderColor: 'rgba(126, 126, 137, 0.4)',
    marginLeft: 8, 
  },
  applyButtonText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '400',
    color: '#FFFFFF',
  },
});

export default FilterModal;