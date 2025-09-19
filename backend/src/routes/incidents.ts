import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createIncidentSchema = z.object({
  type: z.enum(['FIRE', 'FLOOD', 'EARTHQUAKE', 'HURRICANE', 'TORNADO', 'LANDSLIDE', 'EXPLOSION', 'CHEMICAL_SPILL', 'MEDICAL_EMERGENCY', 'TRAFFIC_ACCIDENT', 'POWER_OUTAGE', 'OTHER']),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

const updateIncidentSchema = z.object({
  status: z.enum(['REPORTED', 'ACKNOWLEDGED', 'RESPONDING', 'RESOLVED', 'CLOSED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  description: z.string().optional()
});

// Mock data for development
let incidents = [
  {
    id: '1',
    type: 'FLOOD',
    title: 'Downtown Flooding',
    description: 'Heavy rainfall causing street flooding in downtown area',
    severity: 'HIGH',
    status: 'RESPONDING',
    location: 'Downtown District',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    reportedBy: 'user1',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'FIRE',
    title: 'Industrial Fire',
    description: 'Fire at manufacturing facility',
    severity: 'MEDIUM',
    status: 'ACKNOWLEDGED',
    location: 'Industrial Zone',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    reportedBy: 'user2',
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/incidents - List all incidents
router.get('/', (req, res) => {
  const { status, severity, type } = req.query;
  
  let filteredIncidents = incidents;
  
  if (status) {
    filteredIncidents = filteredIncidents.filter(i => i.status === status);
  }
  
  if (severity) {
    filteredIncidents = filteredIncidents.filter(i => i.severity === severity);
  }
  
  if (type) {
    filteredIncidents = filteredIncidents.filter(i => i.type === type);
  }
  
  res.json({
    incidents: filteredIncidents,
    total: filteredIncidents.length
  });
});

// GET /api/incidents/:id - Get specific incident
router.get('/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  
  res.json({ incident });
});

// POST /api/incidents - Create new incident
router.post('/', (req, res) => {
  try {
    const validatedData = createIncidentSchema.parse(req.body);
    
    const newIncident = {
      id: String(Date.now()),
      ...validatedData,
      status: 'REPORTED' as const,
      reportedBy: 'current-user', // In real app, get from auth
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    incidents.push(newIncident);
    
    res.status(201).json({ incident: newIncident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/incidents/:id - Update incident
router.put('/:id', (req, res) => {
  try {
    const validatedData = updateIncidentSchema.parse(req.body);
    
    const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
    
    if (incidentIndex === -1) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    incidents[incidentIndex] = {
      ...incidents[incidentIndex],
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ incident: incidents[incidentIndex] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', (req, res) => {
  const incidentIndex = incidents.findIndex(i => i.id === req.params.id);
  
  if (incidentIndex === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  
  incidents.splice(incidentIndex, 1);
  
  res.status(204).send();
});

export default router;