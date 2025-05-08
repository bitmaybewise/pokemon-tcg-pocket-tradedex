'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, getDocs, setDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';

interface CollectionContextType {
  cardQuantities: Record<string, number>;
  incrementCardQuantity: (cardId: string) => Promise<void>;
  decrementCardQuantity: (cardId: string) => Promise<void>;
  loading: boolean;
}

const CollectionContext = createContext<CollectionContextType>({
  cardQuantities: {},
  incrementCardQuantity: async () => {},
  decrementCardQuantity: async () => {},
  loading: true,
});

export const useCollection = () => useContext(CollectionContext);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCardQuantities({});
      setLoading(false);
      return;
    }

    const fetchCollection = async () => {
      try {
        const ownedCardsRef = collection(db, 'owned_cards');
        const q = query(ownedCardsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const quantities: Record<string, number> = {};
        querySnapshot.forEach((doc) => {
          quantities[doc.data().cardId] = doc.data().quantity;
        });
        
        setCardQuantities(quantities);
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [user]);

  const incrementCardQuantity = async (cardId: string) => {
    if (!user) return;

    try {
      const ownedCardRef = doc(db, 'owned_cards', `${user.uid}_${cardId}`);
      const currentQuantity = cardQuantities[cardId] || 0;
      const newQuantity = currentQuantity + 1;
      
      await setDoc(ownedCardRef, {
        userId: user.uid,
        cardId: cardId,
        quantity: newQuantity,
        lastUpdated: new Date()
      }, { merge: true });

      setCardQuantities(prev => ({
        ...prev,
        [cardId]: newQuantity,
      }));
    } catch (error) {
      console.error('Error updating card quantity:', error);
    }
  };

  const decrementCardQuantity = async (cardId: string) => {
    if (!user) return;

    try {
      const ownedCardRef = doc(db, 'owned_cards', `${user.uid}_${cardId}`);
      const currentQuantity = cardQuantities[cardId] || 0;
      
      if (currentQuantity <= 1) {
        // If quantity would become 0, delete the document
        await deleteDoc(ownedCardRef);
        setCardQuantities(prev => {
          const newQuantities = { ...prev };
          delete newQuantities[cardId];
          return newQuantities;
        });
      } else {
        // Otherwise, decrement the quantity
        const newQuantity = currentQuantity - 1;
        await setDoc(ownedCardRef, {
          userId: user.uid,
          cardId: cardId,
          quantity: newQuantity,
          lastUpdated: new Date()
        }, { merge: true });

        setCardQuantities(prev => ({
          ...prev,
          [cardId]: newQuantity,
        }));
      }
    } catch (error) {
      console.error('Error updating card quantity:', error);
    }
  };

  return (
    <CollectionContext.Provider value={{ cardQuantities, incrementCardQuantity, decrementCardQuantity, loading }}>
      {children}
    </CollectionContext.Provider>
  );
}

export async function getCollectionByFriendId(friendId: string): Promise<Record<string, number>> {
  try {
    // 1. Lookup userId by friendId
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('friendId', '==', friendId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return {};
    const userId = querySnapshot.docs[0].data().userId;

    // 2. Fetch owned_cards for that userId
    const ownedCardsRef = collection(db, 'owned_cards');
    const cardsQuery = query(ownedCardsRef, where('userId', '==', userId));
    const cardsSnapshot = await getDocs(cardsQuery);
    const quantities: Record<string, number> = {};
    cardsSnapshot.forEach((doc) => {
      quantities[doc.data().cardId] = doc.data().quantity;
    });
    return quantities;
  } catch (error) {
    console.error('Error fetching collection by friendId:', error);
    return {};
  }
} 