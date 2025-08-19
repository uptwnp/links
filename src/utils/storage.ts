import { AppData } from '../types/index';

const STORAGE_KEY = 'linkVault';

const defaultData: AppData = {
  links: [
    {
      id: '1',
      title: 'GitHub',
      url: 'https://github.com',
      description: 'The world\'s leading software development platform',
      folderId: '1',
      tags: ['development', 'productivity'],
      isFavorite: true,
      createdAt: '2024-01-15T10:30:00Z',
      clickCount: 15
    },
    {
      id: '2',
      title: 'Figma',
      url: 'https://figma.com',
      description: 'Collaborative interface design tool',
      folderId: '1',
      tags: ['design', 'productivity'],
      isFavorite: true,
      createdAt: '2024-01-14T14:20:00Z',
      clickCount: 12
    },
    {
      id: '3',
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      description: 'Where developers learn, share, & build careers',
      folderId: '1',
      tags: ['development', 'learning'],
      isFavorite: false,
      createdAt: '2024-01-13T09:15:00Z',
      clickCount: 8
    },
    {
      id: '4',
      title: 'Dribbble',
      url: 'https://dribbble.com',
      description: 'Discover the world\'s top designers & creatives',
      folderId: '1',
      tags: ['design', 'inspiration'],
      isFavorite: false,
      createdAt: '2024-01-12T16:45:00Z',
      clickCount: 5
    },
    {
      id: '5',
      title: 'Netflix',
      url: 'https://netflix.com',
      description: 'Watch TV shows and movies online',
      folderId: '2',
      tags: ['entertainment'],
      isFavorite: true,
      createdAt: '2024-01-11T20:30:00Z',
      clickCount: 25
    },
    {
      id: '6',
      title: 'Spotify',
      url: 'https://spotify.com',
      description: 'Music for everyone',
      folderId: '2',
      tags: ['entertainment', 'music'],
      isFavorite: true,
      createdAt: '2024-01-10T18:15:00Z',
      clickCount: 30
    },
    {
      id: '7',
      title: 'YouTube',
      url: 'https://youtube.com',
      description: 'Enjoy the videos and music you love',
      folderId: '2',
      tags: ['entertainment', 'learning'],
      isFavorite: false,
      createdAt: '2024-01-09T12:00:00Z',
      clickCount: 18
    },
    {
      id: '8',
      title: 'Medium',
      url: 'https://medium.com',
      description: 'A place to read and write big ideas',
      folderId: '2',
      tags: ['reading', 'learning'],
      isFavorite: false,
      createdAt: '2024-01-08T11:30:00Z',
      clickCount: 7
    },
    {
      id: '9',
      title: 'Coursera',
      url: 'https://coursera.org',
      description: 'Build skills with courses from top universities',
      folderId: '3',
      tags: ['learning', 'education'],
      isFavorite: true,
      createdAt: '2024-01-07T15:45:00Z',
      clickCount: 22
    },
    {
      id: '10',
      title: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      description: 'Resources for developers, by developers',
      folderId: '3',
      tags: ['development', 'learning', 'documentation'],
      isFavorite: true,
      createdAt: '2024-01-06T13:20:00Z',
      clickCount: 35
    },
    {
      id: '11',
      title: 'freeCodeCamp',
      url: 'https://freecodecamp.org',
      description: 'Learn to code for free',
      folderId: '3',
      tags: ['learning', 'development', 'free'],
      isFavorite: false,
      createdAt: '2024-01-05T10:10:00Z',
      clickCount: 14
    },
    {
      id: '12',
      title: 'Khan Academy',
      url: 'https://khanacademy.org',
      description: 'Free online courses, lessons and practice',
      folderId: '3',
      tags: ['learning', 'education', 'free'],
      isFavorite: false,
      createdAt: '2024-01-04T14:30:00Z',
      clickCount: 9
    },
    {
      id: '13',
      title: 'Notion',
      url: 'https://notion.so',
      description: 'One workspace. Every team.',
      folderId: '1',
      tags: ['productivity', 'organization'],
      isFavorite: true,
      createdAt: '2024-01-03T09:45:00Z',
      clickCount: 28
    },
    {
      id: '14',
      title: 'Slack',
      url: 'https://slack.com',
      description: 'Where work happens',
      folderId: '1',
      tags: ['productivity', 'communication'],
      isFavorite: false,
      createdAt: '2024-01-02T16:20:00Z',
      clickCount: 11
    },
    {
      id: '15',
      title: 'Discord',
      url: 'https://discord.com',
      description: 'Your place to talk',
      folderId: '2',
      tags: ['communication', 'gaming'],
      isFavorite: false,
      createdAt: '2024-01-01T19:15:00Z',
      clickCount: 16
    },
    {
      id: '16',
      title: 'Reddit',
      url: 'https://reddit.com',
      description: 'The front page of the internet',
      folderId: '2',
      tags: ['social', 'news'],
      isFavorite: false,
      createdAt: '2023-12-31T21:30:00Z',
      clickCount: 13
    },
    {
      id: '17',
      title: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
      description: 'A utility-first CSS framework',
      folderId: '3',
      tags: ['development', 'css', 'framework'],
      isFavorite: true,
      createdAt: '2023-12-30T08:45:00Z',
      clickCount: 20
    },
    {
      id: '18',
      title: 'React',
      url: 'https://react.dev',
      description: 'The library for web and native user interfaces',
      folderId: '3',
      tags: ['development', 'javascript', 'framework'],
      isFavorite: true,
      createdAt: '2023-12-29T12:15:00Z',
      clickCount: 32
    },
    {
      id: '19',
      title: 'TypeScript',
      url: 'https://typescriptlang.org',
      description: 'JavaScript with syntax for types',
      folderId: '3',
      tags: ['development', 'javascript', 'types'],
      isFavorite: false,
      createdAt: '2023-12-28T15:30:00Z',
      clickCount: 17
    },
    {
      id: '20',
      title: 'Vercel',
      url: 'https://vercel.com',
      description: 'Develop. Preview. Ship.',
      folderId: '1',
      tags: ['development', 'deployment', 'hosting'],
      isFavorite: false,
      createdAt: '2023-12-27T11:00:00Z',
      clickCount: 6
    }
  ],
  folders: [
    {
      id: '1',
      name: 'Work',
      color: '#6366F1',
      isExpanded: true
    },
    {
      id: '2',
      name: 'Personal',
      color: '#06B6D4',
      isExpanded: true
    },
    {
      id: '3',
      name: 'Learning',
      color: '#8B5CF6',
      isExpanded: true
    }
  ],
  tags: [
    {
      id: '1',
      name: 'productivity',
      color: '#059669'
    },
    {
      id: '2',
      name: 'design',
      color: '#DC2626'
    },
    {
      id: '3',
      name: 'development',
      color: '#2563EB'
    },
    {
      id: '4',
      name: 'learning',
      color: '#7C3AED'
    },
    {
      id: '5',
      name: 'entertainment',
      color: '#DB2777'
    },
    {
      id: '6',
      name: 'education',
      color: '#059669'
    },
    {
      id: '7',
      name: 'communication',
      color: '#0891B2'
    },
    {
      id: '8',
      name: 'music',
      color: '#65A30D'
    },
    {
      id: '9',
      name: 'reading',
      color: '#C2410C'
    },
    {
      id: '10',
      name: 'documentation',
      color: '#4338CA'
    },
    {
      id: '11',
      name: 'free',
      color: '#16A34A'
    },
    {
      id: '12',
      name: 'organization',
      color: '#9333EA'
    },
    {
      id: '13',
      name: 'gaming',
      color: '#BE185D'
    },
    {
      id: '14',
      name: 'social',
      color: '#0369A1'
    },
    {
      id: '15',
      name: 'news',
      color: '#DC2626'
    },
    {
      id: '16',
      name: 'css',
      color: '#0284C7'
    },
    {
      id: '17',
      name: 'javascript',
      color: '#CA8A04'
    },
    {
      id: '18',
      name: 'framework',
      color: '#7C2D12'
    },
    {
      id: '19',
      name: 'types',
      color: '#1D4ED8'
    },
    {
      id: '20',
      name: 'deployment',
      color: '#059669'
    },
    {
      id: '21',
      name: 'hosting',
      color: '#7C3AED'
    },
    {
      id: '22',
      name: 'inspiration',
      color: '#BE123C'
    }
  ],
  settings: {
    darkMode: false,
    viewMode: 'grid',
    searchTerm: '',
    selectedTags: [],
    selectedFolder: '',
    showFolders: false,
    showTags: false,
    showFavorites: false,
    sortBy: 'mostUsed'
  }
};

export const linkStorage = {
  save: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  load: (): Promise<AppData> => {
    return new Promise((resolve) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Merge with default data to ensure all properties exist
          resolve({
            ...defaultData,
            ...data,
            settings: {
              ...defaultData.settings,
              ...data.settings
            }
          });
        } else {
          // Save default data to localStorage on first load
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
          resolve(defaultData);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        resolve(defaultData);
      }
    });
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};