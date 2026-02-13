import { MapContainer, Marker, Popup, TileLayer, Polyline } from "react-leaflet";

export const LiveTrackingMap = ({
  agentData,
  destinationData,
}) => {
  if (!agentData || !destinationData) return null;

  if(!agentData.lat || !agentData.lng || !destinationData?.lat || !destinationData.lng) return null

  const path= [
    [agentData.lat, agentData.lng],
    [destinationData.lat, destinationData.lng],
  ];

  const center = [
    agentData.lat,
    agentData.lng,
  ];


  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer center={center} zoom={16} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Agent Marker */}
        <Marker
          position={[agentData?.lat, agentData?.lng]}
          {...(agentData.icon ? { icon: agentData.icon } : {})}
        >
          <Popup>{agentData.label}</Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker
          position={[destinationData.lat, destinationData.lng]}
          {...(destinationData.icon ? { icon: destinationData.icon } : {})}
        >
          <Popup>{destinationData.label}</Popup>
        </Marker>

        {/* Route Line */}
        <Polyline positions={path} />
      </MapContainer>
    </div>
  );
};
