export interface Appearance {
    id: number;
    gender: 'masculine' | 'feminine' | 'nonbinary';
    skin: number;
    hair: number;
    clothes: number;
    glasses: number;
    background: number;
    eyes: number;
    mouth: number;
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

  export interface CharacterAppearance {
  gender: 'masculine' | 'feminine' | 'nonbinary';
  skin: number;
  hair: number;
  clothes: number;
  glasses: number;
  eyes: number;
  mouth: number;
  background: number;
  isComplete: boolean;
}