import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';

const PlantDetails = ({ plant, onBack }) => {
  const { t } = useTranslation();
  const [exemplars, setExemplars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExForm, setShowExForm] = useState(false);
  const [editingEx, setEditingEx] = useState(null);
  const [exFormData, setExFormData] = useState({ zonaGradina: '' });
  const [uploadingFor, setUploadingFor] = useState(null);

  const userRole = localStorage.getItem('role');
  const canEdit = userRole === 'EMPLOYEE' || userRole === 'MANAGER';

  const fetchExemplars = async () => {
    setLoading(true);
    try {
      const plantId = plant.id?.id || plant.id;
      const resEx = await API.get(`/exemplars?plantId=${plantId}`);
      const exList = resEx.data;

      const exWithImages = await Promise.all(
        exList.map(async (ex) => {
          const exId = ex.id?.id || ex.id;
          try {
            const resImg = await API.get(`/imagini?exemplarId=${exId}`);
            return { ...ex, images: resImg.data };
          } catch {
            return { ...ex, images: [] };
          }
        })
      );

      setExemplars(exWithImages);
    } catch (err) {
      console.error("Eroare la preluarea exemplarelor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plant && plant.id) fetchExemplars();
  }, [plant]);

  const handleSaveExemplar = async (e) => {
    e.preventDefault();
    const method = editingEx ? 'PUT' : 'POST';
    const body = {
      ...exFormData,
      plantId: plant.id?.id || plant.id,
      id: editingEx ? editingEx.id : null
    };

    try {
      const response = await API[method === 'PUT' ? 'put' : 'post']('/exemplars', body);
      if (response.status === 200 || response.status === 201) {
        setShowExForm(false);
        setEditingEx(null);
        setExFormData({ zonaGradina: '' });
        fetchExemplars();
      }
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleDeleteEx = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await API.delete(`/imagini/exemplar/${id}`);
      await API.delete(`/exemplars/${id}`);
      fetchExemplars();
    } catch (err) {
      alert(t('error'));
    }
  };

  const handleUploadImage = async (e, exemplarId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('exemplarId', exemplarId);

    try {
      setUploadingFor(exemplarId);
      await API.post('/imagini/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchExemplars();
    } catch (err) {
      alert(t('error'));
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await API.delete(`/imagini/${imageId}`);
      fetchExemplars();
    } catch (err) {
      alert(t('error'));
    }
  };

  const startEditEx = (ex) => {
    setEditingEx(ex);
    setExFormData({ zonaGradina: ex.zonaGradina });
    setShowExForm(true);
  };

  const isEditingThis = (exId) => {
    if (!editingEx) return false;
    const editingId = editingEx.id?.id || editingEx.id;
    return editingId === exId;
  };

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          ⬅ {t('back')}
        </button>
        {canEdit && (
          <button
            onClick={() => { setShowExForm(!showExForm); setEditingEx(null); setExFormData({ zonaGradina: '' }); }}
            style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
          >
            {showExForm && !editingEx ? '❌ ' + t('cancel') : '+ ' + t('addExemplar')}
          </button>
        )}
      </div>

      <h2 style={{ borderBottom: '2px solid #2e7d32', paddingBottom: '10px' }}>
        {t('exemplars')}: <span style={{ color: '#2e7d32' }}>{plant.denumire}</span>
      </h2>

      {/* Formular adăugare/editare exemplar */}
      {showExForm && (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <h3>{editingEx ? t('editExemplar') : t('addExemplar')}</h3>
          <form onSubmit={handleSaveExemplar} style={{ display: 'flex', gap: '10px' }}>
            <input
              placeholder={t('zone')}
              value={exFormData.zonaGradina}
              onChange={e => setExFormData({ ...exFormData, zonaGradina: e.target.value })}
              required
              style={{ padding: '8px', flex: 1 }}
            />
            <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '5px' }}>
              {t('save')}
            </button>
            <button type="button" onClick={() => { setShowExForm(false); setEditingEx(null); setExFormData({ zonaGradina: '' }); }}
              style={{ background: '#999', color: 'white', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: '5px' }}>
              {t('cancel')}
            </button>
          </form>
        </div>
      )}

      {}
      <div style={{ display: 'grid', gap: '20px' }}>
        {exemplars.length === 0 ? (
          <p>{t('noExemplars')}</p>
        ) : (
          exemplars.map(ex => {
            const exId = ex.id?.id || ex.id;
            const editing = isEditingThis(exId);

            return (
              <div key={exId} style={{ border: `2px solid ${editing ? '#ffa000' : '#ddd'}`, padding: '15px', borderRadius: '10px', background: '#fff', transition: 'border 0.2s' }}>

                {}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>📍 {t('zone')}: {ex.zonaGradina}</h4>
                  {canEdit && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => startEditEx(ex)} style={{ background: '#ffa000', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                        ✏️ {t('edit')}
                      </button>
                      <button onClick={() => handleDeleteEx(exId)} style={{ background: '#d32f2f', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                        🗑️ {t('delete')}
                      </button>
                    </div>
                  )}
                </div>

                {}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {ex.images && ex.images.length > 0 ? (
                    ex.images.map(img => {
                      const imgId = img.id?.id || img.id;
                      return (
                        <div key={imgId} style={{ position: 'relative' }}>
                          <img
                            src={`http://localhost:8080/api/imagini/view/${img.caleFisier}`}
                            alt={img.descriere || plant.denumire}
                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: editing ? '2px solid #ffa000' : 'none' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/120?text=No+Image'; }}
                          />
                          {}
                          {editing && (
                            <button
                              onClick={() => handleDeleteImage(imgId)}
                              style={{ position: 'absolute', top: '3px', right: '3px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: '#999', fontSize: '14px' }}>📷 {t('noImages') || 'Fără imagini'}</p>
                  )}
                </div>

                {}
                {editing && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ cursor: 'pointer', background: '#e3f2fd', border: '1px dashed #2196f3', padding: '6px 12px', borderRadius: '5px', fontSize: '13px', color: '#1565c0', display: 'inline-block' }}>
                      {uploadingFor === exId ? t('uploading') : `📷 + ${t('addImage')}`}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleUploadImage(e, exId)}
                        disabled={uploadingFor === exId}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlantDetails;