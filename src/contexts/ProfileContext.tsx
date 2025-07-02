"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { UserProfile } from "@/types/profile";

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (friendId: string, nickname: string) => Promise<void>;
  getProfileByFriendId: (friendId: string) => Promise<UserProfile | null>;
  deleteProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  updateProfile: async () => {},
  getProfileByFriendId: async () => null,
  deleteProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, "profiles", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (friendId: string, nickname: string) => {
    if (!user) return;

    try {
      const profileRef = doc(db, "profiles", user.uid);
      const profileData: UserProfile = {
        userId: user.uid,
        friendId,
        nickname,
        lastUpdated: new Date(),
      };

      await setDoc(profileRef, profileData);
      setProfile(profileData);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const getProfileByFriendId = async (
    friendId: string
  ): Promise<UserProfile | null> => {
    try {
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("friendId", "==", friendId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data() as UserProfile;
    } catch (error) {
      console.error("Error fetching profile by friend ID:", error);
      return null;
    }
  };

  const deleteProfile = async () => {
    if (!user) return;

    try {
      const profileRef = doc(db, "profiles", user.uid);
      await deleteDoc(profileRef);
      setProfile(null);
    } catch (error) {
      console.error("Error deleting profile:", error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        getProfileByFriendId,
        deleteProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
