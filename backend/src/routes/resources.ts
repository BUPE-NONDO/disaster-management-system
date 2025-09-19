import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createResourceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['VEHICLE', 'PERSONNEL', 'EQUIPMENT', 'MEDICAL_SUPPLY', 'FOOD_WATER', 'SHELTER', 'COMMUNICATION', 'OTHER']),
  description: z.string().optional(),
  total: z.number().min(0),
  available: z.number().min(0).optional(),
  location: z.string().min(1)
});

const updateResourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  total: z.number().min(0).optional(),
  available: z.number().min(0).optional(),
  location: z.string().min(1).optional()
});

const allocateResourceSchema = z.object({
  incidentId: z.string(),
  quantity: z.number().min(1)
});

// Mock data for development
let resources = [
  {
    id: '1',
    name: 'Emergency Ambulances',
    type: 'VEHICLE',
    description: 'Fully equipped ambulances for medical emergencies',
    available: 15,
    total: 20,
    location: 'Central Station',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Paramedic Teams',
    type: 'PERSONNEL',
    description: 'Certified paramedic response teams',
    available: 8,
    total: 12,
    location: 'Hospital Network',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Rescue Equipment',
    type: 'EQUIPMENT',
    description: 'Heavy rescue and extraction equipment',
    available: 25,
    total: 30,
    location: 'Equipment Warehouse',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let allocations = [
  {
    id: '1',
    incidentId: '1',
    resourceId: '1',
    quantity: 3,
    allocatedAt: new Date().toISOString()
  }
];

// GET /api/resources - List all resources
router.get('/', (req, res) => {
  const { type, available } = req.query;
  
  let filteredResources = resources;
  
  if (type) {
    filteredResources = filteredResources.filter(r => r.type === type);
  }
  
  if (available === 'true') {
    filteredResources = filteredResources.filter(r => r.available > 0);
  }
  
  res.json({
    resources: filteredResources,
    total: filteredResources.length
  });
});

// GET /api/resources/:id - Get specific resource
router.get('/:id', (req, res) => {
  const resource = resources.find(r => r.id === req.params.id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  // Get allocations for this resource
  const resourceAllocations = allocations.filter(a => a.resourceId === req.params.id);
  
  res.json({ 
    resource: {
      ...resource,
      allocations: resourceAllocations
    }
  });
});

// POST /api/resources - Create new resource
router.post('/', (req, res) => {
  try {
    const validatedData = createResourceSchema.parse(req.body);
    
    const newResource = {
      id: String(Date.now()),
      ...validatedData,
      available: validatedData.available ?? validatedData.total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    resources.push(newResource);
    
    res.status(201).json({ resource: newResource });
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

// PUT /api/resources/:id - Update resource
router.put('/:id', (req, res) => {
  try {
    const validatedData = updateResourceSchema.parse(req.body);
    
    const resourceIndex = resources.findIndex(r => r.id === req.params.id);
    
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    resources[resourceIndex] = {
      ...resources[resourceIndex],
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ resource: resources[resourceIndex] });
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

// POST /api/resources/:id/allocate - Allocate resource to incident
router.post('/:id/allocate', (req, res) => {
  try {
    const validatedData = allocateResourceSchema.parse(req.body);
    
    const resource = resources.find(r => r.id === req.params.id);
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    if (resource.available < validatedData.quantity) {
      return res.status(400).json({ 
        error: 'Insufficient resources available',
        available: resource.available,
        requested: validatedData.quantity
      });
    }
    
    // Create allocation
    const newAllocation = {
      id: String(Date.now()),
      resourceId: req.params.id,
      ...validatedData,
      allocatedAt: new Date().toISOString()
    };
    
    allocations.push(newAllocation);
    
    // Update resource availability
    const resourceIndex = resources.findIndex(r => r.id === req.params.id);
    resources[resourceIndex].available -= validatedData.quantity;
    resources[resourceIndex].updatedAt = new Date().toISOString();
    
    res.status(201).json({ allocation: newAllocation });
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

// GET /api/resources/allocations - Get all allocations
router.get('/allocations/list', (req, res) => {
  const { incidentId } = req.query;
  
  let filteredAllocations = allocations;
  
  if (incidentId) {
    filteredAllocations = filteredAllocations.filter(a => a.incidentId === incidentId);
  }
  
  // Enrich with resource details
  const enrichedAllocations = filteredAllocations.map(allocation => {
    const resource = resources.find(r => r.id === allocation.resourceId);
    return {
      ...allocation,
      resource
    };
  });
  
  res.json({
    allocations: enrichedAllocations,
    total: enrichedAllocations.length
  });
});

export default router;