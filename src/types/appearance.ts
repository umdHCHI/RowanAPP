export interface Appearance {
    id: number;
    gender: 'masculine' | 'feminine' | 'nonbinary';
    skin: string;
    hair: string;
    clothes: string;
    glasses: string;
    eyes: string;
    mouth: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface AppearanceData {
    gender: 'masculine' | 'feminine' | 'nonbinary';
    skin: string;
    hair: string;
    clothes: string;
    glasses: string;
    eyes: string;
    mouth: string;
  }