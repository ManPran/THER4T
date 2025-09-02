import { create } from 'zustand';

export interface Story {
  id: string;
  name: string;
  location: string;
  role: string;
  issue: string;
  title: string;
  story: string;
  consent: boolean;
  createdAt: string;
  isApproved: boolean;
}

export interface StoriesResponse {
  stories: Story[];
  totalCount: number;
  pendingCount: number;
  roleCounts: {
    teachers: number;
    parents: number;
    students: number;
    others: number;
  };
}

interface StoriesStore {
  stories: Story[];
  totalCount: number;
  roleCounts: {
    teachers: number;
    parents: number;
    students: number;
    others: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStories: () => Promise<void>;
  createStory: (storyData: Omit<Story, 'id' | 'createdAt' | 'isApproved'>) => Promise<boolean>;
  setStories: (stories: Story[]) => void;
  setCounts: (counts: Omit<StoriesResponse, 'stories'>) => void;
  recalculateRoleCounts: () => void;
  clearError: () => void;
}

export const useStories = create<StoriesStore>((set, get) => ({
  stories: [],
  totalCount: 0,
  roleCounts: {
    teachers: 0,
    parents: 0,
    students: 0,
    others: 0,
  },
  isLoading: false,
  error: null,

  fetchStories: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/v1/stories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status}`);
      }

      const stories = await response.json();
      
      // Transform Supabase data to match our interface
      const transformedStories = stories.map((story: any) => ({
        id: story.id,
        name: story.name || 'Anonymous',
        location: story.location || 'Texas',
        role: story.role || 'community',
        issue: story.category || 'general',
        title: story.title,
        story: story.content_md,
        consent: true,
        createdAt: story.created_at,
        isApproved: story.is_approved,
      }));

      // Calculate role counts
        const roleCounts = {
        teachers: transformedStories.filter((s: any) => s.role === 'teacher').length,
        parents: transformedStories.filter((s: any) => s.role === 'parent').length,
        students: transformedStories.filter((s: any) => s.role === 'student').length,
        others: transformedStories.filter((s: any) => !['teacher', 'parent', 'student'].includes(s.role)).length,
      };
        
        set({
        stories: transformedStories,
        totalCount: transformedStories.length,
          roleCounts,
          isLoading: false,
          error: null,
        });
    } catch (error) {
      console.error('Error fetching stories:', error);
        set({
          isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stories',
        });
    }
  },

  createStory: async (storyData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Send story to Supabase API
      const response = await fetch('/api/v1/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit story');
      }

      const result = await response.json();
      
      if (result.success) {
        // Fetch updated stories from the API
        await get().fetchStories();
      return true;
      } else {
        throw new Error('Story submission failed');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create story',
      });
      return false;
    }
  },

  setStories: (stories) => {
    set({ stories });
  },
  
  setCounts: (counts) => {
    set({
      totalCount: counts.totalCount,
      roleCounts: counts.roleCounts,
    });
  },

  recalculateRoleCounts: () => {
    set(state => {
      const newRoleCounts = {
        teachers: 0,
        parents: 0,
        students: 0,
        others: 0,
      };
      

      
      state.stories.forEach(story => {
        if (story.role === 'teacher') {
          newRoleCounts.teachers += 1;
        } else if (story.role === 'parent') {
          newRoleCounts.parents += 1;
        } else if (story.role === 'student') {
          newRoleCounts.students += 1;
        } else {
          newRoleCounts.others += 1;
        }
      });
      

      
      return { roleCounts: newRoleCounts };
    });
  },

  clearError: () => set({ error: null }),
}));
