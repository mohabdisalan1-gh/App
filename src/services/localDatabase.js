const DB_NAME = 'PDFManagerDB';
const DB_VERSION = 1;
const STORES = {
    USERS: 'users',
    SUBJECTS: 'subjects',
    FILES: 'files', // Metadata
    BLOBS: 'blobs'  // Actual File content
};

let dbInstance = null;
const listeners = new Map(); // key: collection_id, value: callback array

// --- Core Helper Functions ---

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Users
            if (!db.objectStoreNames.contains(STORES.USERS)) {
                const store = db.createObjectStore(STORES.USERS, { keyPath: 'uid' });
                store.createIndex('email', 'email', { unique: true });
            }
            // Subjects
            if (!db.objectStoreNames.contains(STORES.SUBJECTS)) {
                const store = db.createObjectStore(STORES.SUBJECTS, { keyPath: 'id' });
                store.createIndex('userId', 'userId', { unique: false });
            }
            // Files Metadata
            if (!db.objectStoreNames.contains(STORES.FILES)) {
                const store = db.createObjectStore(STORES.FILES, { keyPath: 'id' });
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('subjectId', 'subjectId', { unique: false });
            }
            // File Blobs (Content)
            if (!db.objectStoreNames.contains(STORES.BLOBS)) {
                db.createObjectStore(STORES.BLOBS, { keyPath: 'path' });
            }
        };
    });
}

function notifyListeners(collectionName) {
    // A simple trigger to tell subscribers "something changed, re-fetch"
    // In a real generic implementation, we'd pass the change, but for this app's logic
    // our subscribers usually just re-query everything based on userId.
    for (const [key, callback] of listeners.entries()) {
        if (key.startsWith(collectionName)) {
            callback(); // Trigger update
        }
    }
}

// --- Generic Operations ---

async function add(storeName, item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.add(item);

        request.onsuccess = () => {
            notifyListeners(storeName);
            resolve(item);
        };
        request.onerror = () => reject(request.error);
    });
}

async function put(storeName, item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
            notifyListeners(storeName);
            resolve(item);
        };
        request.onerror = () => reject(request.error);
    });
}

async function get(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllByIndex(storeName, indexName, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => {
            // Sort manually if needed, but for now just return
            // Our app sorts by date usually
            let results = request.result || [];
            if (results.length > 0 && results[0].createdAt) {
                results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

async function remove(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
            notifyListeners(storeName);
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
}


// --- Specific Exported Functions ---

// Auth
export async function localSignup(email, password, displayName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.USERS, 'readwrite');
        const store = tx.objectStore(STORES.USERS);
        const index = store.index('email');

        index.get(email).onsuccess = (e) => {
            if (e.target.result) {
                reject(new Error("Email already exists"));
            } else {
                const uid = 'loc_' + Date.now();
                const newUser = { uid, email, password, displayName, createdAt: new Date().toISOString() };
                store.add(newUser).onsuccess = () => resolve({ ...newUser, password: null }); // Don't return password
            }
        };
    });
}

export async function localLogin(email, password) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.USERS, 'readonly');
        const store = tx.objectStore(STORES.USERS);
        const index = store.index('email');

        index.get(email).onsuccess = (e) => {
            const user = e.target.result;
            if (user && user.password === password) {
                resolve({ ...user, password: null });
            } else {
                reject(new Error("Invalid email or password"));
            }
        };
    });
}

// Subjects
export async function addLocalSubject(subject) {
    return add(STORES.SUBJECTS, subject);
}

export function subscribeToLocalSubjects(userId, onUpdate) {
    const key = `${STORES.SUBJECTS}_${userId}`;

    // Initial Fetch
    getAllByIndex(STORES.SUBJECTS, 'userId', userId).then(onUpdate);

    // Register Listener
    const callback = () => {
        getAllByIndex(STORES.SUBJECTS, 'userId', userId).then(onUpdate);
    };

    listeners.set(key, callback);

    return () => listeners.delete(key); // Unsubscribe
}

export async function deleteLocalSubject(id) {
    return remove(STORES.SUBJECTS, id);
}

// Files (Metadata)
export async function addLocalFile(fileData) {
    return add(STORES.FILES, fileData);
}

export function subscribeToLocalFiles(userId, subjectId, onUpdate) {
    const key = `${STORES.FILES}_${userId}_${subjectId}`;

    const fetchAndFilter = async () => {
        // IDB doesn't support complex compound queries natively easily
        // So we fetch all user files and filter by subject in JS
        const allUserFiles = await getAllByIndex(STORES.FILES, 'userId', userId);
        const filtered = allUserFiles.filter(f => f.subjectId === subjectId);
        onUpdate(filtered);
    };

    fetchAndFilter();

    const callback = fetchAndFilter;
    listeners.set(key, callback);

    return () => listeners.delete(key);
}

export function subscribeToAllUserFiles(userId, onUpdate) {
    const key = `${STORES.FILES}_${userId}_all`;

    const fetchAll = async () => {
        const allUserFiles = await getAllByIndex(STORES.FILES, 'userId', userId);
        onUpdate(allUserFiles);
    };

    fetchAll();

    const callback = fetchAll;
    listeners.set(key, callback);

    return () => listeners.delete(key);
}

export async function deleteLocalFile(id) {
    return remove(STORES.FILES, id);
}

export async function updateLocalFile(id, updates) {
    const item = await get(STORES.FILES, id);
    if (!item) throw new Error("File not found");
    const updated = { ...item, ...updates };
    return put(STORES.FILES, updated);
}

// Blobs (Storage)
export async function saveFileBlob(path, file) {
    // Store file as Blob
    return put(STORES.BLOBS, { path, blob: file });
}

export async function getFileBlob(path) {
    const result = await get(STORES.BLOBS, path);
    return result ? result.blob : null;
}

export async function deleteFileBlob(path) {
    return remove(STORES.BLOBS, path);
}
