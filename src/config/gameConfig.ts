export const gameConfig = {
  arena: {
    width: 2600,
    height: 1800,
    cameraLerp: 0.12,
    initialSafeRadius: 900,
    minimumSafeRadiusFactor: 0.35,
    shrinkIntervalMs: 10_000,
    shrinkFactor: 0.92,
  },
  actors: {
    playerSpeed: 260,
    npcSpeed: 210,
    playerRadius: 26,
    npcRadius: 24,
    combatRadius: 58,
    pickupRadius: 42,
    startingInventory: { red: 1, yellow: 2, blue: 3 },
    npcCount: 18,
  },
  pickups: {
    initialCount: 140,
    respawnTarget: 140,
    pickupAmountRange: [1, 4] as const,
    bundleMaxSize: 12,
    maxBundlesPerDefeat: 9,
  },
  blades: {
    weights: {
      red: 3,
      yellow: 2,
      blue: 1,
    },
    orbitRadiusBase: 44,
    orbitRadiusStep: 1.8,
    maxRenderedOrbitBlades: 48,
  },
  ai: {
    senseRange: 260,
    fleeRange: 180,
    fleeCloseRange: 110,
    fleeRatio: 0.82,
    fleeCloseRatio: 0.92,
    chaseRange: 220,
    chaseRatio: 1.18,
    lootPreferenceRatio: 1.3,
    recoverDurationMs: 1200,
    crowdRange: 160,
    aggressionEndgameRatio: 1.08,
    endgameFleeRatio: 0.88,
  },
  match: {
    endgameSurvivorThreshold: 4,
    endgameTimeMs: 150_000,
    restartDelayMs: 0,
  },
  combat: {
    winnerLossFactor: 0.35,
    minWinnerLossPower: 1,
    lossRemovalOrder: ['blue', 'yellow', 'red'] as const,
  },
  hud: {
    panelWidth: 240,
    panelHeight: 132,
  },
} as const;

export type BladeColor = keyof typeof gameConfig.blades.weights;
