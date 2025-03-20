import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity contract calls
const mockFishers = new Map()
const mockPrincipalToFisher = new Map()
let mockNextFisherId = 1

// Mock contract functions
const mockContract = {
  registerFisher: (name, location, vesselName, vesselSize, licenseNumber) => {
    const fisherId = mockNextFisherId
    const txSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Mock sender
    
    if (mockPrincipalToFisher.has(txSender)) {
      return { error: 1 } // Already registered
    }
    
    mockFishers.set(fisherId, {
      name,
      location,
      "vessel-name": vesselName,
      "vessel-size": vesselSize,
      "license-number": licenseNumber,
      "registered-at": 123, // Mock block height
      active: true,
    })
    
    mockPrincipalToFisher.set(txSender, fisherId)
    mockNextFisherId++
    
    return { value: fisherId }
  },
  
  updateFisherDetails: (name, location, vesselName, vesselSize, licenseNumber) => {
    const txSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Mock sender
    
    if (!mockPrincipalToFisher.has(txSender)) {
      return { error: 2 } // Not registered
    }
    
    const fisherId = mockPrincipalToFisher.get(txSender)
    const fisher = mockFishers.get(fisherId)
    
    if (!fisher) {
      return { error: 3 } // Fisher not found
    }
    
    mockFishers.set(fisherId, {
      name,
      location,
      "vessel-name": vesselName,
      "vessel-size": vesselSize,
      "license-number": licenseNumber,
      "registered-at": fisher["registered-at"],
      active: fisher.active,
    })
    
    return { value: true }
  },
  
  deactivateFisher: () => {
    const txSender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Mock sender
    
    if (!mockPrincipalToFisher.has(txSender)) {
      return { error: 2 } // Not registered
    }
    
    const fisherId = mockPrincipalToFisher.get(txSender)
    const fisher = mockFishers.get(fisherId)
    
    if (!fisher) {
      return { error: 3 } // Fisher not found
    }
    
    mockFishers.set(fisherId, {
      ...fisher,
      active: false,
    })
    
    return { value: true }
  },
  
  getFisherById: (fisherId) => {
    return mockFishers.get(fisherId)
  },
  
  getFisherIdByPrincipal: (principal) => {
    return mockPrincipalToFisher.get(principal)
  },
  
  getTotalFishers: () => {
    return mockNextFisherId - 1
  },
}

describe("Fisher Registration Contract", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFishers.clear()
    mockPrincipalToFisher.clear()
    mockNextFisherId = 1
  })
  
  it("should register a new fisher", () => {
    const result = mockContract.registerFisher("John Doe", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    expect(result).toHaveProperty("value")
    expect(result.value).toBe(1)
    expect(mockFishers.size).toBe(1)
    expect(mockFishers.get(1)).toHaveProperty("name", "John Doe")
  })
  
  it("should not allow duplicate registration", () => {
    // First registration
    mockContract.registerFisher("John Doe", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    // Attempt duplicate registration
    const result = mockContract.registerFisher("John Doe Again", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    expect(result).toHaveProperty("error")
    expect(result.error).toBe(1)
    expect(mockFishers.size).toBe(1)
  })
  
  it("should update fisher details", () => {
    // Register first
    mockContract.registerFisher("John Doe", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    // Update details
    const result = mockContract.updateFisherDetails("John Doe Updated", "New Location", "New Vessel", 30, "LIC-54321")
    
    expect(result).toHaveProperty("value", true)
    expect(mockFishers.get(1)).toHaveProperty("name", "John Doe Updated")
    expect(mockFishers.get(1)).toHaveProperty("vessel-size", 30)
  })
  
  it("should deactivate a fisher", () => {
    // Register first
    mockContract.registerFisher("John Doe", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    // Deactivate
    const result = mockContract.deactivateFisher()
    
    expect(result).toHaveProperty("value", true)
    expect(mockFishers.get(1)).toHaveProperty("active", false)
  })
  
  it("should retrieve fisher details by ID", () => {
    // Register first
    mockContract.registerFisher("John Doe", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    const fisher = mockContract.getFisherById(1)
    
    expect(fisher).toBeDefined()
    expect(fisher).toHaveProperty("name", "John Doe")
    expect(fisher).toHaveProperty("vessel-name", "Sea Breeze")
  })
  
  it("should retrieve fisher ID by principal", () => {
    // Register first
    mockContract.registerFisher("John Doe", "Coastal Village", "Sea Breeze", 25, "LIC-12345")
    
    const fisherId = mockContract.getFisherIdByPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")
    
    expect(fisherId).toBe(1)
  })
})

