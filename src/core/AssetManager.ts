import { LoadingManager, TextureLoader, GLTFLoader, CubeTextureLoader, AudioLoader, FontLoader } from 'three';
import { DRACOLoader, KTX2Loader, MeshoptDecoder } from 'three/examples/jsm/Addons.js';
import { eventBus, GameEvents } from './EventBus';

interface AssetEntry {
  id: string;
  type: 'gltf' | 'texture' | 'cubetexture' | 'audio' | 'font' | 'json';
  url: string;
  data: any;
  loaded: boolean;
  error?: Error;
  size: number;
  lastUsed: number;
  refCount: number;
}

interface LoadOptions {
  priority?: 'high' | 'normal' | 'low';
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
}

interface AssetManifest {
  version: string;
  assets: Record<string, {
    type: string;
    url: string;
    size?: number;
    compressed?: boolean;
    fallback?: string;
  }>;
}

class AssetManager {
  private assets = new Map<string, AssetEntry>();
  private loading = new Map<string, Promise<any>>();
  private loadingManager: LoadingManager;
  private textureLoader: TextureLoader;
  private gltfLoader: GLTFLoader;
  private cubeTextureLoader: CubeTextureLoader;
  private audioLoader: AudioLoader;
  private fontLoader: FontLoader;
  private dracoLoader: DRACOLoader;
  private ktx2Loader: KTX2Loader;
  private meshoptDecoder: typeof MeshoptDecoder | null = null;
  private manifest: AssetManifest | null = null;
  private totalSize = 0;
  private loadedSize = 0;
  private maxCacheSize = 500 * 1024 * 1024; // 500MB
  private cleanupInterval: number | null = null;

  constructor() {
    this.loadingManager = new LoadingManager(
      () => this.onLoadComplete(),
      (url, loaded, total) => this.onLoadProgress(url, loaded, total),
      (url) => this.onLoadError(url)
    );

    this.textureLoader = new TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.cubeTextureLoader = new CubeTextureLoader(this.loadingManager);
    this.audioLoader = new AudioLoader(this.loadingManager);
    this.fontLoader = new FontLoader(this.loadingManager);

    this.setupLoaders();
    this.startCleanupTimer();
  }

  private setupLoaders(): void {
    // DRACO compression for GLTF
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // KTX2 texture compression
    this.ktx2Loader = new KTX2Loader(this.loadingManager);
    this.ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/libs/basis/');
    this.ktx2Loader.detectSupport({ renderer: null as any });

    // Meshopt compression
    this.initMeshoptDecoder();
  }

  private async initMeshoptDecoder(): Promise<void> {
    try {
      const MeshoptDecoder = await import('meshoptimizer');
      this.meshoptDecoder = MeshoptDecoder;
      await MeshoptDecoder.ready;
      this.gltfLoader.setMeshoptDecoder(MeshoptDecoder);
    } catch (e) {
      console.warn('[AssetManager] Meshopt decoder not available:', e);
    }
  }

  setManifest(manifest: AssetManifest): void {
    this.manifest = manifest;
  }

  async loadManifest(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      this.manifest = await response.json();
      console.log('[AssetManager] Manifest loaded:', Object.keys(this.manifest.assets).length, 'assets');
    } catch (e) {
      console.error('[AssetManager] Failed to load manifest:', e);
    }
  }

  // GLTF Models
  async loadGLTF(id: string, url?: string, options: LoadOptions = {}): Promise<any> {
    const assetUrl = url || this.manifest?.assets[id]?.url;
    if (!assetUrl) throw new Error(`No URL for asset: ${id}`);
    
    return this.loadWithCache(id, 'gltf', assetUrl, () => 
      this.gltfLoader.loadAsync(assetUrl), options);
  }

  // Textures
  async loadTexture(id: string, url?: string, options: LoadOptions = {}): Promise<any> {
    const assetUrl = url || this.manifest?.assets[id]?.url;
    if (!assetUrl) throw new Error(`No URL for asset: ${id}`);
    
    return this.loadWithCache(id, 'texture', assetUrl, () => 
      this.textureLoader.loadAsync(assetUrl), options);
  }

  // KTX2 compressed textures
  async loadKTX2Texture(id: string, url?: string, options: LoadOptions = {}): Promise<any> {
    const assetUrl = url || this.manifest?.assets[id]?.url;
    if (!assetUrl) throw new Error(`No URL for asset: ${id}`);
    
    return this.loadWithCache(id, 'texture', assetUrl, () => 
      this.ktx2Loader.loadAsync(assetUrl), options);
  }

  // Cube textures (skyboxes)
  async loadCubeTexture(id: string, urls: string[], options: LoadOptions = {}): Promise<any> {
    return this.loadWithCache(id, 'cubetexture', urls.join(','), () => 
      new Promise((resolve, reject) => {
        this.cubeTextureLoader.load(urls, resolve, undefined, reject);
      }), options);
  }

  // Audio
  async loadAudio(id: string, url?: string, options: LoadOptions = {}): Promise<any> {
    const assetUrl = url || this.manifest?.assets[id]?.url;
    if (!assetUrl) throw new Error(`No URL for asset: ${id}`);
    
    return this.loadWithCache(id, 'audio', assetUrl, () => 
      this.audioLoader.loadAsync(assetUrl), options);
  }

  // Fonts
  async loadFont(id: string, url?: string, options: LoadOptions = {}): Promise<any> {
    const assetUrl = url || this.manifest?.assets[id]?.url;
    if (!assetUrl) throw new Error(`No URL for asset: ${id}`);
    
    return this.loadWithCache(id, 'font', assetUrl, () => 
      this.fontLoader.loadAsync(assetUrl), options);
  }

  // JSON data
  async loadJSON(id: string, url?: string, options: LoadOptions = {}): Promise<any> {
    const assetUrl = url || this.manifest?.assets[id]?.url;
    if (!assetUrl) throw new Error(`No URL for asset: ${id}`);
    
    return this.loadWithCache(id, 'json', assetUrl, async () => {
      const response = await fetch(assetUrl);
      return response.json();
    }, options);
  }

  private async loadWithCache(
    id: string,
    type: AssetEntry['type'],
    url: string,
    loader: () => Promise<any>,
    options: LoadOptions
  ): Promise<any> {
    // Check cache first
    const cached = this.assets.get(id);
    if (cached && cached.loaded && cached.data) {
      cached.refCount++;
      cached.lastUsed = Date.now();
      return cached.data;
    }

    // Check if already loading
    if (this.loading.has(id)) {
      return this.loading.get(id)!;
    }

    // Start loading
    const promise = this.loadAsset(id, type, url, loader, options);
    this.loading.set(id, promise);
    
    try {
      const data = await promise;
      this.loading.delete(id);
      return data;
    } catch (e) {
      this.loading.delete(id);
      throw e;
    }
  }

  private async loadAsset(
    id: string,
    type: AssetEntry['type'],
    url: string,
    loader: () => Promise<any>,
    options: LoadOptions
  ): Promise<any> {
    const entry: AssetEntry = {
      id,
      type,
      url,
      data: null,
      loaded: false,
      size: 0,
      lastUsed: Date.now(),
      refCount: 1,
    };

    this.assets.set(id, entry);

    try {
      options.onProgress?.(0);
      
      const data = await loader();
      
      entry.data = data;
      entry.loaded = true;
      entry.size = this.estimateSize(data);
      this.totalSize += entry.size;
      
      // Check cache size and cleanup if needed
      if (this.totalSize > this.maxCacheSize) {
        this.cleanupOldAssets();
      }

      options.onProgress?.(1);
      return data;
    } catch (error) {
      entry.error = error as Error;
      entry.loaded = false;
      options.onError?.(error as Error);
      throw error;
    }
  }

  private estimateSize(data: any): number {
    if (!data) return 0;
    
    // Rough estimation
    if (data instanceof ArrayBuffer) return data.byteLength;
    if (typeof data === 'string') return data.length * 2;
    if (data.geometry) {
      // Three.js geometry
      let size = 0;
      if (data.geometry.attributes) {
        Object.values(data.geometry.attributes).forEach((attr: any) => {
          size += attr.array.byteLength || 0;
        });
      }
      if (data.geometry.index) size += data.geometry.index.array.byteLength || 0;
      return size;
    }
    if (data.textures) {
      // Material with textures
      return Object.values(data.textures).reduce((sum: number, t: any) => 
        sum + (t.image?.width || 0) * (t.image?.height || 0) * 4, 0);
    }
    return JSON.stringify(data).length * 2;
  }

  get(id: string): any {
    const entry = this.assets.get(id);
    if (entry && entry.loaded) {
      entry.refCount++;
      entry.lastUsed = Date.now();
      return entry.data;
    }
    return null;
  }

  has(id: string): boolean {
    const entry = this.assets.get(id);
    return !!entry?.loaded;
  }

  release(id: string): void {
    const entry = this.assets.get(id);
    if (entry) {
      entry.refCount = Math.max(0, entry.refCount - 1);
    }
  }

  preload(ids: string[]): Promise<any[]> {
    return Promise.all(ids.map(id => {
      const asset = this.manifest?.assets[id];
      if (!asset) return Promise.resolve();
      
      switch (asset.type) {
        case 'gltf': return this.loadGLTF(id);
        case 'texture': return this.loadTexture(id);
        case 'ktx2': return this.loadKTX2Texture(id);
        case 'audio': return this.loadAudio(id);
        case 'font': return this.loadFont(id);
        case 'json': return this.loadJSON(id);
        default: return Promise.resolve();
      }
    }));
  }

  getLoadingProgress(): { loaded: number; total: number; percent: number } {
    const total = this.manifest ? Object.keys(this.manifest.assets).length : this.loading.size;
    const loaded = Array.from(this.assets.values()).filter(a => a.loaded).length;
    return { loaded, total, percent: total > 0 ? loaded / total : 1 };
  }

  private onLoadComplete(): void {
    console.log('[AssetManager] All assets loaded');
    eventBus.emit(GameEvents.UI_OPEN, { type: 'loading_complete' });
  }

  private onLoadProgress(url: string, loaded: number, total: number): void {
    this.loadedSize = loaded;
    const progress = total > 0 ? loaded / total : 1;
    eventBus.emit('asset:progress', { url, loaded, total, progress });
  }

  private onLoadError(url: string): void {
    console.error('[AssetManager] Failed to load:', url);
    eventBus.emit('asset:error', { url });
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupOldAssets();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private cleanupOldAssets(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    let freed = 0;

    this.assets.forEach((entry, id) => {
      if (entry.refCount === 0 && entry.loaded && (now - entry.lastUsed) > maxAge) {
        // Dispose Three.js resources
        this.disposeAsset(entry);
        freed += entry.size;
        this.assets.delete(id);
      }
    });

    if (freed > 0) {
      this.totalSize = Math.max(0, this.totalSize - freed);
      console.log(`[AssetManager] Cleaned up ${(freed / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  private disposeAsset(entry: AssetEntry): void {
    if (!entry.data) return;

    if (entry.type === 'texture' && entry.data.dispose) {
      entry.data.dispose();
    } else if (entry.type === 'gltf' && entry.data.scene) {
      entry.data.scene.traverse((obj: any) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
  }

  clear(): void {
    this.assets.forEach(entry => this.disposeAsset(entry));
    this.assets.clear();
    this.loading.clear();
    this.totalSize = 0;
    this.loadedSize = 0;
  }

  getStats(): { totalAssets: number; loadedAssets: number; totalSize: number; cacheSize: number } {
    return {
      totalAssets: this.assets.size,
      loadedAssets: Array.from(this.assets.values()).filter(a => a.loaded).length,
      totalSize: this.totalSize,
      cacheSize: this.maxCacheSize,
    };
  }

  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    if (this.totalSize > size) {
      this.cleanupOldAssets();
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
    this.loadingManager = new LoadingManager();
  }
}

export const assetManager = new AssetManager();