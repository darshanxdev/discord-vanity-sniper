interface CacheEntry<T> {
  value: T;
  expires?: number;
}

export class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      expires: ttl ? Date.now() + ttl : undefined,
    };
    this.store.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) return null;
    
    if (entry.expires && entry.expires < Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }
}
