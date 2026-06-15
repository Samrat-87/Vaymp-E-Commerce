import axios from 'axios';

const API_URL = 'https://fakestoreapi.com';

export const fetchProductsAPI = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const fetchCategoriesAPI = async () => {
  const response = await axios.get(`${API_URL}/products/categories`);
  return response.data;
};