// This controller will handle location-related data for the registration form
const { ApiError } = require('../middleware/errorHandler');

exports.getProvinces = async (req, res) => {
  const { country } = req.query;
  
  if (!country) {
    throw new ApiError('Country parameter is required', 400, 'MISSING_PARAMETER');
  }
  
  // In a real implementation, fetch from database
  // For demo purposes, returning mock data
  let provinces = [];
  
  if (country === 'Nepal') {
    provinces = [
      { id: 'province1', name: 'Province 1' },
      { id: 'madhesh', name: 'Madhesh' },
      { id: 'bagmati', name: 'Bagmati' },
      { id: 'gandaki', name: 'Gandaki' },
      { id: 'lumbini', name: 'Lumbini' },
      { id: 'karnali', name: 'Karnali' },
      { id: 'sudurpaschim', name: 'Sudurpaschim' }
    ];
  } else if (country === 'Canada') {
    provinces = [
      { id: 'ab', name: 'Alberta' },
      { id: 'bc', name: 'British Columbia' },
      { id: 'mb', name: 'Manitoba' },
      { id: 'nb', name: 'New Brunswick' },
      { id: 'nl', name: 'Newfoundland and Labrador' },
      { id: 'ns', name: 'Nova Scotia' },
      { id: 'on', name: 'Ontario' },
      { id: 'pe', name: 'Prince Edward Island' },
      { id: 'qc', name: 'Quebec' },
      { id: 'sk', name: 'Saskatchewan' }
    ];
  } else {
    throw new ApiError('Unsupported country', 400, 'INVALID_PARAMETER');
  }
  
  res.status(200).json(provinces);
};

exports.getDistricts = async (req, res) => {
  const { province } = req.query;
  
  if (!province) {
    throw new ApiError('Province parameter is required', 400, 'MISSING_PARAMETER');
  }
  
  // Mock data for demonstration
  let districts = [];
  
  // Sample districts for Province 1 in Nepal
  if (province === 'province1') {
    districts = [
      { id: 'taplejung', name: 'Taplejung' },
      { id: 'sankhuwasabha', name: 'Sankhuwasabha' },
      { id: 'solukhumbu', name: 'Solukhumbu' },
      // ... more districts
    ];
  }
  // Add more provinces as needed
  
  res.status(200).json(districts);
};

exports.getCities = async (req, res) => {
  const { province, district } = req.query;
  
  if (!province && !district) {
    throw new ApiError('Province or district parameter is required', 400, 'MISSING_PARAMETER');
  }
  
  // Mock data
  let cities = [];
  
  // Different logic based on if we have district (Nepal) or just province (Canada)
  if (district) {
    // Nepal case
    if (district === 'taplejung') {
      cities = [
        { id: 'phungling', name: 'Phungling' },
        { id: 'lelep', name: 'Lelep' },
        // ... more cities
      ];
    }
  } else if (province) {
    // Canada case
    if (province === 'on') {
      cities = [
        { id: 'toronto', name: 'Toronto' },
        { id: 'ottawa', name: 'Ottawa' },
        { id: 'mississauga', name: 'Mississauga' },
        // ... more cities
      ];
    }
  }
  
  res.status(200).json(cities);
};
