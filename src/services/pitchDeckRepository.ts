import { PitchDeck, PitchDeckRepository } from '@/types/pitchDeck';

// Local storage-based repository (similar to Android Room but for web)
export class LocalPitchDeckRepository implements PitchDeckRepository {
  private readonly STORAGE_KEY = 'pitchdecks';

  async getAllPitchDecks(): Promise<PitchDeck[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const pitchDecks = JSON.parse(stored) as PitchDeck[];
      return pitchDecks.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Failed to load pitch decks from storage:', error);
      return [];
    }
  }

  async getPitchDeckById(id: string): Promise<PitchDeck | null> {
    try {
      const pitchDecks = await this.getAllPitchDecks();
      return pitchDecks.find(deck => deck.id === id) || null;
    } catch (error) {
      console.error('Failed to get pitch deck by id:', error);
      return null;
    }
  }

  async savePitchDeck(pitchDeck: PitchDeck): Promise<void> {
    try {
      const isBusinessPlan = pitchDeck.id.startsWith('bp-');
      const itemType = isBusinessPlan ? 'business plan' : 'pitch deck';
      const itemCount = isBusinessPlan ? (pitchDeck as any).sections?.length : pitchDeck.slides?.length;
      console.log(`Saving ${itemType}:`, pitchDeck.title, 'with', itemCount, isBusinessPlan ? 'sections' : 'slides');
      const pitchDecks = await this.getAllPitchDecks();
      const existingIndex = pitchDecks.findIndex(deck => deck.id === pitchDeck.id);
      
      if (existingIndex >= 0) {
        pitchDecks[existingIndex] = pitchDeck;
        console.log('Updated existing pitch deck at index:', existingIndex);
      } else {
        pitchDecks.push(pitchDeck);
        console.log('Added new pitch deck, total count:', pitchDecks.length);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pitchDecks));
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.error('Failed to save pitch deck:', error);
      throw error;
    }
  }

  async updatePitchDeck(pitchDeck: PitchDeck): Promise<void> {
    return this.savePitchDeck(pitchDeck);
  }

  async deletePitchDeck(id: string): Promise<void> {
    try {
      const pitchDecks = await this.getAllPitchDecks();
      const filtered = pitchDecks.filter(deck => deck.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete pitch deck:', error);
      throw error;
    }
  }

  async updateCurrentSlide(id: string, slideNumber: number): Promise<void> {
    try {
      const pitchDeck = await this.getPitchDeckById(id);
      if (pitchDeck) {
        pitchDeck.currentSlide = slideNumber;
        await this.savePitchDeck(pitchDeck);
      }
    } catch (error) {
      console.error('Failed to update current slide:', error);
      throw error;
    }
  }

  async markPitchDeckCompleted(id: string): Promise<void> {
    try {
      const pitchDeck = await this.getPitchDeckById(id);
      if (pitchDeck) {
        pitchDeck.isCompleted = true;
        pitchDeck.completedAt = Date.now();
        await this.savePitchDeck(pitchDeck);
      }
    } catch (error) {
      console.error('Failed to mark pitch deck as completed:', error);
      throw error;
    }
  }
}

// IndexedDB-based repository for more robust storage (optional upgrade)
export class IndexedDBPitchDeckRepository implements PitchDeckRepository {
  private readonly DB_NAME = 'PitchDeckDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'pitchdecks';

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('industry', 'industry', { unique: false });
          store.createIndex('fundingStage', 'fundingStage', { unique: false });
        }
      };
    });
  }

  async getAllPitchDecks(): Promise<PitchDeck[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('createdAt');
        const request = index.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const pitchDecks = request.result as PitchDeck[];
          resolve(pitchDecks.sort((a, b) => b.createdAt - a.createdAt));
        };
      });
    } catch (error) {
      console.error('Failed to load pitch decks from IndexedDB:', error);
      return [];
    }
  }

  async getPitchDeckById(id: string): Promise<PitchDeck | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      });
    } catch (error) {
      console.error('Failed to get pitch deck by id from IndexedDB:', error);
      return null;
    }
  }

  async savePitchDeck(pitchDeck: PitchDeck): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(pitchDeck);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to save pitch deck to IndexedDB:', error);
      throw error;
    }
  }

  async updatePitchDeck(pitchDeck: PitchDeck): Promise<void> {
    return this.savePitchDeck(pitchDeck);
  }

  async deletePitchDeck(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(id);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to delete pitch deck from IndexedDB:', error);
      throw error;
    }
  }

  async updateCurrentSlide(id: string, slideNumber: number): Promise<void> {
    try {
      const pitchDeck = await this.getPitchDeckById(id);
      if (pitchDeck) {
        pitchDeck.currentSlide = slideNumber;
        await this.savePitchDeck(pitchDeck);
      }
    } catch (error) {
      console.error('Failed to update current slide in IndexedDB:', error);
      throw error;
    }
  }

  async markPitchDeckCompleted(id: string): Promise<void> {
    try {
      const pitchDeck = await this.getPitchDeckById(id);
      if (pitchDeck) {
        pitchDeck.isCompleted = true;
        pitchDeck.completedAt = Date.now();
        await this.savePitchDeck(pitchDeck);
      }
    } catch (error) {
      console.error('Failed to mark pitch deck as completed in IndexedDB:', error);
      throw error;
    }
  }
}