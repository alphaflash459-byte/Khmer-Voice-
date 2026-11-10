export type VoiceId = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface VoiceProfile {
  id: VoiceId;
  nameKm: string;
  nameEn: string;
  gender: 'female' | 'male';
  genderKm: string;
  descriptionKm: string;
  descriptionEn: string;
  toneKm: string;
  toneEn: string;
  color: string;
  avatarBg: string;
  sampleAuditionText: string;
}

export interface StylePreset {
  id: string;
  labelKm: string;
  labelEn: string;
  icon: string;
  descriptionKm: string;
  prompt: string;
}

export interface SampleText {
  id: string;
  categoryKm: string;
  categoryEn: string;
  titleKm: string;
  titleEn: string;
  recommendedVoice: VoiceId;
  recommendedStyle: string;
  textKm: string;
}

export interface DialogueLine {
  id: string;
  speakerName: string;
  speakerKm: string;
  voice: VoiceId;
  style: string;
  text: string;
}

export interface AudioRecord {
  id: string;
  title: string;
  text: string;
  audioBase64: string;
  mimeType: string;
  voice: string;
  style: string;
  createdAt: number;
  duration?: number;
  mode: 'single' | 'dialogue';
}
