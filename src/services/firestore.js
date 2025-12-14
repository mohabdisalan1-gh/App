import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

// --- Subjects ---

export async function addSubject(userId, name, color = '#4f46e5') {
    try {
        await addDoc(collection(db, "subjects"), {
            userId,
            name,
            color,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding subject: ", error);
        throw error;
    }
}

export function subscribeToSubjects(userId, onUpdate, onError) {
    // Note: Creating a composite index might be required in Firestore Console if ordering by createdAt
    // For now we just query by userId.
    const q = query(
        collection(db, "subjects"),
        where("userId", "==", userId)
        // orderBy("createdAt", "desc") // requires index
    );

    return onSnapshot(q, (snapshot) => {
        const subjects = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        onUpdate(subjects);
    }, (error) => {
        console.error("Error fetching subjects:", error);
        if (onError) onError(error);
    });
}

export async function deleteSubject(subjectId) {
    try {
        await deleteDoc(doc(db, "subjects", subjectId));
    } catch (error) {
        console.error("Error deleting subject:", error);
        throw error;
    }
}

// --- Files ---

export async function addFileMetadata(userId, subjectId, fileData) {
    try {
        const docRef = await addDoc(collection(db, "files"), {
            userId,
            subjectId,
            ...fileData,
            isStarred: false,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...fileData };
    } catch (error) {
        console.error("Error adding file metadata:", error);
        throw error;
    }
}

export function subscribeToFiles(userId, subjectId, onUpdate, onError) {
    const q = query(
        collection(db, "files"),
        where("userId", "==", userId),
        where("subjectId", "==", subjectId)
    );

    return onSnapshot(q, (snapshot) => {
        const files = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        onUpdate(files);
    }, (error) => {
        console.error("Error fetching files:", error);
        if (onError) onError(error);
    });
}

export function subscribeToAllUserFiles(userId, onUpdate) {
    const q = query(
        collection(db, "files"),
        where("userId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const files = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        onUpdate(files);
    });
}

export async function deleteFileMetadata(fileId) {
    try {
        await deleteDoc(doc(db, "files", fileId));
    } catch (error) {
        console.error("Error deleting file metadata: ", error);
        throw error;
    }
}

export async function toggleFileStar(fileId, currentStatus) {
    try {
        await updateDoc(doc(db, "files", fileId), {
            isStarred: !currentStatus
        });
    } catch (error) {
        console.error("Error toggling star: ", error);
        throw error;
    }
}

export async function renameFile(fileId, newName) {
    try {
        await updateDoc(doc(db, "files", fileId), {
            name: newName
        });
    } catch (error) {
        console.error("Error renaming file: ", error);
        throw error;
    }
}
