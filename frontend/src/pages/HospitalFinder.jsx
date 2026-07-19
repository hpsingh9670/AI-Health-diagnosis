import { useState, useEffect } from 'react';
import { hospitalsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { MapPin, Phone, Star, Clock, AlertCircle, Navigation } from 'lucide-react';

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center]);
  return null;
}

function HospitalCard({ h, onClick, selected }) {
  return (
    <div
      className="card"
      style={{
        marginBottom: 12, cursor: 'pointer', padding: '16px',
        border: selected ? '2px solid var(--primary)' : '1px solid var(--border)',
        transition: 'all 0.2s'
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{h.name}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {h.emergency && <span className="badge badge-danger">🚨 Emergency</span>}
            <span className="badge badge-info">{h.type}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{h.distance_text}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> Car: {h.travel_time_car}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          🚶 Walk: {h.travel_time_walking}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Phone size={12} /> {h.phone}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={12} fill="var(--accent-warn)" color="var(--accent-warn)" /> {h.rating}
        </span>
      </div>

      <a
        href={h.maps_link}
        target="_blank"
        rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="btn btn-primary"
        style={{ marginTop: 12, padding: '6px 14px', fontSize: 12 }}
      >
        <Navigation size={12} /> Navigate
      </a>
    </div>
  );
}

export default function HospitalFinder() {
  const { t } = useLanguage();
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [radius, setRadius] = useState(5000);

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(loc);
        fetchHospitals(loc.lat, loc.lon);
      },
      () => {
        // Fallback: use Delhi coordinates for demo
        const loc = { lat: 28.6139, lon: 77.2090 };
        setLocation(loc);
        fetchHospitals(loc.lat, loc.lon);
        toast('Using demo location (Delhi). Allow location for real results.', { icon: '📍' });
      }
    );
  };

  const fetchHospitals = async (lat, lon) => {
    setLoading(true);
    try {
      const { data } = await hospitalsAPI.nearby(lat, lon, radius);
      setHospitals(data.hospitals || []);
      if (data.source === 'mock') toast('Showing demo hospitals', { icon: '🏥' });
    } catch {
      toast.error('Failed to fetch hospitals');
    } finally { setLoading(false); }
  };

  const center = location ? [location.lat, location.lon] : [28.6139, 77.2090];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--secondary)' }}>
          <MapPin size={22} />
        </div>
        <div>
          <h1 className="page-title">{t('Nearby Hospital Finder', 'नजदीकी अस्पताल खोजक')}</h1>
          <p className="page-subtitle">{t('Find hospitals and clinics near you', 'आपके नजदीक अस्पताल और क्लिनिक खोजें')}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              SEARCH RADIUS
            </label>
            <select
              className="form-select"
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              style={{ width: 160 }}
            >
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={getLocation}
            disabled={loading}
            style={{ alignSelf: 'flex-end' }}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Finding...</>
              : <><MapPin size={16} /> {t('Find Hospitals Near Me', 'मेरे पास अस्पताल खोजें')}</>
            }
          </button>
          {location && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'flex-end', paddingBottom: 4 }}>
              📍 {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, '@media(max-width:768px)': { gridTemplateColumns: '1fr' } }}>
        {/* Map */}
        <div className="map-container">
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {location && (
              <>
                <MapCenterUpdater center={[location.lat, location.lon]} />
                <Marker position={[location.lat, location.lon]} icon={userIcon}>
                  <Popup>📍 You are here</Popup>
                </Marker>
              </>
            )}
            {hospitals.map(h => (
              <Marker key={h.id} position={[h.latitude, h.longitude]} icon={hospitalIcon}>
                <Popup>
                  <strong>{h.name}</strong><br />
                  {h.distance_text} away · ⭐ {h.rating}<br />
                  📞 {h.phone}<br />
                  {h.emergency && '🚨 Emergency Available'}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Hospital list */}
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {!location && (
            <div className="empty-state">
              <div className="empty-state-icon">🗺️</div>
              <h3>{t('Enable Location', 'स्थान सक्षम करें')}</h3>
              <p>{t('Click "Find Hospitals Near Me" to get started', '"मेरे पास अस्पताल खोजें" पर क्लिक करें')}</p>
            </div>
          )}
          {hospitals.map(h => (
            <HospitalCard
              key={h.id}
              h={h}
              selected={selected?.id === h.id}
              onClick={() => setSelected(h)}
            />
          ))}
          {location && hospitals.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon">🏥</div>
              <p>No hospitals found in this area. Try increasing the search radius.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
