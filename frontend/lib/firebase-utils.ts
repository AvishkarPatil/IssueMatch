import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// User types
export interface User {
  id: string;
  github_id: string;
  name: string;
  email: string;
  avatar_url: string;
  skill_keywords: string[];
  is_mentor: boolean;
  test_taken: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

// User operations
export const createOrUpdateGithubUser = async (githubUser: {
  id: string;
  login: string;
  avatar_url: string;
  name?: string | null;
  email?: string | null;
}) => {
  try {
    // Use GitHub ID as the document ID
    const userRef = doc(db, 'users', githubUser.id);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        name: githubUser.name || githubUser.login,
        avatar_url: githubUser.avatar_url,
        updated_at: serverTimestamp(),
        // Don't overwrite existing fields like skill_keywords or is_mentor
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        id: githubUser.id,
        github_id: githubUser.id,
        name: githubUser.name || githubUser.login,
        email: githubUser.email || '',
        avatar_url: githubUser.avatar_url,
        skill_keywords: [],
        is_mentor: false,
        test_taken: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating/updating GitHub user:', error);
    return { success: false, error };
  }
};

export const getUserByGithubId = async (githubId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', githubId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as User };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user by GitHub ID:', error);
    return { success: false, error };
  }
};

export const updateUserSkills = async (githubId: string, skills: string[]) => {
  try {
    await updateDoc(doc(db, 'users', githubId), {
      skill_keywords: skills,
      test_taken: true,
      updated_at: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user skills:', error);
    return { success: false, error };
  }
};

export const updateUserSkillsTestStatus = async (githubId: string, testTaken: boolean) => {
  try {
    await updateDoc(doc(db, 'users', githubId), {
      test_taken: testTaken,
      updated_at: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user skills test status:', error);
    return { success: false, error };
  }
};

export const updateMentorStatus = async (githubId: string, isMentor: boolean) => {
  try {
    await updateDoc(doc(db, 'users', githubId), {
      is_mentor: isMentor,
      updated_at: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating mentor status:', error);
    return { success: false, error };
  }
};

// Check if a user exists
export const checkUserExists = async (githubId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', githubId));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};