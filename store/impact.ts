import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ImpactCounts {
  [category: string]: number
  globalTotal: number
}

interface ImpactState {
  counts: ImpactCounts
  isLoading: boolean
  lastUpdated: string | null
}

interface ImpactActions {
  setAll: (newCounts: ImpactCounts) => void
  increment: (category: string, delta: number) => void
  setLoading: (loading: boolean) => void
  reset: () => void
  optimisticIncrement: (category: string, delta: number) => void
  rollbackOptimistic: (category: string, originalCount: number) => void
}

const initialState: ImpactCounts = {
  education: 0,
  speech: 0,
  privacy: 0,
  healthcare: 0,
  voting: 0,
  globalTotal: 0,
}

export const useImpactStore = create<ImpactState & ImpactActions>()(
  devtools(
    (set, get) => ({
      // State
      counts: initialState,
      isLoading: false,
      lastUpdated: null,

      // Actions
      setAll: (newCounts: ImpactCounts) => {
        set((state) => ({
          counts: { ...state.counts, ...newCounts },
          lastUpdated: new Date().toISOString(),
        }))
      },

      increment: (category: string, delta: number) => {
        set((state) => {
          const newCounts = { ...state.counts }
          newCounts[category] = (newCounts[category] || 0) + delta
          newCounts.globalTotal = Math.max(0, newCounts.globalTotal + delta)
          
          return {
            counts: newCounts,
            lastUpdated: new Date().toISOString(),
          }
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      reset: () => {
        set({
          counts: initialState,
          isLoading: false,
          lastUpdated: null,
        })
      },

      optimisticIncrement: (category: string, delta: number) => {
        set((state) => {
          const newCounts = { ...state.counts }
          newCounts[category] = (newCounts[category] || 0) + delta
          newCounts.globalTotal = Math.max(0, newCounts.globalTotal + delta)
          
          return {
            counts: newCounts,
          }
        })
      },

      rollbackOptimistic: (category: string, originalCount: number) => {
        set((state) => {
          const newCounts = { ...state.counts }
          const currentCount = newCounts[category] || 0
          const delta = currentCount - originalCount
          
          newCounts[category] = originalCount
          newCounts.globalTotal = Math.max(0, newCounts.globalTotal - delta)
          
          return {
            counts: newCounts,
          }
        })
      },
    }),
    {
      name: 'impact-store',
    }
  )
)

// Hook for easy access to impact store
export const useImpact = () => {
  const store = useImpactStore()
  
  return {
    ...store,
    // Computed values
    getCategoryCount: (category: string) => store.counts[category] || 0,
    getGlobalTotal: () => store.counts.globalTotal,
    getCategories: () => Object.keys(store.counts).filter(key => key !== 'globalTotal'),
    
    // Helper methods
    updateFromPetitionResponse: (response: { success: boolean; category: string; newCounts: ImpactCounts }) => {
      if (response.success) {
        store.setAll(response.newCounts)
      }
    },
  }
}

// Utility function to fetch impact data from API
export const fetchImpactData = async (): Promise<ImpactCounts> => {
  try {
    const response = await fetch('/api/impact')
    if (!response.ok) {
      throw new Error(`Failed to fetch impact data: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching impact data:', error)
    // Return fallback data
    return {
      education: 0,
      speech: 0,
      privacy: 0,
      healthcare: 0,
      voting: 0,
      globalTotal: 0,
    }
  }
}

// Utility function to sign petition and update impact
export const signPetitionAndUpdateImpact = async (
  petitionId: string, 
  signatureData: any
): Promise<{ success: boolean; category: string; newCounts: ImpactCounts }> => {
  try {
    const response = await fetch(`/api/petitions/${petitionId}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signatureData),
    })

    if (!response.ok) {
      throw new Error(`Petition signing failed: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error signing petition:', error)
    throw error
  }
}
