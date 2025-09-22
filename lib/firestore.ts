import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Incident {
  id?: string;
  type: string;
  title: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'CLOSED';
  location: string;
  coordinates?: { lat: number; lng: number };
  reportedBy: string;
  reportedAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Resource {
  id?: string;
  name: string;
  type: string;
  description?: string;
  available: number;
  total: number;
  location: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ResourceAllocation {
  id?: string;
  incidentId: string;
  resourceId: string;
  quantity: number;
  allocatedBy: string;
  allocatedAt: Timestamp;
}

// Incident operations
export const incidentService = {
  // Get all incidents with optional filters
  async getIncidents(filters?: {
    status?: string;
    severity?: string;
    type?: string;
    limitCount?: number;
  }) {
    let q = query(collection(db, 'incidents'), orderBy('reportedAt', 'desc'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.severity) {
      q = query(q, where('severity', '==', filters.severity));
    }
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters?.limitCount) {
      q = query(q, limit(filters.limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Incident[];
  },

  // Get single incident
  async getIncident(id: string) {
    const docRef = doc(db, 'incidents', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Incident;
    }
    return null;
  },

  // Create new incident
  async createIncident(incidentData: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt' | 'status'>) {
    const docRef = await addDoc(collection(db, 'incidents'), {
      ...incidentData,
      status: 'REPORTED',
      reportedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  },

  // Update incident
  async updateIncident(id: string, updates: Partial<Incident>) {
    const docRef = doc(db, 'incidents', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Delete incident
  async deleteIncident(id: string) {
    const docRef = doc(db, 'incidents', id);
    await deleteDoc(docRef);
  },

  // Listen to incidents in real-time
  subscribeToIncidents(callback: (incidents: Incident[]) => void, filters?: any) {
    let q = query(collection(db, 'incidents'), orderBy('reportedAt', 'desc'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    return onSnapshot(q, (snapshot) => {
      const incidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incident[];
      callback(incidents);
    });
  }
};

// Resource operations
export const resourceService = {
  // Get all resources
  async getResources(filters?: { type?: string; availableOnly?: boolean }) {
    let q = query(collection(db, 'resources'));
    
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    
    const snapshot = await getDocs(q);
    let resources = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Resource[];
    
    if (filters?.availableOnly) {
      resources = resources.filter(r => r.available > 0);
    }
    
    return resources;
  },

  // Get single resource
  async getResource(id: string) {
    const docRef = doc(db, 'resources', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Resource;
    }
    return null;
  },

  // Create new resource
  async createResource(resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...resourceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  },

  // Update resource
  async updateResource(id: string, updates: Partial<Resource>) {
    const docRef = doc(db, 'resources', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Subscribe to resources
  subscribeToResources(callback: (resources: Resource[]) => void) {
    const q = query(collection(db, 'resources'));
    
    return onSnapshot(q, (snapshot) => {
      const resources = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
      callback(resources);
    });
  }
};

// Resource allocation operations
export const allocationService = {
  // Get allocations for an incident
  async getAllocationsForIncident(incidentId: string) {
    const q = query(
      collection(db, 'resourceAllocations'),
      where('incidentId', '==', incidentId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ResourceAllocation[];
  },

  // Create allocation
  async createAllocation(allocationData: Omit<ResourceAllocation, 'id' | 'allocatedAt'>) {
    const docRef = await addDoc(collection(db, 'resourceAllocations'), {
      ...allocationData,
      allocatedAt: serverTimestamp()
    });
    
    return docRef.id;
  }
};