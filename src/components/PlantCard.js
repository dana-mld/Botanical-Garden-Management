import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';

const PlantCard = ({ plant }) => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const exemplarsResponse = await API.get(`/exemplars?plantId=${plant.id?.id}`);
        const exemplars = exemplarsResponse.data;
        
        if (exemplars.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }
        
        const allImagesResponse = await API.get('/imagini');
        const allImages = allImagesResponse.data;
        
        const exemplarIds = exemplars.map(ex => ex.id?.id || ex.id);
        const plantImages = allImages.filter(img => exemplarIds.includes(img.exemplarId));
        
        setImages(plantImages.slice(0, 3));
      } catch (err) {
        console.error("Error loading images for plant:", plant.denumire, err);
      } finally {
        setLoading(false);
      }
    };
    
    if (plant && plant.id) {
      fetchImages();
    }
  }, [plant.id?.id, plant.denumire]);

  const getImageUrl = (fileName) => {
    if (!fileName) return null;
    return `http://localhost:8080/api/imagini/view/${fileName}`;
  };

  if (loading) {
    return (
      <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '8px', width: '250px' }}>
        <div style={{ height: '150px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span>{t('loading')}</span>
        </div>
        <h3>{plant.denumire}</h3>
        <p><i>{plant.specie}</i></p>
        <p>Tip: {plant.tip}</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px', borderRadius: '8px', width: '250px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      {}
      <div style={{ height: '150px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '5px' }}>
        {images.length > 0 && images[0].caleFisier ? (
          <img 
            src={getImageUrl(images[0].caleFisier)} 
            alt={plant.denumire} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
          />
        ) : (
          <span style={{ fontSize: '48px' }}>🌿</span>
        )}
      </div>
      
      <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{plant.denumire}</h3>
      <p style={{ margin: '0 0 5px 0', color: '#666', fontStyle: 'italic', fontSize: '14px' }}>{plant.specie}</p>
      <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>{t('type')}: <b>{plant.tip}</b></p>
      {plant.carnivora && <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>🦖 {t('carnivorous')}</span>}
      
      {}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          {images.slice(1, 3).map((img, idx) => (
            img.caleFisier ? (
              <img 
                key={idx}
                src={getImageUrl(img.caleFisier)}
                alt={`${plant.denumire} ${idx + 2}`}
                style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/35?text=No+Image'; }}
              />
            ) : (
              <div key={idx} style={{ width: '35px', height: '35px', background: '#ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🌿
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantCard;