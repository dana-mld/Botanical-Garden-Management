import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api';

const StatisticsPanel = () => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await API.get('/statistics/all');
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const exportToWord = async () => {
    setExporting(true);
    try {
      const response = await API.post('/exports/statistics', null, {
        params: { format: 'DOCX' },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statistics_report_${new Date().toISOString().slice(0, 19)}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert(t('exportSuccess'));
    } catch (err) {
      console.error("Export error:", err);
      alert(t('exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <p>{t('loading')}</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!statistics) return <p>{t('noData')}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{t('statistics')}</h2>
        <button 
          onClick={exportToWord}
          disabled={exporting}
          style={{ background: '#2e7d32', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: exporting ? 'not-allowed' : 'pointer' }}
        >
          {exporting ? t('generating') : '📄 ' + t('exportWord')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
        {/* Grafic 1 - Distribuție pe tipuri */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: '#fff' }}>
          <h3 style={{ textAlign: 'center' }}>📊 {t('distributionByType')}</h3>
          {statistics.distributionByType?.chartImage ? (
            <img 
              src={`data:image/png;base64,${statistics.distributionByType.chartImage}`} 
              alt="Distribution by type"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <p>{t('chartUnavailable')}</p>
          )}
          <div style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
            <p><strong>{t('totalPlants')}:</strong> {statistics.distributionByType?.total || 0}</p>
            <p><strong>{t('distinctTypes')}:</strong> {statistics.distributionByType?.labels?.length || 0}</p>
          </div>
        </div>

        {/* Grafic 2 - Carnivore vs Necarnivore */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: '#fff' }}>
          <h3 style={{ textAlign: 'center' }}>🦖 {t('carnivorousVsNonCarnivorous')}</h3>
          {statistics.carnivorousVsNonCarnivorous?.chartImage ? (
            <img 
              src={`data:image/png;base64,${statistics.carnivorousVsNonCarnivorous.chartImage}`} 
              alt="Carnivorous vs Non-carnivorous"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <p>{t('chartUnavailable')}</p>
          )}
          <div style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
            <p><strong>🦖 {t('carnivorous')}:</strong> {statistics.carnivorousVsNonCarnivorous?.data?.[0] || 0} 
               ({statistics.carnivorousVsNonCarnivorous?.carnivorousPercentage?.toFixed(1) || 0}%)</p>
            <p><strong>🌱 {t('nonCarnivorous')}:</strong> {statistics.carnivorousVsNonCarnivorous?.data?.[1] || 0} 
               ({(100 - (statistics.carnivorousVsNonCarnivorous?.carnivorousPercentage || 0)).toFixed(1)}%)</p>
          </div>
        </div>

        {/* Grafic 3 - Top Specii */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: '#fff' }}>
          <h3 style={{ textAlign: 'center' }}>🏆 {t('topSpecies')}</h3>
          {statistics.topSpecies?.chartImage ? (
            <img 
              src={`data:image/png;base64,${statistics.topSpecies.chartImage}`} 
              alt="Top species"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <p>{t('chartUnavailable')}</p>
          )}
          <div style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
            <p><strong>🏆 {t('topSpeciesLabel')}:</strong> {statistics.topSpecies?.labels?.[0] || '-'} ({statistics.topSpecies?.data?.[0] || 0} {t('plantsCount')})</p>
            <p><strong>{t('totalSpecies')}:</strong> {statistics.topSpecies?.totalSpecies || 0}</p>
          </div>
        </div>
      </div>

      {/* Rezumat General */}
      <div style={{ marginTop: '25px', padding: '20px', background: '#e8f5e9', borderRadius: '10px' }}>
        <h3>📈 {t('generalSummary')}</h3>
        <p><strong>{t('totalPlants')}:</strong> {statistics.totalPlants || 0}</p>
        <p><strong>{t('lastUpdate')}:</strong> {new Date(statistics.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default StatisticsPanel;