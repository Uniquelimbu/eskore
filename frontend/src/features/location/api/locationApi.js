/**
 * Location API module for location-based data
 */

import { api } from '../../../utils/api/client';

/**
 * Get provinces/states for a country
 * @param {string} country - Country code or name
 * @returns {Promise} - API response
 */
const getProvinces = (country) => {
  return api.get(`/api/locations/provinces?country=${country}`);
};

/**
 * Get districts for a province (specific to countries like Nepal)
 * @param {string} province - Province ID or name
 * @returns {Promise} - API response
 */
const getDistricts = (province) => {
  return api.get(`/api/locations/districts?province=${province}`);
};

/**
 * Get cities based on province or district
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response
 */
const getCities = (params) => {
  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return api.get(`/api/locations/cities?${queryString}`);
};

export const locationAPI = {
  getProvinces,
  getDistricts,
  getCities
};

export default locationAPI;
