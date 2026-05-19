import API from './api';

export const plantService = {
  getAllPlants: () => API.get('/plants'),

  
  getFilteredPlants: (params) => API.get('/plants', { params }),

 
  getPlantImages: (plantId) => API.get(`/imagini?plantId=${plantId}`),

  createPlant: (plantData) => API.post('/plants', plantData),
  updatePlant: (plantData) => API.put('/plants', plantData),
  deletePlant: (id) => API.delete(`/plants/${id}`)
};