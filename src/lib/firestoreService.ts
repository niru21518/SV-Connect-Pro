import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { RegistrationData, RegistrationRecord } from "./types";

const COLLECTION_NAME = "registrations";

// Helper for generating Application ID (saved in DB, not shown to public user)
function generateApplicationId(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `SVC-${year}-${randomNum}`;
}

// Fallback in-memory/localStorage store for local development if Firebase connection is unavailable
const LOCAL_STORAGE_KEY = "sv_connect_pro_registrations";

function getLocalRegistrations(): RegistrationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(records: RegistrationRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save to local storage", err);
  }
}

export async function submitRegistration(
  data: RegistrationData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const applicationId = generateApplicationId();
  const createdAt = new Date().toISOString();

  try {
    const colRef = collection(db, COLLECTION_NAME);

    const docRef = await addDoc(colRef, {
      ...data,
      applicationId,
      createdAt: serverTimestamp(),
      createdAtIso: createdAt,
      status: "Pending",
    });

    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("Firestore registration save failed:", err);

    return {
      success: false,
      error: "Firestore registration save failed",
    };
  }
}

export async function fetchAllRegistrations(): Promise<RegistrationRecord[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy("createdAtIso", "desc"));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docs: RegistrationRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fullName: data.fullName || "",
          fatherName: data.fatherName || "",
          dob: data.dob || "",

          dobDay: data.dobDay || "",
          dobMonth: data.dobMonth || "",
          dobYear: data.dobYear || "",

          age: Number(data.age) || 0,
          gender: data.gender || "Other",

          mobileNumber: data.mobileNumber || "",
          state: data.state || "",
          district: data.district || "",
          villageTown: data.villageTown || "",
          pinCode: data.pinCode || "",

          qualification: data.qualification || "",
          occupation: data.occupation || "",

          schoolCollege: data.schoolCollege || "",
          companyName: data.companyName || "",
          businessDetails: data.businessDetails || "",

          preferredLanguage: data.preferredLanguage || "English",
          declarationAccepted: Boolean(data.declarationAccepted),
          applicationId: data.applicationId || d.id,
          createdAt: data.createdAtIso || new Date().toISOString(),
          status: data.status || "Pending",
        };
      });
      return docs;
    }
  } catch (err) {
    console.warn("Firestore fetch fallback activated:", err);
  }

  // Fallback to local storage if Firestore is empty or errored
  return getLocalRegistrations();
}

export async function deleteRegistrationRecord(id: string): Promise<boolean> {
  try {
    if (!id.startsWith("local_")) {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.warn("Firestore delete fallback activated:", err);
  }

  // Always sync local storage
  const current = getLocalRegistrations();
  const updated = current.filter(item => item.id !== id);
  saveLocalRegistrations(updated);

  return true;
}
