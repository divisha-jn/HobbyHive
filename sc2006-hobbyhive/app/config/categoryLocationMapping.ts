export interface CategoryLocationConfig {
  allowedLocationTypes: ('parks' | 'clubs' | 'libraries')[];
  primaryType: 'parks' | 'clubs' | 'libraries';
  showMapPicker: boolean;
  description: string;
}

export const categoryLocationMapping: Record<string, CategoryLocationConfig> = {
  "Sports & Fitness": {
    allowedLocationTypes: ['parks', 'clubs'],
    primaryType: 'parks',
    showMapPicker: true,
    description: "Select a park for outdoor sports or community club for indoor activities"
  },
  
  "Arts & Crafts": {
    allowedLocationTypes: ['clubs'],
    primaryType: 'clubs',
    showMapPicker: true,
    description: "Select a community club with arts and crafts facilities"
  },
  
  "Music": {
    allowedLocationTypes: ['clubs'],
    primaryType: 'clubs',
    showMapPicker: true,
    description: "Select a community club with music rooms"
  },
  
  "Gaming": {
    allowedLocationTypes: ['clubs'],
    primaryType: 'clubs',
    showMapPicker: true,
    description: "Select a community club or park for gaming activities"
  },
  
  "Cooking & Baking": {
    allowedLocationTypes: ['clubs'],
    primaryType: 'clubs',
    showMapPicker: true,
    description: "Select a community club with kitchen facilities"
  },
  
  "Outdoor Activities": {
    allowedLocationTypes: ['parks'],
    primaryType: 'parks',
    showMapPicker: true,
    description: "Select an outdoor park or nature area"
  },
  
  "Photography": {
    allowedLocationTypes: ['parks', 'clubs'],
    primaryType: 'parks',
    showMapPicker: true,
    description: "Select a scenic park or indoor club for photography"
  },
  
  "Dance": {
    allowedLocationTypes: ['clubs'],
    primaryType: 'clubs',
    showMapPicker: true,
    description: "Select a community club with dance studios"
  },
  
  "Reading & Books": {
    allowedLocationTypes: ['libraries', 'clubs'],
    primaryType: 'libraries',
    showMapPicker: true,
    description: "Select a library or community club for reading groups"
  },
  
  "Language Learning": {
    allowedLocationTypes: ['libraries', 'clubs'],
    primaryType: 'libraries',
    showMapPicker: true,
    description: "Select a library or community club for learning sessions"
  },
  
  "Other": {
    allowedLocationTypes: [],
    primaryType: 'clubs',
    showMapPicker: false,
    description: "Enter your event location manually"
  }
};

export function getLocationConfigForCategory(category: string): CategoryLocationConfig {
  return categoryLocationMapping[category] || categoryLocationMapping["Other"];
}
