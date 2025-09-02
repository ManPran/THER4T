import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface PlatformStats {
  petitionSignatures: number
  storiesShared: number
  socialShares: number
  totalEngagement: number
}

interface StatsState {
  stats: PlatformStats
  isLoading: boolean
  lastUpdated: string | null
  error: string | null
}

interface StatsActions {
  setStats: (stats: PlatformStats) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  optimisticIncrement: (metric: keyof Omit<PlatformStats, 'totalEngagement'>) => void
  rollbackOptimistic: (metric: keyof Omit<PlatformStats, 'totalEngagement'>, originalCount: number) => void
  fetchStats: () => Promise<void>
  incrementShare: () => Promise<void>
}

const initialState: PlatformStats = {
  petitionSignatures: 0,
  storiesShared: 0,
  socialShares: 0,
  totalEngagement: 0,
}

export const useStatsStore = create<StatsState & StatsActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        stats: initialState,
        isLoading: false,
        lastUpdated: null,
        error: null,
        
        // Initialize with clean state
        init: () => {
          set({
            stats: initialState,
            isLoading: false,
            lastUpdated: null,
            error: null,
          })
        },

        // Actions
        setStats: (stats: PlatformStats) => {
          set((state) => ({
            stats,
            lastUpdated: new Date().toISOString(),
            error: null,
          }))
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        setError: (error: string | null) => {
          set({ error })
        },

        reset: () => {
          set({
            stats: initialState,
            isLoading: false,
            lastUpdated: null,
            error: null,
          })
        },
        
        clearPersistedData: () => {
          // Clear localStorage and reset to initial state
          if (typeof window !== 'undefined') {
            localStorage.removeItem('stats-store')
          }
          set({
            stats: initialState,
            isLoading: false,
            lastUpdated: null,
            error: null,
          })
        },

        optimisticIncrement: (metric: keyof Omit<PlatformStats, 'totalEngagement'>) => {
          set((state) => {
            const newStats = { ...state.stats }
            newStats[metric] += 1
            newStats.totalEngagement = newStats.petitionSignatures + newStats.storiesShared + newStats.socialShares
            
            return { stats: newStats }
          })
        },

        rollbackOptimistic: (metric: keyof Omit<PlatformStats, 'totalEngagement'>, originalCount: number) => {
          set((state) => {
            const newStats = { ...state.stats }
            newStats[metric] = originalCount
            newStats.totalEngagement = newStats.petitionSignatures + newStats.storiesShared + newStats.socialShares
            
            return { stats: newStats }
          })
        },

        fetchStats: async () => {
          const { setLoading, setStats, setError } = get()
          
          try {
            setLoading(true)
            setError(null)
            
            const response = await fetch('/api/v1/stats/platform', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            
            if (!response.ok) {
              throw new Error(`Failed to fetch stats: ${response.status}`)
            }
            
            const apiStats = await response.json()
            
            // Map the API response to our expected structure
            const stats: PlatformStats = {
              petitionSignatures: apiStats.signatures || 0,
              storiesShared: 0, // Not implemented yet
              socialShares: apiStats.social_shares || 0,
              totalEngagement: apiStats.total_impact || 0,
            }
            
            setStats(stats)
          } catch (error) {
            console.error('Error fetching stats:', error)
            
            // Don't update stats on error - keep existing values
            // This prevents the UI from breaking when backend is temporarily unavailable
            setError('Backend temporarily unavailable - keeping existing stats')
          } finally {
            setLoading(false)
          }
        },

        incrementShare: async () => {
          const { optimisticIncrement, rollbackOptimistic, fetchStats } = get()
          const originalCount = get().stats.socialShares
          
          try {
            // Optimistically increment the share count
            optimisticIncrement('socialShares')
            
            // Send the share to the backend via our API
            const response = await fetch('/api/v1/social-shares', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                platform: 'web',
                entityType: 'general',
              }),
            })
            
            if (!response.ok) {
              throw new Error(`Failed to record share: ${response.status}`)
            }
            
            // Refresh stats from the backend to ensure consistency
            await fetchStats()
          } catch (error) {
            console.error('Error recording share:', error)
            
            // If backend is not available, keep the optimistic update
            // This allows the app to work offline
            if (error instanceof TypeError && error.message.includes('fetch')) {
              return // Keep the optimistic increment
            }
            
            // For other errors, rollback the optimistic update
            rollbackOptimistic('socialShares', originalCount)
            throw error
          }
        },
      }),
      {
        name: 'stats-store',
        partialize: (state) => ({ stats: state.stats, lastUpdated: state.lastUpdated }),
      }
    ),
    {
      name: 'stats-store',
    }
  )
)

// Hook for easy access to stats store
export const useStats = () => {
  const store = useStatsStore()
  
  return {
    ...store,
    // Computed values
    getPetitionSignatures: () => store.stats.petitionSignatures,
    getStoriesShared: () => store.stats.storiesShared,
    getSocialShares: () => store.stats.socialShares,
    getTotalEngagement: () => store.stats.totalEngagement,
  }
}
