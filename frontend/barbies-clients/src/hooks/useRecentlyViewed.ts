import { useState, useEffect, useCallback } from 'react';
import { Product, RecentlyViewedItem } from '../types';

const MAX_RECENTLY_VIEWED = 20;
const STORAGE_KEY = 'recentlyViewed';

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  // Save to localStorage whenever the list changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  const loadRecentlyViewed = () => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const items: RecentlyViewedItem[] = JSON.parse(saved);
          // Filter out items older than 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const validItems = items.filter(item => 
            new Date(item.viewedAt) > thirtyDaysAgo
          );
          
          setRecentlyViewed(validItems);
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed items:', error);
    }
  };

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.product._id !== product._id);
      
      // Find existing item to update view count
      const existing = prev.find(item => item.product._id === product._id);
      const viewCount = existing ? existing.viewCount + 1 : 1;
      
      // Add to beginning of array
      const newItem: RecentlyViewedItem = {
        product,
        viewedAt: new Date().toISOString(),
        viewCount,
      };
      
      const newList = [newItem, ...filtered];
      
      // Limit to max items
      return newList.slice(0, MAX_RECENTLY_VIEWED);
    });
  }, []);

  const removeFromRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewed(prev => prev.filter(item => item.product._id !== productId));
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const getRecentlyViewed = useCallback((limit?: number) => {
    return limit ? recentlyViewed.slice(0, limit) : recentlyViewed;
  }, [recentlyViewed]);

  const isRecentlyViewed = useCallback((productId: string): boolean => {
    return recentlyViewed.some(item => item.product._id === productId);
  }, [recentlyViewed]);

  const getViewCount = useCallback((productId: string): number => {
    const item = recentlyViewed.find(item => item.product._id === productId);
    return item?.viewCount || 0;
  }, [recentlyViewed]);

  const getMostViewed = useCallback((limit: number = 5) => {
    return [...recentlyViewed]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }, [recentlyViewed]);

  const getRecentByCategory = useCallback((categoryId: string, limit: number = 5) => {
    return recentlyViewed
      .filter(item => item.product.category._id === categoryId)
      .slice(0, limit);
  }, [recentlyViewed]);

  // Sync with server for authenticated users
  const syncWithServer = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;

      // Send recently viewed data to server
      await fetch('/api/user/recently-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: recentlyViewed.map(item => ({
            productId: item.product._id,
            viewedAt: item.viewedAt,
            viewCount: item.viewCount,
          })),
        }),
      });

      // Fetch updated recently viewed from server (might include data from other devices)
      const response = await fetch('/api/user/recently-viewed', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          setRecentlyViewed(data.items);
        }
      }
    } catch (error) {
      console.error('Error syncing recently viewed with server:', error);
    } finally {
      setLoading(false);
    }
  }, [recentlyViewed]);

  return {
    recentlyViewed,
    loading,
    addToRecentlyViewed,
    removeFromRecentlyViewed,
    clearRecentlyViewed,
    getRecentlyViewed,
    isRecentlyViewed,
    getViewCount,
    getMostViewed,
    getRecentByCategory,
    syncWithServer,
    totalCount: recentlyViewed.length,
  };
};
