import type { Shipment } from "./live-shipment-map"

// Helper function to generate a random number between min and max
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Helper function to generate a random date between start and end
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to generate a random tracking number
const generateTrackingNumber = () => {
  const prefix = ["CM", "SL", "AX", "GL", "FT"][randomNumber(0, 4)]
  const number = randomNumber(10000000, 99999999)
  return `${prefix}${number}`
}

// Sample locations for origins and destinations
const locations = [
  { name: "New York", coordinates: [-74.006, 40.7128] as [number, number], country: "USA" },
  { name: "Los Angeles", coordinates: [-118.2437, 34.0522] as [number, number], country: "USA" },
  { name: "Chicago", coordinates: [-87.6298, 41.8781] as [number, number], country: "USA" },
  { name: "Houston", coordinates: [-95.3698, 29.7604] as [number, number], country: "USA" },
  { name: "London", coordinates: [-0.1278, 51.5074] as [number, number], country: "UK" },
  { name: "Paris", coordinates: [2.3522, 48.8566] as [number, number], country: "France" },
  { name: "Berlin", coordinates: [13.405, 52.52] as [number, number], country: "Germany" },
  { name: "Tokyo", coordinates: [139.6917, 35.6895] as [number, number], country: "Japan" },
  { name: "Sydney", coordinates: [151.2093, -33.8688] as [number, number], country: "Australia" },
  { name: "Singapore", coordinates: [103.8198, 1.3521] as [number, number], country: "Singapore" },
  { name: "Dubai", coordinates: [55.2708, 25.2048] as [number, number], country: "UAE" },
  { name: "Mumbai", coordinates: [72.8777, 19.076] as [number, number], country: "India" },
  { name: "Shanghai", coordinates: [121.4737, 31.2304] as [number, number], country: "China" },
  { name: "São Paulo", coordinates: [-46.6333, -23.5505] as [number, number], country: "Brazil" },
  { name: "Mexico City", coordinates: [-99.1332, 19.4326] as [number, number], country: "Mexico" },
]

// Sample carriers
const carriers = [
  "CargoMax Express",
  "Global Logistics",
  "FastTrack Shipping",
  "OceanWave Freight",
  "AirSpeed Cargo",
  "RailLink Transport",
  "RoadRunner Logistics",
  "SeaBreeze Shipping",
]

// Sample customer names
const customerNames = [
  "Acme Corporation",
  "Globex Industries",
  "Stark Enterprises",
  "Wayne Enterprises",
  "Umbrella Corporation",
  "Cyberdyne Systems",
  "Soylent Corp",
  "Initech",
  "Massive Dynamic",
  "Oscorp Industries",
]

// Generate a random shipment
const generateRandomShipment = (id: number): Shipment => {
  // Pick random origin and destination
  const originIndex = randomNumber(0, locations.length - 1)
  let destinationIndex
  do {
    destinationIndex = randomNumber(0, locations.length - 1)
  } while (destinationIndex === originIndex)

  const origin = locations[originIndex]
  const destination = locations[destinationIndex]

  // Generate random dates
  const now = new Date()
  const pastDate = new Date(now)
  pastDate.setDate(pastDate.getDate() - 30)
  const futureDate = new Date(now)
  futureDate.setDate(futureDate.getDate() + 30)

  const departureTime = randomDate(pastDate, now).toISOString()
  const estimatedArrival = randomDate(now, futureDate).toISOString()
  const lastUpdated = randomDate(new Date(departureTime), new Date()).toISOString()

  // Determine shipment status
  const statuses: Shipment["status"][] = ["in-transit", "delivered", "delayed", "pending", "returned"]
  const status = statuses[randomNumber(0, statuses.length - 1)]

  // Determine shipment type
  const types: Shipment["type"][] = ["air", "sea", "road", "rail"]
  const type = types[randomNumber(0, types.length - 1)]

  // Determine priority
  const priorities: Shipment["priority"][] = ["express", "normal", "economy"]
  const priority = priorities[randomNumber(0, priorities.length - 1)]

  // Calculate progress based on dates
  const totalTime = new Date(estimatedArrival).getTime() - new Date(departureTime).getTime()
  const elapsedTime = new Date().getTime() - new Date(departureTime).getTime()
  let progress = Math.round((elapsedTime / totalTime) * 100)
  progress = Math.max(0, Math.min(100, progress))

  // Generate current location (somewhere between origin and destination)
  const currentLocationFactor = progress / 100
  const currentLocationLng =
    origin.coordinates[0] + (destination.coordinates[0] - origin.coordinates[0]) * currentLocationFactor
  const currentLocationLat =
    origin.coordinates[1] + (destination.coordinates[1] - origin.coordinates[1]) * currentLocationFactor

  // Find the nearest location to the current coordinates
  let nearestLocationIndex = 0
  let minDistance = Number.MAX_VALUE
  locations.forEach((loc, index) => {
    const distance = Math.sqrt(
      Math.pow(loc.coordinates[0] - currentLocationLng, 2) + Math.pow(loc.coordinates[1] - currentLocationLat, 2),
    )
    if (distance < minDistance) {
      minDistance = distance
      nearestLocationIndex = index
    }
  })

  // Add some randomness to the current location
  const currentLocation = {
    ...locations[nearestLocationIndex],
    coordinates: [currentLocationLng + (Math.random() - 0.5) * 2, currentLocationLat + (Math.random() - 0.5) * 2] as [
      number,
      number,
    ],
  }

  // Generate random alerts for some shipments
  const hasAlerts = Math.random() > 0.7
  let alerts
  if (hasAlerts) {
    const alertTypes: ("warning" | "critical" | "info")[] = ["warning", "critical", "info"]
    const numAlerts = randomNumber(1, 3)
    alerts = Array.from({ length: numAlerts }, () => {
      const alertType = alertTypes[randomNumber(0, alertTypes.length - 1)]
      let message
      switch (alertType) {
        case "warning":
          message = [
            "Potential delay due to weather conditions",
            "Route congestion detected",
            "Customs clearance taking longer than expected",
          ][randomNumber(0, 2)]
          break
        case "critical":
          message = ["Temperature threshold exceeded", "Package integrity compromised", "Vehicle breakdown reported"][
            randomNumber(0, 2)
          ]
          break
        default:
          message = [
            "Package scanned at new checkpoint",
            "Estimated arrival time updated",
            "Carrier changed route for optimization",
          ][randomNumber(0, 2)]
      }
      return {
        type: alertType,
        message,
        timestamp: randomDate(new Date(departureTime), new Date()).toISOString(),
      }
    })
  }

  // Generate random notes for some shipments
  const hasNotes = Math.random() > 0.7
  const notes = hasNotes
    ? [
        "Customer requested evening delivery",
        "Fragile items - handle with care",
        "Signature required upon delivery",
        "Leave with neighbor if recipient not available",
        "Call customer before delivery",
      ][randomNumber(0, 4)]
    : undefined

  // Generate temperature and humidity for some shipments
  const hasEnvironmentalData = Math.random() > 0.6
  const temperature = hasEnvironmentalData ? randomNumber(-5, 30) : undefined
  const humidity = hasEnvironmentalData ? randomNumber(20, 90) : undefined

  return {
    id: `shipment-${id}`,
    trackingNumber: generateTrackingNumber(),
    origin,
    destination,
    currentLocation,
    status,
    carrier: carriers[randomNumber(0, carriers.length - 1)],
    departureTime,
    estimatedArrival,
    actualArrival: status === "delivered" ? estimatedArrival : undefined,
    lastUpdated,
    progress,
    type,
    priority,
    weight: randomNumber(1, 5000),
    items: randomNumber(1, 50),
    customer: {
      name: customerNames[randomNumber(0, customerNames.length - 1)],
      id: `CUST-${randomNumber(10000, 99999)}`,
    },
    notes,
    temperature,
    humidity,
    alerts,
  }
}

// Generate a specified number of mock shipments
export const generateMockShipments = (count: number): Shipment[] => {
  return Array.from({ length: count }, (_, i) => generateRandomShipment(i + 1))
}
