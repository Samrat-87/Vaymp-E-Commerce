import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#DB3022', // Standard e-commerce red (adjust to Figma hex)
  background: '#F9F9F9',
  white: '#FFFFFF',
  black: '#222222',
  gray: '#9B9B9B',
  lightGray: '#F0F0F0',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  width,
  height,
};

export const SHADOWS = {
  card: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};