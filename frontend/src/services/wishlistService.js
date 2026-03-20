import api from './api'

export const wishlistService = {
  // Get all wishlists
  getWishlists: async (search = '') => {
    try {
      console.log('📥 Fetching wishlists...');
      const url = search ? `/wishlists?search=${encodeURIComponent(search)}` : '/wishlists'
      const response = await api.get(url)
      console.log('📦 Wishlists:', response.data);
      return response.data
    } catch (error) {
      console.error('❌ Error fetching wishlists:', error);
      throw error;
    }
  },

  // Create wishlist
  createWishlist: async (data) => {
    try {
      console.log('📤 Creating wishlist:', data);
      
      // Konversi ke format yang diterima backend
      const payload = {
        name: data.name,
        targetAmount: data.targetAmount || data.target_amount,
        savedAmount: data.savedAmount || data.saved_amount || 0
      };
      
      const response = await api.post('/wishlists', payload)
      console.log('✅ Wishlist created:', response.data);
      return response.data
    } catch (error) {
      console.error('❌ Error creating wishlist:', error);
      throw error;
    }
  },

  // Update wishlist
  updateWishlist: async (id, data) => {
    try {
      console.log(`📤 Updating wishlist ${id}:`, data);
      
      // Pastikan format data sesuai dengan yang diharapkan backend
      const response = await api.put(`/wishlists/${id}`, data)
      console.log('✅ Wishlist updated:', response.data);
      return response.data
    } catch (error) {
      console.error('❌ Error updating wishlist:', error);
      throw error;
    }
  },

  // Delete wishlist
  deleteWishlist: async (id) => {
    try {
      console.log('🗑️ Deleting wishlist:', id);
      const response = await api.delete(`/wishlists/${id}`)
      console.log('✅ Wishlist deleted:', response.data);
      return response.data
    } catch (error) {
      console.error('❌ Error deleting wishlist:', error);
      throw error;
    }
  },

  // AUTO-DETECT: Cari wishlist yang cocok dengan deskripsi
  detectWishlistFromDescription: async (description, wishlists) => {
    if (!description || !wishlists || wishlists.length === 0) {
      console.log('No description or wishlists')
      return null
    }
    
    const descLower = description.toLowerCase()
    console.log('Searching for:', descLower, 'in', wishlists.length, 'wishlists')
    
    // Cari wishlist yang namanya ada di dalam deskripsi
    let matchedWishlist = null
    let bestMatchScore = 0
    
    wishlists.forEach(wishlist => {
      const wishlistName = wishlist.name.toLowerCase()
      
      // Exact match
      if (descLower.includes(wishlistName)) {
        const score = wishlistName.length
        if (score > bestMatchScore) {
          bestMatchScore = score
          matchedWishlist = wishlist
        }
      }
      
      // Partial match (kata per kata)
      const words = descLower.split(' ')
      words.forEach(word => {
        if (word.length > 3 && wishlistName.includes(word)) {
          const score = word.length
          if (score > bestMatchScore) {
            bestMatchScore = score
            matchedWishlist = wishlist
          }
        }
      })
    })
    
    if (matchedWishlist) {
      console.log('Matched wishlist:', matchedWishlist.name, 'with score:', bestMatchScore)
    }
    
    return matchedWishlist
  },
};