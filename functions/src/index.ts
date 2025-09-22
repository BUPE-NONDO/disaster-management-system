import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import express from 'express';

// Initialize Firebase Admin
admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to verify authentication
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

// Get all incidents
app.get('/incidents', authenticateUser, async (req, res) => {
  try {
    const { status, severity, type, limit = 50 } = req.query;
    
    let query: any = admin.firestore().collection('incidents');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    if (severity) {
      query = query.where('severity', '==', severity);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    
    query = query.orderBy('reportedAt', 'desc').limit(Number(limit));
    
    const snapshot = await query.get();
    const incidents = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ incidents, total: incidents.length });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Create new incident
app.post('/incidents', authenticateUser, async (req, res) => {
  try {
    const { type, title, description, severity, location, coordinates } = req.body;
    
    // Validation
    if (!type || !title || !severity || !location) {
      return res.status(400).json({
        error: 'Missing required fields: type, title, severity, location'
      });
    }
    
    const incidentData = {
      type,
      title,
      description: description || '',
      severity,
      location,
      coordinates: coordinates || null,
      status: 'REPORTED',
      reportedBy: req.user!.uid,
      reportedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await admin.firestore().collection('incidents').add(incidentData);
    
    // Get the created document
    const doc = await docRef.get();
    const incident = { id: doc.id, ...doc.data() };
    
    // Trigger notifications (you can implement this later)
    await triggerIncidentNotifications(incident);
    
    res.status(201).json({ incident });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Update incident
app.put('/incidents/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Add timestamp
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    await admin.firestore().collection('incidents').doc(id).update(updates);
    
    // Get updated document
    const doc = await admin.firestore().collection('incidents').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    const incident = { id: doc.id, ...doc.data() };
    res.json({ incident });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Get all resources
app.get('/resources', authenticateUser, async (req, res) => {
  try {
    const { type, available } = req.query;
    
    let query: any = admin.firestore().collection('resources');
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.get();
    let resources = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (available === 'true') {
      resources = resources.filter((r: any) => r.available > 0);
    }
    
    res.json({ resources, total: resources.length });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create resource allocation
app.post('/resources/:id/allocate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentId, quantity } = req.body;
    
    if (!incidentId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid allocation data' });
    }
    
    // Use transaction to ensure consistency
    const result = await admin.firestore().runTransaction(async (transaction) => {
      const resourceRef = admin.firestore().collection('resources').doc(id);
      const resourceDoc = await transaction.get(resourceRef);
      
      if (!resourceDoc.exists) {
        throw new Error('Resource not found');
      }
      
      const resource = resourceDoc.data()!;
      
      if (resource.available < quantity) {
        throw new Error('Insufficient resources available');
      }
      
      // Create allocation
      const allocationData = {
        incidentId,
        resourceId: id,
        quantity,
        allocatedBy: req.user!.uid,
        allocatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const allocationRef = admin.firestore().collection('resourceAllocations').doc();
      transaction.set(allocationRef, allocationData);
      
      // Update resource availability
      transaction.update(resourceRef, {
        available: resource.available - quantity,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return { id: allocationRef.id, ...allocationData };
    });
    
    res.status(201).json({ allocation: result });
  } catch (error: any) {
    console.error('Error allocating resource:', error);
    res.status(500).json({ error: error.message || 'Failed to allocate resource' });
  }
});

// Helper function for notifications
async function triggerIncidentNotifications(incident: any) {
  // Implement notification logic here
  // Could send emails, SMS, push notifications, etc.
  console.log('New incident reported:', incident.title);
}

// Cloud Function triggers
export const onIncidentCreated = functions.firestore
  .document('incidents/{incidentId}')
  .onCreate(async (snap, context) => {
    const incident: any = { id: snap.id, ...snap.data() };
    
    // Send notifications to relevant personnel
    console.log('Incident created trigger:', incident.title);
    
    // You can implement:
    // - Email notifications
    // - SMS alerts
    // - Push notifications
    // - Slack/Teams messages
  });

export const onIncidentUpdated = functions.firestore
  .document('incidents/{incidentId}')
  .onUpdate(async (change, context) => {
    const before: any = change.before.data();
    const after: any = change.after.data();
    
    // Check if status changed
    if (before.status !== after.status) {
      console.log(`Incident ${context.params.incidentId} status changed from ${before.status} to ${after.status}`);
      
      // Send status update notifications
    }
  });

// Export the API
export const api = functions.https.onRequest(app);