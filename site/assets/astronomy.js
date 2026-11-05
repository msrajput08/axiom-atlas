// ============================================================================
// AXIOMATLAS — CENTRALIZED ASTRONOMY & ASTROPHYSICS CONSTANTS, DATASETS &
// NUMERICAL SOLVERS (CODATA 2018 · IAU 2012/2015 · NASA · PLANCK 2018)
// ============================================================================

export const ASTRO_CONSTANTS = Object.freeze({
  // Fundamental Physical Constants (CODATA 2018 / SI Exact)
  c: 299792458,                     // Speed of light in vacuum (m/s, exact)
  G: 6.67430e-11,                   // Newtonian constant of gravitation (m³·kg⁻¹·s⁻², CODATA 2018)
  h: 6.62607015e-34,                // Planck constant (J·s, exact)
  hbar: 1.054571817e-34,            // Reduced Planck constant ħ = h / (2π) (J·s)
  k_B: 1.380649e-23,                // Boltzmann constant (J/K, exact)
  sigma_SB: 5.670374419e-8,         // Stefan–Boltzmann constant σ (W·m⁻²·K⁻⁴)
  b_wien: 2.897771955e-3,           // Wien wavelength displacement constant b (m·K)
  m_u: 1.66053906660e-27,           // Unified atomic mass unit (kg)
  m_p: 1.67262192369e-27,           // Proton mass (kg)
  R_gas: 8.314462618,               // Molar gas constant R (J·mol⁻¹·K⁻¹)

  // Astronomical Distance & Time Constants (IAU 2012 / 2015 Resolutions)
  AU: 149597870700,                 // Astronomical Unit (m, IAU 2012 Resolution B2 exact)
  ly: 9460730472580800,             // Julian light-year = c × 365.25 × 86400 (m, exact)
  pc: (149597870700 * 648000) / Math.PI, // Parsec = 648000/π AU ≈ 3.0856775814913673e16 m (IAU 2015)
  kpc: ((149597870700 * 648000) / Math.PI) * 1e3,
  Mpc: ((149597870700 * 648000) / Math.PI) * 1e6,
  Gpc: ((149597870700 * 648000) / Math.PI) * 1e9,
  julianDaySec: 86400,              // Seconds per Julian day (s)
  julianYearSec: 31557600,          // Seconds per Julian year = 365.25 × 86400 (s)
  siderealDayEarthSec: 86164.0905,  // Earth sidereal rotation period (s)

  // Solar Reference Constants (IAU 2015 Resolution B3 Nominal Values)
  GM_sun: 1.3271244e20,             // Nominal solar mass parameter GM_☉ (m³·s⁻²)
  M_sun: 1.98847e30,                // Solar mass M_☉ = GM_☉ / G (kg)
  R_sun: 6.957e8,                   // Nominal solar radius R_☉ (m, IAU 2015)
  L_sun: 3.828e26,                  // Nominal solar luminosity L_☉ (W, IAU 2015)
  T_sun: 5772,                      // Nominal solar effective temperature T_eff,☉ (K, IAU 2015)
  M_bol_sun: 4.74,                  // Absolute bolometric magnitude of the Sun (IAU 2015)
  M_V_sun: 4.83,                    // Absolute visual V-band magnitude of the Sun
  S_solar: 1361.0,                  // Nominal total solar irradiance at 1 AU (W/m², IAU 2015)

  // Earth & Jupiter Nominal Planetary Constants (IAU 2015 / NASA Planetary Fact Sheet)
  GM_earth: 3.986004e14,            // Geocentric gravitational constant (m³·s⁻²)
  M_earth: 5.97217e24,              // Earth mass M_⊕ (kg)
  R_earth: 6.3710e6,                // Earth volumetric mean radius (m)
  R_earth_eq: 6.3781e6,             // Earth nominal equatorial radius (m, IAU 2015)
  R_earth_pol: 6.3568e6,            // Earth nominal polar radius (m, IAU 2015)
  g_earth: 9.80665,                 // Standard Earth surface gravity g₀ (m/s²)
  GM_jup: 1.2668653e17,             // Jovian gravitational constant (m³·s⁻²)
  M_jup: 1.89813e27,                // Jupiter mass M_J (kg)
  R_jup: 6.9911e7,                  // Jupiter volumetric mean radius (m)
  R_jup_eq: 7.1492e7,               // Jupiter nominal equatorial radius (m, IAU 2015)
  R_jup_pol: 6.6854e7,              // Jupiter nominal polar radius (m, IAU 2015)

  // Cosmological Reference Constants (Planck 2018 & SH0ES 2022)
  H0_planck18: 67.4,                // Planck 2018 Hubble constant (km·s⁻¹·Mpc⁻¹)
  OmegaM_planck18: 0.315,           // Planck 2018 matter density parameter Ω_m,0
  OmegaL_planck18: 0.685,           // Planck 2018 dark energy density parameter Ω_Λ,0
  OmegaR_planck18: 9.24e-5,         // Radiation + relativistic neutrino density Ω_r,0
  T_CMB0: 2.72548,                  // Present-day CMB monopole temperature (K, Fixsen 2009)
  H0_shoes: 73.04                   // SH0ES Cepheid-SN Ia Hubble constant (km·s⁻¹·Mpc⁻¹, Riess et al. 2022)
});

// Centralized NASA / IAU Celestial Body Reference Dataset
export const CELESTIAL_BODIES = Object.freeze({
  earth: {
    id: 'earth', name: 'Earth',
    massKg: 5.97217e24, radiusM: 6.3710e6, eqRadiusM: 6.3781e6, polRadiusM: 6.3568e6,
    densityKgM3: 5514, surfaceGravityMS2: 9.798, escapeVelocityMS: 11186,
    smaAU: 1.00000, eccentricity: 0.01671, orbitalPeriodDays: 365.256,
    rotationHours: 23.9345, bondAlbedo: 0.306, eqTempK: 254.0, surfaceTempK: 288.0,
    scaleHeightKm: 8.5, meanMolMassG: 28.97, momentFactorC: 0.3307
  },
  moon: {
    id: 'moon', name: 'Moon (Luna)',
    massKg: 7.346e22, radiusM: 1.7374e6, eqRadiusM: 1.7381e6, polRadiusM: 1.7360e6,
    densityKgM3: 3344, surfaceGravityMS2: 1.622, escapeVelocityMS: 2380,
    smaAU: 0.0025695, eccentricity: 0.0549, orbitalPeriodDays: 27.3217,
    rotationHours: 655.72, bondAlbedo: 0.11, eqTempK: 270.4, surfaceTempK: 250.0,
    scaleHeightKm: 0, meanMolMassG: 40.0, momentFactorC: 0.3929
  },
  mercury: {
    id: 'mercury', name: 'Mercury',
    massKg: 3.3011e23, radiusM: 2.4397e6, eqRadiusM: 2.4405e6, polRadiusM: 2.4383e6,
    densityKgM3: 5427, surfaceGravityMS2: 3.70, escapeVelocityMS: 4250,
    smaAU: 0.387098, eccentricity: 0.20563, orbitalPeriodDays: 87.969,
    rotationHours: 1407.6, bondAlbedo: 0.068, eqTempK: 439.6, surfaceTempK: 440.0,
    scaleHeightKm: 0, meanMolMassG: 40.0, momentFactorC: 0.346
  },
  venus: {
    id: 'venus', name: 'Venus',
    massKg: 4.8675e24, radiusM: 6.0518e6, eqRadiusM: 6.0518e6, polRadiusM: 6.0518e6,
    densityKgM3: 5243, surfaceGravityMS2: 8.87, escapeVelocityMS: 10360,
    smaAU: 0.723332, eccentricity: 0.00677, orbitalPeriodDays: 224.701,
    rotationHours: 5832.6, bondAlbedo: 0.77, eqTempK: 226.6, surfaceTempK: 737.0,
    scaleHeightKm: 15.9, meanMolMassG: 43.45, momentFactorC: 0.337
  },
  mars: {
    id: 'mars', name: 'Mars',
    massKg: 6.4171e23, radiusM: 3.3895e6, eqRadiusM: 3.3962e6, polRadiusM: 3.3762e6,
    densityKgM3: 3934, surfaceGravityMS2: 3.71, escapeVelocityMS: 5027,
    smaAU: 1.52368, eccentricity: 0.0934, orbitalPeriodDays: 686.980,
    rotationHours: 24.6229, bondAlbedo: 0.25, eqTempK: 209.8, surfaceTempK: 210.0,
    scaleHeightKm: 11.1, meanMolMassG: 43.34, momentFactorC: 0.3644
  },
  jupiter: {
    id: 'jupiter', name: 'Jupiter',
    massKg: 1.89813e27, radiusM: 6.9911e7, eqRadiusM: 7.1492e7, polRadiusM: 6.6854e7,
    densityKgM3: 1326, surfaceGravityMS2: 24.79, escapeVelocityMS: 59500,
    smaAU: 5.2044, eccentricity: 0.0489, orbitalPeriodDays: 4332.59,
    rotationHours: 9.9250, bondAlbedo: 0.503, eqTempK: 109.9, surfaceTempK: 165.0,
    scaleHeightKm: 27.0, meanMolMassG: 2.22, momentFactorC: 0.2756
  },
  saturn: {
    id: 'saturn', name: 'Saturn',
    massKg: 5.6834e26, radiusM: 5.8232e7, eqRadiusM: 6.0268e7, polRadiusM: 5.4364e7,
    densityKgM3: 687, surfaceGravityMS2: 10.44, escapeVelocityMS: 35500,
    smaAU: 9.5826, eccentricity: 0.0565, orbitalPeriodDays: 10759.22,
    rotationHours: 10.656, bondAlbedo: 0.342, eqTempK: 81.0, surfaceTempK: 134.0,
    scaleHeightKm: 59.5, meanMolMassG: 2.07, momentFactorC: 0.220
  },
  uranus: {
    id: 'uranus', name: 'Uranus',
    massKg: 8.6810e25, radiusM: 2.5362e7, eqRadiusM: 2.5559e7, polRadiusM: 2.4973e7,
    densityKgM3: 1270, surfaceGravityMS2: 8.69, escapeVelocityMS: 21300,
    smaAU: 19.2184, eccentricity: 0.0472, orbitalPeriodDays: 30685.4,
    rotationHours: 17.24, bondAlbedo: 0.300, eqTempK: 58.1, surfaceTempK: 76.0,
    scaleHeightKm: 27.7, meanMolMassG: 2.64, momentFactorC: 0.225
  },
  neptune: {
    id: 'neptune', name: 'Neptune',
    massKg: 1.02413e26, radiusM: 2.4622e7, eqRadiusM: 2.4764e7, polRadiusM: 2.4341e7,
    densityKgM3: 1638, surfaceGravityMS2: 11.15, escapeVelocityMS: 23500,
    smaAU: 30.11, eccentricity: 0.0086, orbitalPeriodDays: 60189.0,
    rotationHours: 16.11, bondAlbedo: 0.290, eqTempK: 46.6, surfaceTempK: 72.0,
    scaleHeightKm: 19.7, meanMolMassG: 2.6, momentFactorC: 0.23
  },
  pluto: {
    id: 'pluto', name: 'Pluto (Dwarf Planet)',
    massKg: 1.303e22, radiusM: 1.1883e6, eqRadiusM: 1.1883e6, polRadiusM: 1.1883e6,
    densityKgM3: 1854, surfaceGravityMS2: 0.62, escapeVelocityMS: 1210,
    smaAU: 39.482, eccentricity: 0.2488, orbitalPeriodDays: 90560.0,
    rotationHours: 153.29, bondAlbedo: 0.52, eqTempK: 37.5, surfaceTempK: 44.0,
    scaleHeightKm: 50.0, meanMolMassG: 28.0, momentFactorC: 0.35
  },
  sun: {
    id: 'sun', name: 'Sun (Sol)',
    massKg: 1.98847e30, radiusM: 6.957e8, eqRadiusM: 6.957e8, polRadiusM: 6.957e8,
    densityKgM3: 1408, surfaceGravityMS2: 274.0, escapeVelocityMS: 617500,
    smaAU: 0, eccentricity: 0, orbitalPeriodDays: 0,
    rotationHours: 609.12, bondAlbedo: 0, eqTempK: 5772, surfaceTempK: 5772,
    scaleHeightKm: 140, meanMolMassG: 1.26, momentFactorC: 0.070
  }
});

export const COSMO_PRESETS = Object.freeze({
  planck18: { name: 'Planck 2018 (Flat ΛCDM)', H0: 67.4, OmegaM: 0.315, OmegaL: 0.685, OmegaR: 9.24e-5 },
  shoes22: { name: 'SH0ES + Pantheon+ (2022)', H0: 73.04, OmegaM: 0.334, OmegaL: 0.666, OmegaR: 9.0e-5 },
  wmap9: { name: 'WMAP 9-Year (Flat ΛCDM)', H0: 69.32, OmegaM: 0.2865, OmegaL: 0.7135, OmegaR: 8.7e-5 },
  eds: { name: 'Einstein–de Sitter (Matter Only)', H0: 67.4, OmegaM: 1.0, OmegaL: 0.0, OmegaR: 0.0 },
  open: { name: 'Open Matter Universe (Ω_m=0.3, Ω_Λ=0)', H0: 67.4, OmegaM: 0.3, OmegaL: 0.0, OmegaR: 0.0 }
});

// 8-point Gauss-Legendre abscissas and weights on [-1, 1]
const GL8_X = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
const GL8_W = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];

function integrateGL8(fn, a, b, panels = 32) {
  if (a === b) return 0;
  const h = (b - a) / panels;
  let total = 0;
  for (let i = 0; i < panels; i++) {
    const x0 = a + i * h;
    const mid = x0 + 0.5 * h, half = 0.5 * h;
    for (let j = 0; j < 8; j++) {
      const val = fn(mid + half * GL8_X[j]);
      if (Number.isFinite(val)) total += half * GL8_W[j] * val;
    }
  }
  return total;
}

// ============================================================================
// 1. NUMERICAL ΛCDM COSMOLOGY INTEGRATOR
// ============================================================================
export function computeCosmology(z, H0 = 67.4, OmegaM = 0.315, OmegaL = 0.685, OmegaR = 9.24e-5) {
  if (!Number.isFinite(z) || z < -0.999) {
    throw Error('Redshift z must be greater than −1 (z ≥ 0 for cosmological expansion).');
  }
  if (!Number.isFinite(H0) || H0 <= 0) {
    throw Error('Hubble constant H₀ must be strictly positive (km/s/Mpc).');
  }
  if (OmegaM < 0 || OmegaR < 0) {
    throw Error('Matter and radiation density parameters (Ω_m, Ω_r) must be non-negative.');
  }

  const OmegaK = 1 - OmegaM - OmegaL - OmegaR;
  const E = zp => {
    const u = 1 + zp;
    const rad = OmegaR * (u ** 4) + OmegaM * (u ** 3) + OmegaK * (u ** 2) + OmegaL;
    if (rad <= 0) throw Error(`Cosmological expansion rate E(z)² ≤ 0 at z = ${zp.toFixed(3)} (unphysical bounce/loitering parameters).`);
    return Math.sqrt(rad);
  };

  // H0 in s^-1: 1 km/s/Mpc = 1000 m/s / ASTRO_CONSTANTS.Mpc
  const H0_si = (H0 * 1000) / ASTRO_CONSTANTS.Mpc;
  const t_H_sec = 1 / H0_si;
  const t_H_Gyr = t_H_sec / (ASTRO_CONSTANTS.julianYearSec * 1e9);
  const d_H_Mpc = (ASTRO_CONSTANTS.c / 1000) / H0; // Hubble distance c / H0 in Mpc

  // Integrate dimensionless comoving distance I_DC = ∫_0^z dz' / E(z')
  // Use logarithmic coordinate u = ln(1 + z') for high accuracy across both low z and high z (up to CMB z=1100)
  const uMax = Math.log(1 + z);
  const panels = Math.max(32, Math.min(160, Math.ceil(32 * (1 + Math.abs(uMax)))));
  const I_DC = integrateGL8(u => {
    const zp = Math.exp(u) - 1;
    return Math.exp(u) / E(zp);
  }, 0, uMax, panels);

  // Dimensionless lookback time integral I_tL = ∫_0^z dz' / [(1 + z') E(z')] = ∫_0^uMax du / E(e^u - 1)
  const I_tL = integrateGL8(u => 1 / E(Math.exp(u) - 1), 0, uMax, panels);

  // Present age of the Universe t_0 = (1/H0) ∫_0^∞ dz' / [(1+z') E(z')]
  // Map u in [0, ∞) via s in (0, 1): u = s / (1 - s)
  const I_t0 = integrateGL8(s => {
    const u = s / (1 - s);
    const duds = 1 / ((1 - s) * (1 - s));
    const zp = Math.exp(u) - 1;
    if (!Number.isFinite(zp) || zp > 1e12) return 0;
    return duds / E(zp);
  }, 0, 1, 64);

  const DC_Mpc = d_H_Mpc * I_DC;
  let DM_Mpc = DC_Mpc;
  if (Math.abs(OmegaK) > 1e-7) {
    const sqrtK = Math.sqrt(Math.abs(OmegaK));
    const arg = sqrtK * I_DC;
    DM_Mpc = d_H_Mpc * (OmegaK > 0 ? Math.sinh(arg) : Math.sin(arg)) / sqrtK;
  }

  const a = 1 / (1 + z);
  const DL_Mpc = (1 + z) * DM_Mpc;
  const DA_Mpc = DM_Mpc / (1 + z);
  const lookbackGyr = t_H_Gyr * I_tL;
  const ageUniverseGyr = t_H_Gyr * I_t0;
  const ageAtRedshiftGyr = Math.max(0, ageUniverseGyr - lookbackGyr);
  const lightTravelMpc = (lookbackGyr * 1e9 * ASTRO_CONSTANTS.ly) / ASTRO_CONSTANTS.Mpc;

  // Comoving volume V_C(z) in Gpc^3 (full sky 4π/3 D_M^3 for flat space)
  const DM_Gpc = DM_Mpc / 1000;
  const comovingVolumeGpc3 = (4 * Math.PI / 3) * (DM_Gpc ** 3);

  // Hubble parameter H(z), critical density rho_c(z), deceleration parameter q(z)
  const Ez = E(z);
  const Hz = H0 * Ez;
  const Hz_si = H0_si * Ez;
  const rhoCritZ = (3 * Hz_si * Hz_si) / (8 * Math.PI * ASTRO_CONSTANTS.G);
  const u1 = 1 + z;
  const qz = (0.5 * OmegaM * (u1 ** 3) + OmegaR * (u1 ** 4) - OmegaL) / (Ez * Ez);

  // Linear Hubble-law comparison & relativistic Doppler comparison
  const vLinearKmS = (ASTRO_CONSTANTS.c / 1000) * z;
  const dLinearMpc = d_H_Mpc * z;
  const zp1Sq = (1 + z) * (1 + z);
  const betaRel = (zp1Sq - 1) / (zp1Sq + 1);
  const vRelDopplerKmS = (ASTRO_CONSTANTS.c / 1000) * betaRel;
  const distanceModulus = DL_Mpc > 0 ? 5 * Math.log10(DL_Mpc * 1e6 / 10) : 0;

  return {
    z, a, H0, OmegaM, OmegaL, OmegaR, OmegaK,
    Ez, Hz, d_H_Mpc, t_H_Gyr,
    DC_Mpc, DM_Mpc, DL_Mpc, DA_Mpc, lightTravelMpc,
    DC_Gly: (DC_Mpc * ASTRO_CONSTANTS.Mpc) / (ASTRO_CONSTANTS.ly * 1e9),
    DL_Gly: (DL_Mpc * ASTRO_CONSTANTS.Mpc) / (ASTRO_CONSTANTS.ly * 1e9),
    DA_Gly: (DA_Mpc * ASTRO_CONSTANTS.Mpc) / (ASTRO_CONSTANTS.ly * 1e9),
    lookbackGyr, ageUniverseGyr, ageAtRedshiftGyr,
    comovingVolumeGpc3, rhoCritZ, qz,
    vLinearKmS, dLinearMpc, vRelDopplerKmS, betaRel,
    distanceModulus,
    linearDeviationPct: DC_Mpc > 0 ? ((dLinearMpc - DC_Mpc) / DC_Mpc) * 100 : 0
  };
}

// ============================================================================
// 2. KEPLERIAN ELLIPTICAL ORBIT & KEPLER'S EQUATION SOLVER
// ============================================================================
export function solveKeplerOrbit(M_central, a, e, meanAnomalyDeg = 45, m_orbiting = 0) {
  if (!Number.isFinite(M_central) || M_central <= 0) throw Error('Central body mass M must be strictly positive (kg).');
  if (!Number.isFinite(a) || a <= 0) throw Error('Semi-major axis a must be strictly positive (m).');
  if (!Number.isFinite(e) || e < 0 || e >= 1) throw Error('Elliptical orbit eccentricity e must satisfy 0 ≤ e < 1.');

  const mu = ASTRO_CONSTANTS.G * (M_central + Math.max(0, m_orbiting));
  const rp = a * (1 - e);
  const ra = a * (1 + e);
  const b = a * Math.sqrt(1 - e * e);
  const p = a * (1 - e * e);
  const periodSec = 2 * Math.PI * Math.sqrt((a ** 3) / mu);
  const specificEnergy = -mu / (2 * a);
  const specificAngMom = Math.sqrt(mu * p);
  const vp = Math.sqrt((mu / a) * ((1 + e) / (1 - e)));
  const va = Math.sqrt((mu / a) * ((1 - e) / (1 + e)));

  // Solve Kepler's Equation M = E - e sin(E) via Newton-Raphson
  const M_rad = ((meanAnomalyDeg % 360) + 360) % 360 * (Math.PI / 180);
  let E_rad = e < 0.8 ? M_rad : Math.PI;
  let iterations = 0;
  for (let i = 0; i < 60; i++) {
    iterations = i + 1;
    const f = E_rad - e * Math.sin(E_rad) - M_rad;
    const fp = 1 - e * Math.cos(E_rad);
    const dE = f / fp;
    E_rad -= dE;
    if (Math.abs(dE) < 1e-13) break;
  }
  const trueAnomalyRad = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E_rad / 2),
    Math.sqrt(1 - e) * Math.cos(E_rad / 2)
  );
  const trueAnomalyDeg = ((trueAnomalyRad * 180) / Math.PI + 360) % 360;
  const rInst = a * (1 - e * Math.cos(E_rad));
  const vInst = Math.sqrt(mu * (2 / rInst - 1 / a));

  return {
    mu, a, e, b, p, rp, ra, vp, va,
    periodSec, periodDays: periodSec / 86400, periodYears: periodSec / ASTRO_CONSTANTS.julianYearSec,
    specificEnergy, specificAngMom,
    meanAnomalyDeg, eccentricAnomalyDeg: (E_rad * 180) / Math.PI, trueAnomalyDeg,
    rInst, vInst, iterations
  };
}

// ============================================================================
// 3. BLACKBODY RADIATION & PLANCK SPECTRAL SOLVER
// ============================================================================
export function computeBlackbodyRadiation(T, wavelengthNm = 500) {
  if (!Number.isFinite(T) || T <= 0) throw Error('Blackbody temperature T must be strictly positive (K).');
  if (!Number.isFinite(wavelengthNm) || wavelengthNm <= 0) throw Error('Wavelength λ must be strictly positive (nm).');

  const { h, c, k_B, sigma_SB, b_wien } = ASTRO_CONSTANTS;
  const lambdaM = wavelengthNm * 1e-9;
  const x = (h * c) / (lambdaM * k_B * T);
  const expTerm = x > 700 ? Infinity : Math.expm1(x);
  // Spectral radiance B_λ(λ, T) = (2 h c² / λ⁵) / (e^(hc/λkT) - 1) [W·sr⁻¹·m⁻³]
  const B_lambda_SI = expTerm === Infinity ? 0 : (2 * h * c * c) / (Math.pow(lambdaM, 5) * expTerm);
  const B_lambda_nm = B_lambda_SI * 1e-9; // W·sr⁻¹·m⁻²·nm⁻¹

  const nu = c / lambdaM;
  const B_nu_SI = expTerm === Infinity ? 0 : (2 * h * Math.pow(nu, 3)) / (c * c * expTerm);
  const totalExitance = sigma_SB * Math.pow(T, 4); // W/m²
  const lambdaPeakM = b_wien / T;
  const lambdaPeakNm = lambdaPeakM * 1e9;
  const nuPeakHz = (2.821439372 * k_B * T) / h;
  const photonEnergyEv = (h * c) / (lambdaM * 1.602176634e-19);

  // Rayleigh-Jeans approximation (valid for x << 1): B_RJ = 2 c k_B T / λ^4
  const B_RJ_SI = (2 * c * k_B * T) / Math.pow(lambdaM, 4);
  // Wien approximation (valid for x >> 1): B_Wien = (2 h c^2 / λ^5) e^(-x)
  const B_Wien_SI = x > 700 ? 0 : (2 * h * c * c / Math.pow(lambdaM, 5)) * Math.exp(-x);

  return {
    T, wavelengthNm, lambdaM, x,
    B_lambda_SI, B_lambda_nm, B_nu_SI,
    totalExitance, lambdaPeakNm, nuPeakHz, photonEnergyEv,
    B_RJ_SI, B_Wien_SI
  };
}

// ============================================================================
// 4. KOPPARAPU ET AL. (2013/2014) CIRCUMSTELLAR HABITABLE ZONE ESTIMATOR
// ============================================================================
export function computeHabitableZone(L_star_solar = 1.0, T_eff = 5772) {
  if (!Number.isFinite(L_star_solar) || L_star_solar <= 0) throw Error('Stellar luminosity L/L_☉ must be strictly positive.');
  if (!Number.isFinite(T_eff) || T_eff < 2000 || T_eff > 12000) throw Error('Stellar effective temperature T_eff must be between 2,000 K and 12,000 K for the Kopparapu parameterization.');

  const dT = T_eff - 5780;
  // Kopparapu et al. (2014) 1 M_earth coefficients: [S_eff0, a, b, c, d]
  const boundaries = {
    recentVenus:     [1.776, 2.136e-4, 2.533e-8, -1.332e-11, -3.097e-15],
    runawayGH:       [1.107, 1.332e-4, 1.580e-8, -8.308e-12, -1.931e-15],
    maxGH:           [0.356, 6.171e-5, 1.698e-9, -3.198e-12, -5.575e-16],
    earlyMars:       [0.320, 5.547e-5, 1.526e-9, -2.874e-12, -5.011e-16]
  };
  const evalBoundary = ([s0, a, b, c, d]) => {
    const seff = s0 + a * dT + b * (dT ** 2) + c * (dT ** 3) + d * (dT ** 4);
    const distAU = Math.sqrt(L_star_solar / seff);
    return { seff, distAU, distM: distAU * ASTRO_CONSTANTS.AU };
  };
  return {
    recentVenus: evalBoundary(boundaries.recentVenus),
    runawayGH: evalBoundary(boundaries.runawayGH),
    maxGH: evalBoundary(boundaries.maxGH),
    earlyMars: evalBoundary(boundaries.earlyMars),
    earthEquivalentAU: Math.sqrt(L_star_solar)
  };
}

// ============================================================================
// 5. ASTRONOMICAL TIME (JD, MJD, GMST, LST) & CELESTIAL COORDINATE SEPARATION
// ============================================================================
export function calendarToJulianDate(year, month, day, hour = 12, minute = 0, second = 0) {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw Error('Year, month, and day must be valid numbers.');
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw Error('Month must be in 1..12 and day in 1..31.');
  }
  let Y = Math.trunc(year);
  let M = Math.trunc(month);
  const D = day + (hour + minute / 60 + second / 3600) / 24;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
  const MJD = JD - 2400000.5;
  const T_J2000 = (JD - 2451545.0) / 36525.0;
  return { JD, MJD, T_J2000, deltaJ2000Days: JD - 2451545.0 };
}

export function julianDateToCalendar(JD) {
  if (!Number.isFinite(JD)) throw Error('Julian Date JD must be a finite number.');
  const Z = Math.floor(JD + 0.5);
  const F = (JD + 0.5) - Z;
  let A = Z;
  if (Z >= 2299161) {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const dayFloat = B - D - Math.floor(30.6001 * E) + F;
  const day = Math.floor(dayFloat);
  const fracHours = (dayFloat - day) * 24;
  const hour = Math.floor(fracHours);
  const fracMin = (fracHours - hour) * 60;
  const minute = Math.floor(fracMin);
  const second = Math.round(((fracMin - minute) * 60) * 100) / 100;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  const pad = n => String(n).padStart(2, '0');
  const isoUTC = `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${second.toFixed(1).padStart(4, '0')} UTC`;
  return { year, month, day, hour, minute, second, isoUTC, MJD: JD - 2400000.5 };
}

export function computeSiderealTime(JD, longitudeDeg = 0, raHours = 0) {
  if (!Number.isFinite(JD)) throw Error('Julian Date must be a valid number.');
  if (!Number.isFinite(longitudeDeg) || longitudeDeg < -180 || longitudeDeg > 180) {
    throw Error('Observer longitude must be between −180° (West) and +180° (East).');
  }
  const d = JD - 2451545.0;
  const T = d / 36525.0;
  // IAU 1982 / Meeus expression for GMST in degrees
  let gmstDeg = 280.46061837 + 360.98564736629 * d + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmstDeg = ((gmstDeg % 360) + 360) % 360;
  const lstDeg = ((gmstDeg + longitudeDeg) % 360 + 360) % 360;
  const gmstHours = gmstDeg / 15;
  const lstHours = lstDeg / 15;
  const lhaHours = ((lstHours - raHours) % 24 + 24) % 24;

  const formatHMS = hrs => {
    const h = Math.floor(hrs);
    const mFloat = (hrs - h) * 60;
    const m = Math.floor(mFloat);
    const s = (mFloat - m) * 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${s.toFixed(2).padStart(5, '0')}s`;
  };
  return {
    JD, longitudeDeg,
    gmstDeg, gmstHours, gmstHMS: formatHMS(gmstHours),
    lstDeg, lstHours, lstHMS: formatHMS(lstHours),
    lhaHours, lhaHMS: formatHMS(lhaHours)
  };
}

export function computeCelestialSeparation(ra1Deg, dec1Deg, ra2Deg, dec2Deg) {
  if ([ra1Deg, dec1Deg, ra2Deg, dec2Deg].some(v => !Number.isFinite(v))) {
    throw Error('Right Ascension and Declination coordinates must be finite numbers.');
  }
  if (Math.abs(dec1Deg) > 90 || Math.abs(dec2Deg) > 90) {
    throw Error('Declination δ must lie within [−90°, +90°].');
  }
  const d2r = Math.PI / 180;
  const a1 = ra1Deg * d2r, d1 = dec1Deg * d2r;
  const a2 = ra2Deg * d2r, d2 = dec2Deg * d2r;
  const da = a2 - a1;

  // Vincenty exact spherical angular distance formula (stable at all separations 0" to 180°)
  const t1 = Math.cos(d2) * Math.sin(da);
  const t2 = Math.cos(d1) * Math.sin(d2) - Math.sin(d1) * Math.cos(d2) * Math.cos(da);
  const num = Math.hypot(t1, t2);
  const den = Math.sin(d1) * Math.sin(d2) + Math.cos(d1) * Math.cos(d2) * Math.cos(da);
  const sepRad = Math.atan2(num, den);
  const sepDeg = sepRad / d2r;
  const sepArcmin = sepDeg * 60;
  const sepArcsec = sepDeg * 3600;

  // Position Angle PA (measured North through East from object 1 to object 2)
  const paRad = Math.atan2(Math.sin(da), Math.cos(d1) * Math.tan(d2) - Math.sin(d1) * Math.cos(da));
  const paDeg = ((paRad / d2r) % 360 + 360) % 360;

  return { sepRad, sepDeg, sepArcmin, sepArcsec, paDeg };
}
