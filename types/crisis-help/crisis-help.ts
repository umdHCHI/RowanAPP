

// UMN Duluth Crisis Help
export const crisisResources: CrisisResource[] = [
    {
      title: 'Campus Counseling Center',
      description: 'Professional counseling services available to all students. Confidential support for mental health concerns.',
      phone: '(218) 726-7913',
      website: 'https://health-services.d.umn.edu/counseling-services',
      hours: 'Mon-Fri: 8am-4pm',
    },
    {
      title: '24/7 Crisis Hotline',
      description: 'Immediate support available 24 hours a day, 7 days a week for mental health crises.',
      phone: '612-301-4673',
      website: 'https://www.sph.umn.edu/current/resources/mental-health/',
      hours: '24/7',
    },
    {
      title: 'Let\'s Talk: Drop-in Consultation',
      description: 'Free and confidential consultation and support available through brief, informal, drop in consultations.',
      phone: 'N/A',
      website: 'https://health-services.d.umn.edu/counseling-services/support-groups/lets-talk-drop-consultation',
      hours: 'Mon 10:00 a.m. - 12:00 p.m. in Library Room, KAML 441\nTuesdays 5:00 - 7:00 p.m. in LSH 175\nThursdays 1:00 - 3:00 p.m. in Library Room, KAML 441',
    },
    {
      title: 'Online Clinical Resources-Learn to Live',
      description: 'Learn to Live is an online mental health program based on Cognitive Behavioral Therapy (CBT), which assesses and delivers educational interventions on stress, depression and social anxiety.  This program offers confidential, 24/7 access and psychological tools for managing these issues.  Use access code: UMN',
      phone: 'N/A',
      website: 'https://www.learntolive.com/welcome/BCBSMN',
      hours: '24/7',
    },
  ]

export interface CrisisResource {
    title: string
    description: string
    phone?: string
    website?: string
    hours?: string
  }