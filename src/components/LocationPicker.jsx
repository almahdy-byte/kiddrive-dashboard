import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NOMINATIM = 'https://nominatim.openstreetmap.org';

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function MapMover({ center }) {
  const map = useMap();
  if (center) map.setView(center, map.getZoom());
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const center = value.lat && value.lng ? [value.lat, value.lng] : [30.033, 31.233];

  const handleMapClick = useCallback(async (latlng) => {
    onChange({ ...value, lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) });
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const addr = data.address || {};
      onChange((prev) => ({
        ...prev,
        lat: latlng.lat.toFixed(6),
        lng: latlng.lng.toFixed(6),
        city: addr.city || addr.town || addr.village || addr.county || prev.city || '',
        department: addr.suburb || addr.neighbourhood || addr.district || prev.department || '',
        address: data.display_name || prev.address || '',
      }));
    } catch {}
  }, [value, onChange]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(searchQuery)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();
      if (results.length > 0) {
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        const addr = r.address || {};
        onChange({
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          city: addr.city || addr.town || addr.village || addr.county || '',
          department: addr.suburb || addr.neighbourhood || r.display_name?.split(',')[1]?.trim() || '',
          address: r.display_name || '',
        });
      }
    } catch {}
    setSearching(false);
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-sm btn-primary" disabled={searching}>
          {searching ? '...' : 'Search'}
        </button>
      </form>

      <div style={styles.mapWrapper}>
        <MapContainer center={center} zoom={13} style={{ height: 300, borderRadius: 12 }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {value.lat && value.lng && (
            <Marker position={[parseFloat(value.lat), parseFloat(value.lng)]} />
          )}
          <MapMover center={center} />
        </MapContainer>
      </div>

      <div style={styles.coordsRow}>
        <div style={styles.coordField}>
          <label style={styles.coordLabel}>Latitude</label>
          <input
            type="text"
            value={value.lat || ''}
            readOnly
            className="input-field"
            style={styles.coordInput}
          />
        </div>
        <div style={styles.coordField}>
          <label style={styles.coordLabel}>Longitude</label>
          <input
            type="text"
            value={value.lng || ''}
            readOnly
            className="input-field"
            style={styles.coordInput}
          />
        </div>
        <div style={styles.coordField}>
          <label style={styles.coordLabel}>City</label>
          <input
            type="text"
            value={value.city || ''}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            className="input-field"
            style={styles.coordInput}
          />
        </div>
        <div style={styles.coordField}>
          <label style={styles.coordLabel}>Department</label>
          <input
            type="text"
            value={value.department || ''}
            onChange={(e) => onChange({ ...value, department: e.target.value })}
            className="input-field"
            style={styles.coordInput}
          />
        </div>
      </div>

      <p style={styles.hint}>Click on the map to set a location, or use the search box above.</p>
    </div>
  );
}

const styles = {
  searchRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    border: '1.5px solid #e0e0e0',
    marginBottom: 12,
  },
  coordsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 8,
  },
  coordField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
  },
  coordInput: {
    fontSize: 13,
    padding: '6px 10px',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    margin: 0,
  },
};
