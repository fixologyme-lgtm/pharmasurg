export interface Symptom {
  code: string
  label: string
  emoji: string
  category: 'Pharmacy First' | 'Minor Ailments'
}

export const SYMPTOMS: Symptom[] = [
  // NHS Pharmacy First pathways
  { code: 'sore-throat', label: 'Acute sore throat', emoji: '🤒', category: 'Pharmacy First' },
  { code: 'sinusitis', label: 'Acute sinusitis', emoji: '🤧', category: 'Pharmacy First' },
  { code: 'ear-infection', label: 'Ear infection (acute otitis media)', emoji: '👂', category: 'Pharmacy First' },
  { code: 'uti', label: 'Urinary tract infection (UTI)', emoji: '🚽', category: 'Pharmacy First' },
  { code: 'shingles', label: 'Shingles', emoji: '🩹', category: 'Pharmacy First' },
  { code: 'impetigo', label: 'Impetigo', emoji: '🦠', category: 'Pharmacy First' },
  { code: 'insect-bites', label: 'Infected insect bites', emoji: '🐛', category: 'Pharmacy First' },
  // Minor ailments
  { code: 'cold-flu', label: 'Cold / flu', emoji: '🤧', category: 'Minor Ailments' },
  { code: 'cough', label: 'Cough', emoji: '😮‍💨', category: 'Minor Ailments' },
  { code: 'congestion', label: 'Nasal congestion', emoji: '😤', category: 'Minor Ailments' },
  { code: 'eye', label: 'Eye irritation / conjunctivitis', emoji: '👁️', category: 'Minor Ailments' },
  { code: 'cold-sore', label: 'Cold sore', emoji: '💋', category: 'Minor Ailments' },
  { code: 'stomach', label: 'Stomach upset / diarrhoea', emoji: '🤢', category: 'Minor Ailments' },
  { code: 'constipation', label: 'Constipation', emoji: '😣', category: 'Minor Ailments' },
  { code: 'headache', label: 'Headache / migraine', emoji: '🤕', category: 'Minor Ailments' },
  { code: 'muscle-pain', label: 'Muscle or joint pain', emoji: '💪', category: 'Minor Ailments' },
  { code: 'rash', label: 'Skin rash', emoji: '🔴', category: 'Minor Ailments' },
  { code: 'allergy', label: 'Hay fever / allergies', emoji: '🌸', category: 'Minor Ailments' },
  { code: 'indigestion', label: 'Indigestion / heartburn', emoji: '🔥', category: 'Minor Ailments' },
  { code: 'mouth-ulcers', label: 'Mouth ulcers', emoji: '👄', category: 'Minor Ailments' },
  { code: 'other', label: 'Other minor ailment', emoji: '📋', category: 'Minor Ailments' },
]

export function searchSymptoms(query: string): Symptom[] {
  if (!query.trim()) return SYMPTOMS.slice(0, 8)
  const q = query.toLowerCase()
  return SYMPTOMS.filter(s =>
    s.label.toLowerCase().includes(q) ||
    s.code.includes(q) ||
    s.category.toLowerCase().includes(q)
  ).slice(0, 8)
}
