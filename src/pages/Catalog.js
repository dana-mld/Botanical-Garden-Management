import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PlantDetails from './PlantDetails';
import API from '../api';

const Catalog = () => {
  const { t } = useTranslation();
  const [plants, setPlants] = useState([]);
  const [allExemplars, setAllExemplars] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTip, setFilterTip] = useState('');
  const [filterSpecie, setFilterSpecie] = useState('');
  const [filterZona, setFilterZona] = useState('');
  const [filterCarnivora, setFilterCarnivora] = useState('toate');
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueSpecies, setUniqueSpecies] = useState([]);
  const [uniqueZones, setUniqueZones] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ denumire: '', specie: '', tip: '', carnivora: false });

  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId') || 1;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterTip) params.append('tip', filterTip);
      if (filterSpecie) params.append('specie', filterSpecie);
      if (filterCarnivora !== 'toate') params.append('carnivora', filterCarnivora === 'da');
      if (filterZona) params.append('zona', filterZona);
      
      const url = `/plants${params.toString() ? `?${params.toString()}` : ''}`;
      const resPlants = await API.get(url);
      const dataPlants = resPlants.data;
      setPlants(dataPlants);

      const types = [...new Set(dataPlants.map(p => p.tip).filter(t => t))].sort();
      setUniqueTypes(types);
      
      const species = [...new Set(dataPlants.map(p => p.specie).filter(s => s))].sort();
      setUniqueSpecies(species);

      const resImages = await API.get('/imagini');
      setAllImages(resImages.data);
      
      const resExemplars = await API.get('/exemplars');
      const dataExemplars = resExemplars.data;
      setAllExemplars(dataExemplars);
      
      const zones = [...new Set(dataExemplars.map(e => e.zonaGradina).filter(z => z))].sort();
      setUniqueZones(zones);
      
    } catch (err) {
      console.error("Eroare la încărcare:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterTip, filterSpecie, filterCarnivora, filterZona]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterTip('');
    setFilterSpecie('');
    setFilterZona('');
    setFilterCarnivora('toate');
  };

  const getPlantImages = (plantId) => {
    const normalizedPlantId = typeof plantId === 'object' ? plantId.id : parseInt(plantId);
    
    const plantExemplars = allExemplars.filter(e => {
      const ePlantId = e.plantId && typeof e.plantId === 'object'
        ? e.plantId.id
        : parseInt(e.plantId);
      return ePlantId === normalizedPlantId;
    });
    
    const exemplarIds = plantExemplars.map(e =>
      e.id && typeof e.id === 'object' ? e.id.id : parseInt(e.id)
    );
    
    const images = allImages.filter(img => exemplarIds.includes(img.exemplarId));
    
    return images.slice(0, 3);
  };

 
const handleSavePlant = async (e) => {
  e.preventDefault();
  
  const hasValidId = formData.id && formData.id !== 'null' && formData.id !== 'undefined';
  const method = hasValidId ? 'PUT' : 'POST';

  const plantData = {
    denumire: formData.denumire || '',
    specie: formData.specie || '',
    tip: formData.tip || '',
    carnivora: formData.carnivora === true || formData.carnivora === 'true'
  };
  
  if (hasValidId) {
    plantData.id = { id: parseInt(formData.id) };
  }
  
  console.log("Saving plant - method:", method, "data:", plantData);
  
  try {
    const response = await API[method === 'PUT' ? 'put' : 'post']('/plants', plantData);
    if (response.status === 200 || response.status === 201) {
      alert(hasValidId ? "Plantă actualizată!" : "Plantă adăugată!");
      resetForm();
      loadData();
    }
  } catch (err) {
    console.error("Save error:", err);
    alert("Eroare la salvare!");
  }
};

const resetForm = () => {
  setFormData({ 
    id: null,  
    denumire: '', 
    specie: '', 
    tip: '', 
    carnivora: false 
  });
  setIsEditing(false);
  setShowAddForm(false);
};
const startEdit = (plant) => {
  setFormData({
    id: plant.id?.id || plant.id,  
    denumire: plant.denumire || '',
    specie: plant.specie || '',
    tip: plant.tip || '',
    carnivora: plant.carnivora || false
  });
  setIsEditing(true);
  setShowAddForm(true);
};


  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await API.delete(`/plants/${id}`);
      loadData();
    } catch (err) {
      alert("Eroare! Planta ar putea avea exemplare asociate.");
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await API.post('/exports', {
        userId: parseInt(userId),
        format: format,
        status: "PENDING"
      });
      if (response.status === 200 || response.status === 201) {
        alert(t('exportSuccess') + ' Fișierul va fi generat în background.');
      }
    } catch (err) {
      alert(t('exportFailed'));
    }
  };

  if (selectedPlant) return <PlantDetails plant={selectedPlant} onBack={() => setSelectedPlant(null)} />;
  if (loading) return <p>{t('loading')}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ color: '#2e7d32', margin: 0 }}>🌿 {t('catalog')}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(userRole === 'EMPLOYEE' || userRole === 'MANAGER') && (
            <select onChange={(e) => handleExport(e.target.value)} defaultValue="" style={{ padding: '8px', borderRadius: '5px' }}>
              <option value="" disabled>{t('export')}</option>
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
              <option value="XML">XML</option>
              <option value="DOC">DOC</option>
            </select>
          )}
          {(userRole === 'EMPLOYEE' || userRole === 'MANAGER') && (
            <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#2e7d32', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {showAddForm ? '❌' : '+ '}{showAddForm ? t('cancel') : t('addPlant')}
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '25px' }}>
          <h3>{isEditing ? t('editPlant') : t('addPlant')}</h3>
          <form onSubmit={handleSavePlant} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input placeholder={t('name')} value={formData.denumire || ''} onChange={e => setFormData({...formData, denumire: e.target.value})} required style={{ padding: '8px' }} />
            <input placeholder={t('species')} value={formData.specie || ''} onChange={e => setFormData({...formData, specie: e.target.value})} required style={{ padding: '8px' }} />
            <input placeholder={t('type')} value={formData.tip || ''} onChange={e => setFormData({...formData, tip: e.target.value})} required style={{ padding: '8px' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={formData.carnivora || false} onChange={e => setFormData({...formData, carnivora: e.target.checked})} /> {t('carnivorous')}
            </label>
            <button type="submit" style={{ gridColumn: 'span 2', background: '#2e7d32', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              {isEditing ? t('save') : t('create')}
            </button>
          </form>
        </div>
      )}

      <div style={{ background: '#f1f8e9', padding: '15px', borderRadius: '10px', marginBottom: '25px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder={t('search')} value={searchTerm} style={{ flex: 2, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={filterTip} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} onChange={(e) => setFilterTip(e.target.value)}>
          <option value="">{t('filterByType')}</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterSpecie} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} onChange={(e) => setFilterSpecie(e.target.value)}>
          <option value="">{t('filterBySpecies')}</option>
          {uniqueSpecies.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterZona} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} onChange={(e) => setFilterZona(e.target.value)}>
          <option value="">{t('filterByZone')}</option>
          {uniqueZones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <select value={filterCarnivora} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} onChange={(e) => setFilterCarnivora(e.target.value)}>
          <option value="toate">{t('all')}</option>
          <option value="da">{t('carnivorous')}</option>
          <option value="nu">{t('nonCarnivorous')}</option>
        </select>
        <button onClick={resetFilters} style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          🔄 {t('reset')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
        {plants.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#999' }}>Nu există plante în această categorie</p>
        ) : (
          plants.map(plant => {
            const plantId = plant.id?.id || plant.id;
            const plantImages = getPlantImages(plantId);

            return (
              <div key={plantId} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '12px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', justifyContent: 'center' }}>
                  {plantImages.length > 0 ? (
                    plantImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:8080/api/imagini/view/${img.caleFisier}`}
                        alt={plant.denumire}
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/90?text=No+Image'; }}
                      />
                    ))
                  ) : (
                    <div style={{ width: '90px', height: '90px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '40px' }}>🌿</span>
                    </div>
                  )}
                </div>

                <h3 style={{ margin: '0 0 5px 0', color: '#1b5e20' }}>{plant.denumire}</h3>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px', fontStyle: 'italic' }}>{plant.specie}</p>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>{t('type')}: <b>{plant.tip}</b></p>
                {plant.carnivora && <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>🦖 {t('carnivorous')}</span>}
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button onClick={() => setSelectedPlant(plant)} style={{ flex: 2, padding: '8px', background: '#e8f5e9', border: '1px solid #2e7d32', color: '#2e7d32', borderRadius: '5px', cursor: 'pointer' }}>
                    {t('details')}
                  </button>
                  {(userRole === 'EMPLOYEE' || userRole === 'MANAGER') && (
                    <>
                      <button onClick={() => startEdit(plant)} style={{ flex: 1, background: '#ffa000', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✏️</button>
                      <button onClick={() => handleDelete(plantId)} style={{ flex: 1, background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Catalog;