import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, TextInput, BackHandler, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import FilterModal from '../components/FilterModal';
import SortModal from '../components/SortModal';
import { fetchProductsAPI } from '../utils/api';

const CATEGORY_LABELS = {
  "men's clothing": 'Men\'s clothing',
  "women's clothing": 'Women\'s clothing',
  jewelery: 'Jewellery',
  electronics: 'Electronics',
};

const GENDER_TO_CATEGORY = {
  Men: "men's clothing",
  Women: "women's clothing",
  Boys: "men's clothing",
  Girls: "women's clothing",
  Unisex: null,
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

const getCategoryLabel = (category) => {
  if (!category) {
    return 'Products';
  }

  return CATEGORY_LABELS[category] || category;
};

const getProductMeta = (product) => {
  const priceInRupees = Math.round(product.price * 83);
  const brand = product.category === "men's clothing"
    ? 'Vashions'
    : product.category === "women's clothing"
      ? 'Zudio'
      : product.category === 'jewelery'
        ? 'Aurum'
        : 'TechPro';

  const colors = ['Black', 'White', 'Blue', 'Brown', 'Red', 'Green', 'Pink', 'Beige'];
  const fabrics = ['Cotton', 'Polyester', 'Denim', 'Silk', 'Wool', 'Linen'];
  const fits = ['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Oversized'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const deliveryTimes = ['2 days delivery', '4 days delivery', '7 days delivery'];
  const discountBands = [10, 30, 50, 60];
  const seed = Number(product.id) || 0;

  return {
    priceInRupees,
    brand,
    color: colors[seed % colors.length],
    fabric: fabrics[seed % fabrics.length],
    fit: fits[seed % fits.length],
    size: sizes[seed % sizes.length],
    deliveryTime: deliveryTimes[seed % deliveryTimes.length],
    discountPercent: discountBands[seed % discountBands.length],
  };
};

const matchesPriceRange = (priceInRupees, selectedPrice) => {
  if (!selectedPrice) {
    return true;
  }

  if (selectedPrice === 'Under ₹700') {
    return priceInRupees < 700;
  }

  if (selectedPrice === '₹700 - ₹1500') {
    return priceInRupees >= 700 && priceInRupees <= 1500;
  }

  if (selectedPrice === 'Above ₹1500') {
    return priceInRupees > 1500;
  }

  return true;
};

const normalizeSearchText = (value) => String(value ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getSearchableProductText = (product) => {
  const meta = getProductMeta(product);

  return normalizeSearchText([
    product.title,
    product.category,
    product.description,
    meta.brand,
    meta.color,
    meta.fabric,
    meta.fit,
    meta.size,
    meta.deliveryTime,
    `${meta.priceInRupees}`,
  ].join(' '));
};

const ProductsScreen = ({ navigation, route }) => {
  const routeParams = route?.params ?? {};
  const initialCategory = normalizeCategoryValue(routeParams.category || routeParams.selectedCategory);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLoved, setIsLoved] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filterVisible, setFilterVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    category: initialCategory,
    gender: initialCategory ? Object.keys(GENDER_TO_CATEGORY).find((key) => GENDER_TO_CATEGORY[key] === initialCategory) || null : null,
    price: null,
    suggested: [],
    brand: [],
    fabric: [],
    fit: [],
    size: [],
    color: [],
    discounts: [],
    deliveryTime: [],
  });
  const [activeSort, setActiveSort] = useState('Newest arrivals');

  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const screenTitle = routeParams.title || getCategoryLabel(initialCategory);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    applyFiltersAndSort(products, activeFilters, activeSort, searchQuery);
  }, [products, activeFilters, activeSort, searchQuery]);

  const fetchProducts = async () => {
    try {
      const data = await fetchProductsAPI();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (baseProducts, filters, sortType, query) => {
    let result = [...baseProducts];

    const normalizedQuery = normalizeSearchText(query);

    if (normalizedQuery) {
      result = result.filter((product) => getSearchableProductText(product).includes(normalizedQuery));
    }

    const appliedCategory = normalizeCategoryValue(filters.category || GENDER_TO_CATEGORY[filters.gender]);

    if (appliedCategory) {
      result = result.filter((product) => normalizeCategoryValue(product.category) === appliedCategory);
    }

    if (filters.price) {
      result = result.filter((product) => matchesPriceRange(getProductMeta(product).priceInRupees, filters.price));
    }

    if (filters.suggested?.length) {
      result = result.filter((product) => {
        const meta = getProductMeta(product);

        return filters.suggested.every((suggestion) => {
          if (suggestion === 'Under ₹700') return meta.priceInRupees < 700;
          if (suggestion === '2 days delivery') return meta.deliveryTime === '2 days delivery';
          if (suggestion === '50% off') return meta.discountPercent >= 50;
          if (suggestion === 'Brown') return meta.color === 'Brown';
          return true;
        });
      });
    }

    const filterByMetaList = (items, key) => {
      if (!items?.length) {
        return result;
      }

      return result.filter((product) => items.includes(getProductMeta(product)[key]));
    };

    result = filterByMetaList(filters.brand, 'brand');
    result = filterByMetaList(filters.fabric, 'fabric');
    result = filterByMetaList(filters.fit, 'fit');
    result = filterByMetaList(filters.size, 'size');
    result = filterByMetaList(filters.color, 'color');
    result = filterByMetaList(filters.deliveryTime, 'deliveryTime');

    if (filters.discounts?.length) {
      result = result.filter((product) => {
        const discountPercent = getProductMeta(product).discountPercent;

        return filters.discounts.some((discountOption) => {
          if (discountOption === '10% off') return discountPercent >= 10;
          if (discountOption === '30% off') return discountPercent >= 30;
          if (discountOption === '50% off') return discountPercent >= 50;
          return false;
        });
      });
    }

    switch (sortType) {
      case 'Price - low to high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'Price - high to low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'Best sellers':
        result.sort((a, b) => b.rating.count - a.rating.count);
        break;
      case 'Offers and discounts':
      case 'Offers and dicounts':
        result.sort((a, b) => getProductMeta(b).discountPercent - getProductMeta(a).discountPercent);
        break;
      case 'Newest arrivals':
      default:
        result.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(result);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handleApplySort = (sortType) => {
    setActiveSort(sortType);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleBackPress = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }

    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4342FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* --- DYNAMIC HEADER --- */}
      <View style={styles.header}>
        {isSearchActive ? (
          // SEARCH MODE
          <View style={styles.searchActiveRow}>
            <TouchableOpacity onPress={closeSearch} style={styles.headerIcon}>
              <Ionicons name="chevron-back" size={28} color="#29292C" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#9B9B9B"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />
            
            <TouchableOpacity onPress={closeSearch} style={styles.headerIcon}>
              <Ionicons name="close-circle" size={24} color="#29292C" />
            </TouchableOpacity>
          </View>
        ) : (
          // NORMAL MODE
          <>
            <TouchableOpacity onPress={handleBackPress} style={styles.headerIcon}>
              <Ionicons name="chevron-back" size={28} color="#29292C" />
            </TouchableOpacity>
            
            <View style={styles.titleWrapper}>
              <Image
                source={require('../../assets/v.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
               <Text style={styles.headerTitle}>T-shirts</Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.actionIcon} onPress={() => setIsSearchActive(true)}>
                 <Ionicons name="search-outline" size={24} color="#29292C" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionIcon} onPress={() => setIsLoved(!isLoved)}>
                 <Ionicons 
                    name={isLoved ? "heart" : "heart-outline"} 
                    size={24} 
                    color={isLoved ? "#DB3022" : "#29292C"} 
                 />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionIcon} onPress={() => navigation.navigate('Bag')}>
                 <Ionicons name="bag-outline" size={24} color="#29292C" />
                 {cartCount > 0 && (
                   <View style={styles.cartBadge}>
                     <Text style={styles.cartBadgeText}>{cartCount}</Text>
                   </View>
                 )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* --- SUBHEADER RESULTS TEXT --- */}
      <Text style={styles.resultsText}>
        Showing {filteredProducts.length} results for {searchQuery ? `"${searchQuery}"` : screenTitle}
      </Text>

      {/* --- PRODUCT GRID --- */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptySearchText}>No products match your search or filters.</Text>}
      />

      {/* --- FLOATING SORT & FILTER BAR --- */}
      <View style={styles.floatingBarContainer}>
        <View style={styles.floatingBar}>
          
          <TouchableOpacity style={styles.barAction} onPress={() => setSortVisible(true)}>
            <MaterialCommunityIcons name="sort" size={26} color="#4342FF" />
            <Text style={styles.barText}>Sort by</Text>
            {activeSort !== 'Newest arrivals' && <View style={styles.activeDot} />}
          </TouchableOpacity>
          
          <View style={styles.barDivider} />

          <TouchableOpacity style={styles.barAction} onPress={() => setFilterVisible(true)}>
            <MaterialCommunityIcons name="filter-variant" size={24} color="#4342FF" />
            <Text style={styles.barText}>Filters</Text>
            {(activeFilters.gender || activeFilters.suggested.length > 0) && <View style={styles.activeDot} />}
          </TouchableOpacity>
          
        </View>
      </View>

      {/* --- MODALS --- */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={handleApplyFilters}
        currentCategory={activeFilters.category || initialCategory}
        currentFilters={activeFilters}
      />

      <SortModal 
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        onSelectSort={handleApplySort}
        currentSort={activeSort}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    height: Platform.OS === 'ios' ? 115 : 90,
    backgroundColor: '#F0F2F4',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 15,
    shadowColor: 'rgba(229, 229, 241, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  searchActiveRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    fontFamily: 'League Spartan',
    fontSize: 16,
    color: '#29292C',
    borderWidth: 1,
    borderColor: '#D8D8DF',
  },
  headerIcon: {
    paddingBottom: 4,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  headerLogo: {
    width: 48,
    height: 31,
    marginRight: 4,
  },
  headerTitle: {
    fontFamily: 'League Spartan',
    fontSize: 28,
    fontWeight: '500',
    color: '#29292C',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 16,
    position: 'relative',
    paddingBottom: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: 16,
    height: 16,
    backgroundColor: '#4342FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontFamily: 'League Spartan',
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  resultsText: {
    fontFamily: 'League Spartan',
    fontSize: 16,
    fontWeight: '400',
    color: '#505050',
    marginTop: 18,
    marginHorizontal: 22,
    marginBottom: 10,
  },
  emptySearchText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    color: '#676769',
    textAlign: 'center',
    marginTop: 50,
  },
  listContainer: { 
    paddingHorizontal: 22,
    paddingBottom: 120, 
  },
  rowWrapper: {
    justifyContent: 'space-between',
  },
  floatingBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 42 : 34,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '90%',
    maxWidth: 371,
    height: 48,
    backgroundColor: '#FAFAFA',
    borderWidth: 0.3,
    borderColor: 'rgba(170, 170, 213, 0.4)',
    borderRadius: 24,
    shadowColor: 'rgba(229, 229, 241, 0.5)',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  barAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  barText: {
    fontFamily: 'League Spartan',
    fontSize: 18,
    fontWeight: '400',
    color: '#29292C',
    marginLeft: 8,
  },
  barDivider: {
    height: 32,
    width: 2,
    backgroundColor: '#4342FF',
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    right: 12,
    width: 6,
    height: 6,
    backgroundColor: '#4342FF',
    borderRadius: 3,
  }
});

export default ProductsScreen;