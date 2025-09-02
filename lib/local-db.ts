// Local database fallback for development when Supabase is not accessible
interface Signature {
  id: string
  petition_id: string
  name: string
  email_hash: string
  zip_code: string
  display_public: boolean
  signed_at: string
}

interface SocialShare {
  id: string
  platform: string
  entity_type: string
  entity_id: string
  created_at: string
}

interface Petition {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: string
  created_at: string
}

class LocalDatabase {
  private signatures: Map<string, Signature> = new Map()
  private socialShares: Map<string, SocialShare> = new Map()
  private petitions: Map<string, Petition> = new Map()
  private signatureCounter = 1
  private socialShareCounter = 1

  constructor() {
    // Initialize with some sample data
    this.petitions.set('cmeky1irj0000f5yhzgv7ocqu', {
      id: 'cmeky1irj0000f5yhzgv7ocqu',
      title: 'Oppose HB 1481 - Device Restrictions',
      slug: 'hb1481-device-restrictions',
      description: 'Oppose restrictions on personal devices',
      category: 'privacy',
      status: 'active',
      created_at: new Date().toISOString()
    })
  }

  // Signatures
  async insertSignature(data: Omit<Signature, 'id' | 'signed_at'>): Promise<{ data: Signature[]; error: null }> {
    const id = `local_${this.signatureCounter++}`
    const signature: Signature = {
      ...data,
      id,
      signed_at: new Date().toISOString()
    }
    this.signatures.set(id, signature)
    return { data: [signature], error: null }
  }

  async selectSignatures(filters: { petition_id?: string; email_hash?: string }): Promise<{ data: Signature[]; error: null }> {
    let results = Array.from(this.signatures.values())
    
    if (filters.petition_id) {
      results = results.filter(s => s.petition_id === filters.petition_id)
    }
    
    if (filters.email_hash) {
      results = results.filter(s => s.email_hash === filters.email_hash)
    }
    
    return { data: results, error: null }
  }

  async countSignatures(petitionId: string): Promise<{ data: { count: number }[]; error: null }> {
    const count = Array.from(this.signatures.values()).filter(s => s.petition_id === petitionId).length
    return { data: [{ count }], error: null }
  }

  // Social Shares
  async insertSocialShare(data: Omit<SocialShare, 'id' | 'created_at'>): Promise<{ data: SocialShare[]; error: null }> {
    const id = `local_${this.socialShareCounter++}`
    const socialShare: SocialShare = {
      ...data,
      id,
      created_at: new Date().toISOString()
    }
    this.socialShares.set(id, socialShare)
    return { data: [socialShare], error: null }
  }

  async countSocialShares(entityType: string, entityId: string): Promise<{ data: { count: number }[]; error: null }> {
    const count = Array.from(this.socialShares.values())
      .filter(s => s.entity_type === entityType && s.entity_id === entityId).length
    return { data: [{ count }], error: null }
  }

  // Petitions
  async selectPetitions(): Promise<{ data: Petition[]; error: null }> {
    return { data: Array.from(this.petitions.values()), error: null }
  }

  // Get stats
  async getStats(): Promise<{ data: any; error: null }> {
    const totalSignatures = this.signatures.size
    const totalSocialShares = this.socialShares.size
    
    return {
      data: {
        signatures: totalSignatures,
        social_shares: totalSocialShares,
        petitions: this.petitions.size
      },
      error: null
    }
  }
}

// Singleton instance
const localDb = new LocalDatabase()

export { localDb }
export type { Signature, SocialShare, Petition }
