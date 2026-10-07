import type {
  GisMiningReachPoint,
  GisRestrictedZone,
  GisRiverPath,
  GisStockyardPoint,
  GisLiveVehiclePoint,
  GisEnforcementAlertPoint,
  GisSearchResultItem,
} from "../types/gis.types";

/**
 * Maps GPS Latitude & Longitude to SVG coordinate space (0..333.2 X, 0..545.5 Y)
 * Chhattisgarh bounds:
 * Lat: 17.7°N (South - Sukma) to 24.1°N (North - Balrampur)
 * Lon: 80.2°E (West - Bijapur) to 84.4°E (East - Jashpur)
 */
export function projectGpsToSvg(lat: number, lon: number): { svgX: number; svgY: number } {
  const minLat = 17.7;
  const maxLat = 24.1;
  const minLon = 80.2;
  const maxLon = 84.4;

  const svgWidth = 333.2;
  const svgHeight = 545.5;

  // X goes from West to East
  const xRatio = Math.max(0, Math.min(1, (lon - minLon) / (maxLon - minLon)));
  const svgX = Number((xRatio * svgWidth).toFixed(1));

  // Y goes from North to South (0 at top)
  const yRatio = Math.max(0, Math.min(1, (maxLat - lat) / (maxLat - minLat)));
  const svgY = Number((yRatio * svgHeight).toFixed(1));

  return { svgX, svgY };
}

/**
 * 1. Approved Mining Reaches across Chhattisgarh
 */
export const GIS_APPROVED_REACHES: GisMiningReachPoint[] = [
  {
    id: "rch-01",
    reachId: "CG-RP-MHN-01",
    reachName: "Mahanadi Basin Reach Alpha",
    district: "Raipur",
    riverStream: "Mahanadi River",
    latitude: 21.2514,
    longitude: 81.6296,
    svgX: 124,
    svgY: 308,
    permittedQuantityMt: 100000,
    excavatedQuantityMt: 42500,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/1109",
    linkedStockyardName: "Raipur Central Sand Stockyard",
  },
  {
    id: "rch-02",
    reachId: "CG-DG-SHV-02",
    reachName: "Shivnath River Reach Delta",
    district: "Durg",
    riverStream: "Shivnath River",
    latitude: 21.1904,
    longitude: 81.2849,
    svgX: 110,
    svgY: 260,
    permittedQuantityMt: 150000,
    excavatedQuantityMt: 68200,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/1142",
    linkedStockyardName: "Durg Shivnath Stock Depot",
  },
  {
    id: "rch-03",
    reachId: "CG-BP-ARP-03",
    reachName: "Bilaspur Arpa Sand Quarry Block B",
    district: "Bilaspur",
    riverStream: "Arpa River",
    latitude: 22.0797,
    longitude: 82.1409,
    svgX: 130,
    svgY: 172,
    permittedQuantityMt: 80000,
    excavatedQuantityMt: 12000,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/1188",
    linkedStockyardName: "Bilaspur Sand Depot",
  },
  {
    id: "rch-04",
    reachId: "CG-KB-HSD-04",
    reachName: "Hasdeo River Reach Korba 05",
    district: "Korba",
    riverStream: "Hasdeo River",
    latitude: 22.3595,
    longitude: 82.7501,
    svgX: 168,
    svgY: 172,
    permittedQuantityMt: 120000,
    excavatedQuantityMt: 59000,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2024/0981",
    linkedStockyardName: "Korba Hasdeo Sand Depot",
  },
  {
    id: "rch-05",
    reachId: "CG-RG-KEL-05",
    reachName: "Kelo River Sand Reach 03",
    district: "Raigarh",
    riverStream: "Kelo River",
    latitude: 21.8974,
    longitude: 83.395,
    svgX: 255,
    svgY: 185,
    permittedQuantityMt: 95000,
    excavatedQuantityMt: 38000,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/0821",
    linkedStockyardName: "Raigarh Bypass Stockyard",
  },
  {
    id: "rch-06",
    reachId: "CG-BS-IND-06",
    reachName: "Indravati River Basin Reach Jagdalpur",
    district: "Bastar",
    riverStream: "Indravati River",
    latitude: 19.0744,
    longitude: 82.0298,
    svgX: 135,
    svgY: 435,
    permittedQuantityMt: 85000,
    excavatedQuantityMt: 24000,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/0744",
    linkedStockyardName: "Bastar Jagdalpur Depot",
  },
  {
    id: "rch-07",
    reachId: "CG-BL-KNH-07",
    reachName: "Kanhar River Reach Ramanujganj",
    district: "Balrampur",
    riverStream: "Kanhar River",
    latitude: 23.805,
    longitude: 83.42,
    svgX: 252,
    svgY: 55,
    permittedQuantityMt: 70000,
    excavatedQuantityMt: 18500,
    status: "Approved",
    environmentalClearanceRef: "EC/SEIAA/CG/MIN/2025/0612",
    linkedStockyardName: "Balrampur Northern Stockyard",
  },
];

/**
 * 2. Restricted / Non-Mining Eco-Sensitive Zones
 */
export const GIS_RESTRICTED_ZONES: GisRestrictedZone[] = [
  {
    id: "rst-01",
    zoneName: "Barnawapara Wildlife Sanctuary Eco-Sensitive Zone",
    district: "Baloda Bazar / Mahasamund",
    reason: "Prohibited Wildlife Habitat & Forest Protection Buffer",
    ruleCitation: "Wildlife Protection Act, 1972 (Section 35) & MoEFCC Notification 2020",
    bufferRadiusKm: 10,
    svgX: 198,
    svgY: 238,
    radiusSvg: 16,
    coordinates: "21.40° N, 82.42° E",
  },
  {
    id: "rst-02",
    zoneName: "Achanakmar Tiger Reserve Core Corridor",
    district: "Mungeli / Bilaspur",
    reason: "Core Tiger Habitat & Catchment Area Prohibition",
    ruleCitation: "National Tiger Conservation Authority (NTCA) Guidelines Sec 38V",
    bufferRadiusKm: 15,
    svgX: 82,
    svgY: 165,
    radiusSvg: 20,
    coordinates: "22.38° N, 81.75° E",
  },
  {
    id: "rst-03",
    zoneName: "Kanger Valley National Park Riparian Zone",
    district: "Bastar",
    reason: "Subterranean Limestone Caves & Endangered Biodiversity",
    ruleCitation: "National Green Tribunal (NGT) Central Zone Order OA 44/2021",
    bufferRadiusKm: 12,
    svgX: 148,
    svgY: 458,
    radiusSvg: 15,
    coordinates: "18.88° N, 81.95° E",
  },
  {
    id: "rst-04",
    zoneName: "Guru Ghasidas National Park Catchment",
    district: "Koriya",
    reason: "Protected Headwater Streams & Elephants Corridor",
    ruleCitation: "State Environment Impact Assessment Authority (SEIAA) Rule 7",
    bufferRadiusKm: 10,
    svgX: 142,
    svgY: 52,
    radiusSvg: 18,
    coordinates: "23.65° N, 82.20° E",
  },
];

/**
 * 3. Rivers & Drainage Streams Vector Paths
 */
export const GIS_RIVER_PATHS: GisRiverPath[] = [
  {
    id: "riv-01",
    riverName: "Mahanadi River",
    basin: "Mahanadi Basin",
    pathD:
      "M 65,348 Q 115,315 125,308 T 168,225 T 205,185 T 252,180 T 285,182",
    labelX: 172,
    labelY: 218,
    description: "Main stem sand drainage lifeline spanning Dhamtari, Raipur, Baloda Bazar & Raigarh",
  },
  {
    id: "riv-02",
    riverName: "Shivnath River",
    basin: "Mahanadi Basin",
    pathD:
      "M 45,275 Q 85,268 110,260 T 145,222 T 168,225",
    labelX: 98,
    labelY: 254,
    description: "Primary tributary flowing across Rajnandgaon, Durg, Bemetara into Mahanadi confluence",
  },
  {
    id: "riv-03",
    riverName: "Hasdeo River",
    basin: "Mahanadi Basin",
    pathD:
      "M 155,65 Q 165,115 168,172 T 195,190 T 205,185",
    labelX: 172,
    labelY: 135,
    description: "North-Central river originating in Koriya, powering Korba and Janjgir-Champa reaches",
  },
  {
    id: "riv-04",
    riverName: "Indravati River",
    basin: "Godavari Basin",
    pathD:
      "M 160,425 Q 135,435 115,430 T 65,462 T 25,485",
    labelX: 105,
    labelY: 425,
    description: "Southern river lifeline traversing Bastar, Dantewada, and Bijapur towards Godavari",
  },
  {
    id: "riv-05",
    riverName: "Arpa River",
    basin: "Mahanadi Basin",
    pathD:
      "M 132,130 Q 130,150 130,172 T 145,222",
    labelX: 136,
    labelY: 155,
    description: "Bilaspur sand repository draining southwards into the Shivnath-Mahanadi system",
  },
];

/**
 * 4. Central Sand Stockyards
 */
export const GIS_STOCKYARDS: GisStockyardPoint[] = [
  {
    id: "stk-01",
    stockyardId: "SY-RP-MND-01",
    name: "Raipur Central Sand Stockyard",
    district: "Raipur",
    location: "Mandir Hasaud Bypass, NH-53, Raipur",
    sandType: "River Sand (Coarse Construction Grade)",
    availableQuantityMt: 14330,
    capacityMt: 40000,
    latitude: 21.24,
    longitude: 81.615,
    svgX: 128,
    svgY: 312,
    status: "Active",
  },
  {
    id: "stk-02",
    stockyardId: "SY-DG-PAT-02",
    name: "Durg Shivnath Stock Depot",
    district: "Durg",
    location: "Patan Road, Durg",
    sandType: "River Sand (Medium Plastering Grade)",
    availableQuantityMt: 18640,
    capacityMt: 50000,
    latitude: 21.185,
    longitude: 81.278,
    svgX: 114,
    svgY: 264,
    status: "Active",
  },
  {
    id: "stk-03",
    stockyardId: "SY-BP-KNI-03",
    name: "Bilaspur Sand Depot",
    district: "Bilaspur",
    location: "Koni Industrial Area Bypass, Bilaspur",
    sandType: "River Sand (Fine Grade)",
    availableQuantityMt: 6660,
    capacityMt: 35000,
    latitude: 22.08,
    longitude: 82.15,
    svgX: 134,
    svgY: 176,
    status: "Low Stock",
  },
  {
    id: "stk-04",
    stockyardId: "SY-KB-KAT-04",
    name: "Korba Hasdeo Sand Depot",
    district: "Korba",
    location: "Katghora Industrial Hub, Korba",
    sandType: "River Sand (Medium Grade)",
    availableQuantityMt: 22100,
    capacityMt: 25000,
    latitude: 22.36,
    longitude: 82.76,
    svgX: 172,
    svgY: 176,
    status: "Near Capacity",
  },
  {
    id: "stk-05",
    stockyardId: "SY-BS-JGD-05",
    name: "Bastar Jagdalpur Depot",
    district: "Bastar",
    location: "Geedam Road Industrial Estate, Jagdalpur",
    sandType: "River Sand (Coarse Grade)",
    availableQuantityMt: 12400,
    capacityMt: 30000,
    latitude: 19.08,
    longitude: 82.01,
    svgX: 138,
    svgY: 438,
    status: "Active",
  },
];

/**
 * 5. Live Transport Vehicles (Telematics Stream)
 */
export const GIS_LIVE_VEHICLES: GisLiveVehiclePoint[] = [
  {
    id: "veh-01",
    vehicleNumber: "CG-04-TX-2341",
    driverName: "Venkat Sahu",
    speedKmH: 38,
    tripStatus: "In Transit",
    geofenceStatus: "Normal Route",
    eta: "14 mins",
    sourceReachName: "Mahanadi Basin Reach Alpha",
    destinationDepot: "Raipur Central Sand Stockyard",
    latitude: 21.245,
    longitude: 81.622,
    svgX: 126,
    svgY: 310,
    lastUpdated: "Just now (Live GPS)",
  },
  {
    id: "veh-02",
    vehicleNumber: "CG-07-TH-7721",
    driverName: "S. K. Patel",
    speedKmH: 0,
    tripStatus: "Loading at Depot",
    geofenceStatus: "Normal Route",
    eta: "Depot Queue",
    sourceReachName: "Shivnath River Reach Delta",
    destinationDepot: "Durg Shivnath Stock Depot",
    latitude: 21.188,
    longitude: 81.281,
    svgX: 112,
    svgY: 262,
    lastUpdated: "1 min ago",
  },
  {
    id: "veh-03",
    vehicleNumber: "CG-10-CK-9912",
    driverName: "D. Nishad",
    speedKmH: 52,
    tripStatus: "In Transit",
    geofenceStatus: "Route Deviation Detected",
    eta: "Alert Triggered",
    sourceReachName: "Bilaspur Arpa Sand Quarry",
    destinationDepot: "Bilaspur Sand Depot",
    latitude: 22.09,
    longitude: 82.16,
    svgX: 138,
    svgY: 170,
    lastUpdated: "2 mins ago",
  },
  {
    id: "veh-04",
    vehicleNumber: "CG-12-MK-4481",
    driverName: "R. K. Verma",
    speedKmH: 42,
    tripStatus: "In Transit",
    geofenceStatus: "Normal Route",
    eta: "28 mins",
    sourceReachName: "Hasdeo River Reach Korba",
    destinationDepot: "Korba Hasdeo Sand Depot",
    latitude: 22.34,
    longitude: 82.72,
    svgX: 164,
    svgY: 180,
    lastUpdated: "3 mins ago",
  },
];

/**
 * 6. Illegal Mining Alerts & Sensor Points
 */
export const GIS_ENFORCEMENT_ALERTS: GisEnforcementAlertPoint[] = [
  {
    id: "alt-01",
    alertId: "ALT-2026-0901",
    violationType: "Night Excavation Outside Permitted Boundary",
    severity: "critical",
    reachName: "Mahanadi Reach #04 Buffer",
    district: "Raipur",
    sensorTriggerId: "IR-CAM-RP-04",
    coordinates: "21.2840° N, 81.6510° E",
    timestamp: "12 mins ago",
    investigationStatus: "Open",
    actionRequired: "Field Flying Squad Dispatched",
    svgX: 132,
    svgY: 300,
  },
  {
    id: "alt-02",
    alertId: "ALT-2026-0902",
    violationType: "Geofence Breach - Heavy Triaxle Loaded without E-Pass",
    severity: "high",
    reachName: "Arpa River Quarry Fringe",
    district: "Bilaspur",
    sensorTriggerId: "RFID-GATE-BP-02",
    coordinates: "22.1120° N, 82.1840° E",
    timestamp: "28 mins ago",
    investigationStatus: "Under Investigation",
    actionRequired: "Checkpost Interception Flagged",
    svgX: 142,
    svgY: 168,
  },
  {
    id: "alt-03",
    alertId: "ALT-2026-0903",
    violationType: "Unauthorized Dredging Equipment Detected in River Bed",
    severity: "critical",
    reachName: "Hasdeo River Protected Riparian Zone",
    district: "Korba",
    sensorTriggerId: "ACOUSTIC-SNSR-KB-01",
    coordinates: "22.3810° N, 82.7820° E",
    timestamp: "45 mins ago",
    investigationStatus: "Open",
    actionRequired: "Seizure Notice Issued to Operator",
    svgX: 178,
    svgY: 166,
  },
];

/**
 * Universal search index provider across all GIS objects
 */
export const GisSpatialDataService = {
  getAllReaches(): GisMiningReachPoint[] {
    return GIS_APPROVED_REACHES;
  },

  getAllRestrictedZones(): GisRestrictedZone[] {
    return GIS_RESTRICTED_ZONES;
  },

  getAllRivers(): GisRiverPath[] {
    return GIS_RIVER_PATHS;
  },

  getAllStockyards(): GisStockyardPoint[] {
    return GIS_STOCKYARDS;
  },

  getAllLiveVehicles(): GisLiveVehiclePoint[] {
    return GIS_LIVE_VEHICLES;
  },

  getAllAlerts(): GisEnforcementAlertPoint[] {
    return GIS_ENFORCEMENT_ALERTS;
  },

  searchAll(query: string): GisSearchResultItem[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: GisSearchResultItem[] = [];

    // Search Reaches
    GIS_APPROVED_REACHES.forEach((r) => {
      if (
        r.reachName.toLowerCase().includes(q) ||
        r.reachId.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.riverStream.toLowerCase().includes(q)
      ) {
        results.push({
          id: r.id,
          type: "REACH",
          title: r.reachName,
          subtitle: `${r.reachId} • ${r.district} (${r.riverStream})`,
          district: r.district,
          svgX: r.svgX,
          svgY: r.svgY,
          rawItem: r,
        });
      }
    });

    // Search Stockyards
    GIS_STOCKYARDS.forEach((s) => {
      if (
        s.name.toLowerCase().includes(q) ||
        s.stockyardId.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          type: "STOCKYARD",
          title: s.name,
          subtitle: `${s.stockyardId} • ${s.district} (${s.availableQuantityMt.toLocaleString()} MT)`,
          district: s.district,
          svgX: s.svgX,
          svgY: s.svgY,
          rawItem: s,
        });
      }
    });

    // Search Vehicles
    GIS_LIVE_VEHICLES.forEach((v) => {
      if (
        v.vehicleNumber.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.tripStatus.toLowerCase().includes(q)
      ) {
        results.push({
          id: v.id,
          type: "VEHICLE",
          title: v.vehicleNumber,
          subtitle: `Driver: ${v.driverName} • ${v.tripStatus} (${v.speedKmH} km/h)`,
          district: "Transit",
          svgX: v.svgX,
          svgY: v.svgY,
          rawItem: v,
        });
      }
    });

    // Search Alerts
    GIS_ENFORCEMENT_ALERTS.forEach((a) => {
      if (
        a.alertId.toLowerCase().includes(q) ||
        a.violationType.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.reachName.toLowerCase().includes(q)
      ) {
        results.push({
          id: a.id,
          type: "ALERT",
          title: `${a.alertId}: ${a.violationType}`,
          subtitle: `${a.district} • ${a.reachName} (${a.severity.toUpperCase()})`,
          district: a.district,
          svgX: a.svgX,
          svgY: a.svgY,
          rawItem: a,
        });
      }
    });

    // Search Restricted Zones
    GIS_RESTRICTED_ZONES.forEach((rz) => {
      if (
        rz.zoneName.toLowerCase().includes(q) ||
        rz.district.toLowerCase().includes(q) ||
        rz.reason.toLowerCase().includes(q)
      ) {
        results.push({
          id: rz.id,
          type: "RESTRICTED",
          title: rz.zoneName,
          subtitle: `${rz.district} • ${rz.reason}`,
          district: rz.district,
          svgX: rz.svgX,
          svgY: rz.svgY,
          rawItem: rz,
        });
      }
    });

    return results.slice(0, 10);
  },
};
