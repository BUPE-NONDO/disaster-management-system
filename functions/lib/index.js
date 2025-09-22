"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.onIncidentUpdated = exports.onIncidentCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
// Initialize Firebase Admin
admin.initializeApp();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Middleware to verify authentication
const authenticateUser = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split('Bearer ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
// Get all incidents
app.get('/incidents', authenticateUser, async (req, res) => {
    try {
        const { status, severity, type, limit = 50 } = req.query;
        let query = admin.firestore().collection('incidents');
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
        const incidents = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.json({ incidents, total: incidents.length });
    }
    catch (error) {
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
            res.status(400).json({
                error: 'Missing required fields: type, title, severity, location'
            });
            return;
        }
        const incidentData = {
            type,
            title,
            description: description || '',
            severity,
            location,
            coordinates: coordinates || null,
            status: 'REPORTED',
            reportedBy: req.user.uid,
            reportedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await admin.firestore().collection('incidents').add(incidentData);
        // Get the created document
        const doc = await docRef.get();
        const incident = Object.assign({ id: doc.id }, doc.data());
        // Trigger notifications (you can implement this later)
        await triggerIncidentNotifications(incident);
        res.status(201).json({ incident });
    }
    catch (error) {
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
            res.status(404).json({ error: 'Incident not found' });
            return;
        }
        const incident = Object.assign({ id: doc.id }, doc.data());
        res.json({ incident });
    }
    catch (error) {
        console.error('Error updating incident:', error);
        res.status(500).json({ error: 'Failed to update incident' });
    }
});
// Get all resources
app.get('/resources', authenticateUser, async (req, res) => {
    try {
        const { type, available } = req.query;
        let query = admin.firestore().collection('resources');
        if (type) {
            query = query.where('type', '==', type);
        }
        const snapshot = await query.get();
        let resources = snapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        if (available === 'true') {
            resources = resources.filter((r) => r.available > 0);
        }
        res.json({ resources, total: resources.length });
    }
    catch (error) {
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
            res.status(400).json({ error: 'Invalid allocation data' });
            return;
        }
        // Use transaction to ensure consistency
        const result = await admin.firestore().runTransaction(async (transaction) => {
            const resourceRef = admin.firestore().collection('resources').doc(id);
            const resourceDoc = await transaction.get(resourceRef);
            if (!resourceDoc.exists) {
                throw new Error('Resource not found');
            }
            const resource = resourceDoc.data();
            if (resource.available < quantity) {
                throw new Error('Insufficient resources available');
            }
            // Create allocation
            const allocationData = {
                incidentId,
                resourceId: id,
                quantity,
                allocatedBy: req.user.uid,
                allocatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            const allocationRef = admin.firestore().collection('resourceAllocations').doc();
            transaction.set(allocationRef, allocationData);
            // Update resource availability
            transaction.update(resourceRef, {
                available: resource.available - quantity,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return Object.assign({ id: allocationRef.id }, allocationData);
        });
        res.status(201).json({ allocation: result });
    }
    catch (error) {
        console.error('Error allocating resource:', error);
        res.status(500).json({ error: error.message || 'Failed to allocate resource' });
    }
});
// Helper function for notifications
async function triggerIncidentNotifications(incident) {
    // Implement notification logic here
    // Could send emails, SMS, push notifications, etc.
    console.log('New incident reported:', incident.title);
}
// Cloud Function triggers
exports.onIncidentCreated = functions.firestore
    .document('incidents/{incidentId}')
    .onCreate(async (snap, context) => {
    const incident = Object.assign({ id: snap.id }, snap.data());
    // Send notifications to relevant personnel
    console.log('Incident created trigger:', incident.title);
    // You can implement:
    // - Email notifications
    // - SMS alerts
    // - Push notifications
    // - Slack/Teams messages
});
exports.onIncidentUpdated = functions.firestore
    .document('incidents/{incidentId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Check if status changed
    if (before.status !== after.status) {
        console.log(`Incident ${context.params.incidentId} status changed from ${before.status} to ${after.status}`);
        // Send status update notifications
    }
});
// Export the API
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map