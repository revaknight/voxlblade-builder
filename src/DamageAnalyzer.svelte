<script lang="ts">
  import { build, result } from './lib/store'
  import { calcWeapon, calcMonkWeapon, isMonkGuild } from './lib/engine'
  import BaseDamageCalc from './BaseDamageCalc.svelte'
  import { WEAPON_ARTS } from './data/weaponArts'

  // ── Reactive từ store ──────────────────────────────────────────────────────
  $: crit      = $result.crit
  $: boosts    = $result.boosts
  $: stats     = $result.stats
  $: perks     = $result.perks

  // ── Định nghĩa kiểu dữ liệu ─────────────────────────────────────────────────
  type HitSeq = (number | { n: number; count: number })[]

  interface WeaponChargeConfig {
    enabled: boolean
    label: string
    max: number
    formula: (base: number, charge: number) => number
  }

  interface DamageDisplayType {
    label: string
    rawVal: number
    val: number
    scalingMult: number
    color: string
  }

  interface WeaponBaseDmg {
    type: string
    m1: HitSeq | null
    m2: HitSeq | null
    m2Charge?: WeaponChargeConfig
  }

  type HitBreakdown = Array<{
    label: string
    rawVal: number
    val: number
    scalingMult: number
    color: string
  }>

  interface GunOverlay {
    type: string
    m2Only: boolean
    m2NoLock?: boolean
  }

  interface ScalingRow {
    key: string
    label?: string 
    scalingVal: number
    boostKey: string
    boostPct: number
    contribution: number
    color: string
  }

  // ── BẢNG DỮ LIỆU TĨNH KHÔNG ĐỔI (ĐƯA RA NGOÀI HOẶC KHAI BÁO CONST TĨNH) ──────
  const WEAPON_BASE_DMG: WeaponBaseDmg[] = [
    { type: 'Fists',                m1: [5.5, 5.5, {n:2.7,count:3}],   m2: [15.5] },
    { type: 'Chain Fists',          m1: [{n:3.5,count:2},{n:3.5,count:2},{n:3.5,count:2}], m2: [{n:3,count:7}] },
    { type: '1-Handed Sword',       m1: [6, 6, 6],                      m2: [9] },
    { type: '2-Handed Sword',       m1: [5.5, 5.5, 5.5],               m2: [12] },
    { type: 'Rapier',               m1: [4.5, 4.5, {n:1.5,count:4}],   m2: [7.5] },
    { type: 'Dual Swords',          m1: [{n:3,count:2},{n:3,count:2},6],m2: [8] },
    { type: 'Greatsword',           m1: [9, 4, 9],                      m2: [11] },
    { type: 'Unbalanced Sword',     m1: [7.5, 12],                      m2: [16] },
    { type: 'Dual Unbalanced Swords',m1: [12, 12],                     m2: [{n:8,count:2},12] },
    { type: 'Dagger',               m1: [4.5, 4.5, 4.5],               m2: [5.5] },
    { type: 'Dual Wielding Daggers',m1: [4, {n:1.4,count:5},{n:1.4,count:5}], m2: [11] },
    { type: 'Spear',                m1: [6, 6, 6],                      m2: [10] },
    { type: 'Great Spear',          m1: [9, 14],                        m2: [{n:5,count:3}] },
    { type: 'Mallet',               m1: [6, 6, 6],                      m2: [18] },
    { type: 'Dual Mallets',         m1: [5, {n:1,count:5}, 5.5],        m2: [18.5] },
    { type: 'War Hammer',           m1: [6, 6, 14],                     m2: [{n:8,count:2}] },
    { type: 'Dual Kamas',           m1: [4, 4, {n:3,count:3}],          m2: [5.5] },
    { type: 'Scythe',               m1: [7.5, 7.5, 7.5],               m2: [{n:5,count:3}] },
    { type: 'Lance',                m1: [6, 6, 6],                      m2: [6.8, 14] },
    { type: 'Chainsaw',             m1: [{n:4,count:2},{n:4,count:2},{n:4,count:2}], m2: [{n:1.7,count:10}] },
    { type: 'Shield',               m1: [5, 5, 10],                     m2: [5] },
    { type: 'Artillery Mage',       m1: [5.5, 5.5],                     m2: [8.5] },
    { type: 'Stratos Winds',        m1: [5, 5],                         m2: [8] },
    { type: 'Storm Caster',         m1: [5, 5],                         m2: [{n:2.75,count:5}] },
    { type: 'Virulent Core',        m1: [4.5, 4.5],                     m2: [13.9] },
    { type: 'Cosmic Ray',           m1: null,                           m2: [18.5] },
    { type: 'Mine',                 m1: null,                           m2: [5, 10, 15] },
    { type: 'Side Gun',             m1: null,                           m2: [7] },
    { type: 'Shotgun',              m1: null,                           m2: [{n:4.5,count:3}] },
    { type: 'Dual Guns',            m1: [4, 4],                         m2: [{n:1.6,count:8}] },
    { type: 'Rifle',                m1: [5, 5, 18],                     m2: [17],
      m2Charge: {
        enabled: true,
        label: 'Rifle Charge',
        max: 100,
        formula: (base: number, charge: number) => base * (1 + (5 / 3) * (charge / 100))
      }
    }
  ]

  const DMG_TYPE_COLORS: Record<string, string> = {
    physical: '#fb923c', magic: '#818cf8', fire: '#f97316',
    water: '#38bdf8', earth: '#a3e635', air: '#AAFFDB',
    hex: '#e879f9', holy: '#facc15', true: '#ffffff', summon: '#c084fc'
  }

  const SCALING_TO_BOOST: Record<string, string> = {
    physical: 'physicalBoost', magic: 'magicBoost', fire: 'fireBoost',
    water: 'waterBoost', earth: 'earthBoost', air: 'airBoost',
    hex: 'hexBoost', holy: 'holyBoost', dexterity: 'dexterityBoost', summon: 'summonBoost'
  }

  const SCALING_COLORS: Record<string, string> = {
    physical: '#fb923c', magic: '#818cf8', fire: '#f97316', water: '#38bdf8',
    earth: '#a3e635', air: '#AAFFDB', hex: '#e879f9', holy: '#facc15',
    dexterity: '#34d399', summon: '#c084fc'
  }

  const PRIORITY_GUN_TYPES = ['hex', 'water', 'air', 'true', 'earth', 'magic', 'fire', 'physical', 'holy']

  // ── PURE HELPER FUNCTIONS (ĐƯA RA NGOÀI ĐỂ KHÔNG KHỞI TẠO LẠI) ───────────────
  function fmtSeq(seq: HitSeq): string {
    return seq.map(h => typeof h === 'number' ? String(h) : `${h.n}×${h.count}`).join(', ')
  }

  function fmtNum(n: number): string {
    const r = Math.round(n * 100) / 100
    return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/\.?0+$/, '')
  }

  function seqWithTypes(seq: HitSeq, dmgTypes: Record<string, number>, scalingMult: number = 1): Array<{ base: number; count: number; types: HitBreakdown }> {
    const typeEntries = Object.entries(dmgTypes)
    return seq.map(h => {
      const base = typeof h === 'number' ? h : h.n
      const count = typeof h === 'number' ? 1 : h.count
      const types: HitBreakdown = typeEntries.map(([k, mult]) => ({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        rawVal: Math.round(base * 100) / 100,
        val: Math.round(base * mult * scalingMult * 100) / 100,
        scalingMult,
        color: DMG_TYPE_COLORS[k] ?? '#e8e4da'
      }))
      return { base, count, types }
    })
  }

  function parseWAHitsAll(baseDamage: string | undefined): { dmg: Array<{ n: number; count: number }>; heal: Array<{ n: number; count: number }> } {
    const empty = { dmg: [], heal: [] }
    if (!baseDamage || /\d+[^+]*[–—]\s*\d+/.test(baseDamage)) return empty
    const dmg: Array<{ n: number; count: number }> = []
    const heal: Array<{ n: number; count: number }> = []
    for (const part of baseDamage.split(/\s*\+\s*/)) {
      const isHeal = /healing/i.test(part)
      const mx = part.match(/([\d.]+)\s*[×x]\s*(\d+)/i)
      if (mx) {
        (isHeal ? heal : dmg).push({ n: parseFloat(mx[1]), count: parseInt(mx[2]) })
        continue
      }
      const nx = part.match(/^([\d.]+)/)
      if (nx) (isHeal ? heal : dmg).push({ n: parseFloat(nx[1]), count: 1 })
    }
    return { dmg, heal }
  }

  // ── LOGIC REACTIVE (GOM CỤM & TỐI ƯU HÓA PHỤ THUỘC TỪ STORE) ────────────────
  $: _isMonk = isMonkGuild($build.guild)

  $: _blasterCount = [$build.ring, $build.infusionRing, $build.infusionHelmet, $build.infusionChestplate, $build.infusionLeggings]
    .filter(s => s === 'Blaster Ring').length

  $: _hasLockedAndLoaded = ($result.perks['Locked And Loaded'] ?? 0) > 0

  $: _weaponResult = _isMonk
    ? (($build.monkGlove || $build.monkEssence) ? calcMonkWeapon($build.monkGlove, $build.monkEssence, $build.shrineActive, $build.guildRank) : null)
    : (($build.weaponBlade || $build.weaponHandle) ? calcWeapon($build.weaponBlade, $build.weaponHandle, $build.shrineActive) : null)

  $: _baseWeaponType = _weaponResult?.finalWeaponType ?? ''
  $: _weaponPerks = _weaponResult?.perks ?? {}

  $: _gunOverlay = ((): GunOverlay | null => {
    const wt = _baseWeaponType
    const isFists = wt === 'Fists' || wt === 'Chain Fists'
    if (_blasterCount >= 2) {
      if (isFists) return { type: 'Rifle', m2Only: false, m2NoLock: true }
      if (wt) return { type: 'Shotgun', m2Only: true }
    }
    if (_hasLockedAndLoaded) {
      if (isFists) return { type: 'Dual Guns', m2Only: false }
      if (wt) return { type: 'Side Gun', m2Only: true }
    }
    if ((_weaponPerks['Cosmic Ray'] ?? 0) > 0) return { type: 'Cosmic Ray', m2Only: true }
    if ((_weaponPerks['Mine'] ?? 0) > 0) return { type: 'Mine', m2Only: true }
    return null
  })()

  $: _displayRows = (() => {
    type MergedRow = WeaponBaseDmg & { gunLabel?: string; m2Only?: boolean; m2NoLock?: boolean }
    const rows: MergedRow[] = []
    if (_baseWeaponType) {
      const base = WEAPON_BASE_DMG.find(w => w.type === _baseWeaponType)
      if (base) {
        if (_gunOverlay) {
          const gun = WEAPON_BASE_DMG.find(w => w.type === _gunOverlay.type)
          if (_gunOverlay.m2Only) {
            rows.push({ type: _baseWeaponType, m1: base.m1, m2: gun?.m2 ?? null, gunLabel: _gunOverlay.type, m2Only: true, m2NoLock: _gunOverlay.m2NoLock })
          } else {
            rows.push({ type: _baseWeaponType, m1: gun?.m1 ?? null, m2: gun?.m2 ?? null, gunLabel: _gunOverlay.type, m2Only: false, m2NoLock: _gunOverlay.m2NoLock })
          }
        } else {
          rows.push({ ...base })
        }
      }
    } else if (_gunOverlay) {
      const gun = WEAPON_BASE_DMG.find(w => w.type === _gunOverlay.type)
      if (gun) rows.push({ ...gun, gunLabel: _gunOverlay.type, m2NoLock: _gunOverlay.m2NoLock })
    }
    return rows
  })()

  $: _currentLabel = _gunOverlay && _baseWeaponType ? `${_baseWeaponType} + ${_gunOverlay.type}` : (_gunOverlay?.type ?? _baseWeaponType)

  $: _weaponDmgTypes = (() => {
    const base: Record<string, number> = { ...(_weaponResult?.damageTypes ?? {}) }
    const stoneWeapon = ($result.perks['Stone Weapon'] ?? 0)
    if (stoneWeapon > 0) {
      base['earth'] = Math.round(((base['earth'] ?? 0) + stoneWeapon * 0.3) * 100) / 100
    }
    return base
  })()

  $: _gunDmgTypes = (() => {
    if (!_gunOverlay) return _weaponDmgTypes
    const entries = Object.entries(_weaponDmgTypes)
    if (entries.length === 0) return _weaponDmgTypes
    
    const [highestKey] = entries.reduce((a, b) => {
      if (b[1] > a[1]) return b
      if (b[1] === a[1]) {
        const pa = PRIORITY_GUN_TYPES.indexOf(a[0])
        const pb = PRIORITY_GUN_TYPES.indexOf(b[0])
        return (pb === -1 ? 999 : pb) < (pa === -1 ? 999 : pa) ? b : a
      }
      return a
    })
    const total = Math.round(entries.reduce((s, [, v]) => s + v, 0) * 100) / 100
    return { [highestKey]: total }
  })()

  // ── Chỉ số Boosts & Final Multipliers ──────────────────────────────────────
  let disabledBoosts = new Set<string>(['Thief Training (would-crit bonus)'])

  function toggleBoost(name: string) {
    if (disabledBoosts.has(name)) disabledBoosts.delete(name)
    else disabledBoosts.add(name)
    disabledBoosts = new Set(disabledBoosts)
  }

  $: activeEntries = boosts.dmgEntries.filter(e => !disabledBoosts.has(e.sourceName))
  $: hasDisabledVisible = boosts.dmgEntries.some(e => disabledBoosts.has(e.sourceName))
  $: activeFinalMult = activeEntries.reduce((acc, e) => acc * e.rawMultiplier, 1.0)
  $: activeFinalMultRounded = Math.round(activeFinalMult * 10000) / 10000

  // ── Tính toán Scaling và Multiplier của vũ khí hiện tại ────────────────────
  $: scalingBreakdown = (() => {
    if (!_weaponResult) return { rows: [] as ScalingRow[], totalEffectivePct: 0, multiplier: 1 }
    const scalings = _weaponResult.scalings
    const rows: ScalingRow[] = []
    for (const [key, scalingVal] of Object.entries(scalings)) {
      if (!scalingVal) continue
      const boostKey = SCALING_TO_BOOST[key]
      if (!boostKey) continue
      const boostPct = (stats as Record<string, number>)[boostKey] ?? 0
      const contribution = Math.round(scalingVal * boostPct * 100) / 100
      rows.push({ key, scalingVal, boostKey, boostPct, contribution, color: SCALING_COLORS[key] ?? '#e8e4da' })
    }
    const totalEffectivePct = Math.round(rows.reduce((a, r) => a + r.contribution, 0) * 100) / 100
    const multiplier = Math.round((1 + totalEffectivePct / 100) * 10000) / 10000
    return { rows, totalEffectivePct, multiplier }
  })()

  $: _scalingMult = (() => {
    if (!_weaponResult) return 1
    let totalEffectivePct = 0
    for (const [key, scalingVal] of Object.entries(_weaponResult.scalings)) {
      const boostKey = SCALING_TO_BOOST[key]
      if (!boostKey) continue
      totalEffectivePct += scalingVal * ((stats as Record<string, number>)[boostKey] ?? 0)
    }
    return Math.round((1 + totalEffectivePct / 100) * 10000) / 10000
  })()

  // ── XỬ LÝ WEAPON ART (CRITICAL FIX REGEX CACHE VÀ TỐI ƯU HÓA) ────────────────
  $: selectedWA = WEAPON_ARTS.find(wa => wa.name === $build.selectedWeaponArt) ?? WEAPON_ARTS[0]

  $: _waAllHits = parseWAHitsAll(selectedWA.baseDamage)
  $: _waHitsSeq = _waAllHits.dmg.length > 0 ? _waAllHits.dmg : null
  $: _waHealSeq = _waAllHits.heal.length > 0 ? _waAllHits.heal : null

  $: _waDmgTypes = (() => {
    const dt = selectedWA.damageType
    if (!dt || dt === 'Same as weapon') return _weaponDmgTypes
    if (dt.includes('Highest damage type')) {
      const entries = Object.entries(_weaponDmgTypes)
      if (entries.length === 0) return _weaponDmgTypes
      const [highestKey] = entries.reduce((a, b) => {
        if (b[1] > a[1]) return b
        if (b[1] === a[1]) {
          const ia = PRIORITY_GUN_TYPES.indexOf(a[0])
          const ib = PRIORITY_GUN_TYPES.indexOf(b[0])
          return (ib === -1 ? 999 : ib) < (ia === -1 ? 999 : ia) ? b : a
        }
        return a
      })
      return { [highestKey]: Math.round(entries.reduce((s, [, v]) => s + v, 0) * 100) / 100 }
    }
    const types: Record<string, number> = {}
    const re = /([\d.]+)\s*(Physical|Magic|Fire|Water|Earth|Air|Hex|Holy|True|Summon)/gi
    let m
    while ((m = re.exec(dt)) !== null) types[m[2].toLowerCase()] = parseFloat(m[1])
    return Object.keys(types).length > 0 ? types : _weaponDmgTypes
  })()

  $: _waScalingMult = (() => {
    const sc = selectedWA.scaling
    if (!sc || sc === 'Same as weapon') return _scalingMult
    if (sc === 'None') return 1
    const re = /([\d.]+)\s*(Physical|Magic|Fire|Water|Earth|Air|Hex|Holy|Dex(?:terity)?|Summon)/gi
    let totalPct = 0
    let m
    while ((m = re.exec(sc)) !== null) {
      const typeName = /dex/i.test(m[2]) ? 'dexterity' : m[2].toLowerCase()
      totalPct += parseFloat(m[1]) * ((stats as Record<string, number>)[typeName + 'Boost'] ?? 0)
    }
    return Math.round((1 + totalPct / 100) * 10000) / 10000
  })()

  $: waScalingBreakdown = (() => {
    if (selectedWA.hitScalings?.length) {
      const rows: ScalingRow[] = []
      for (let i = 0; i < selectedWA.hitScalings.length; i++) {
        const scaling = selectedWA.hitScalings[i]
        if (!scaling || scaling === 'Same as weapon') continue
        const dmgLabel = selectedWA.hitDamageTypes?.[i]?.match(/[A-Za-z]+/)?.[0] ?? `Hit ${i + 1}`
        const re = /([\d.]+)\s*(Physical|Magic|Fire|Water|Earth|Air|Hex|Holy|True|Dex(?:terity)?|Summon)/gi
        let m
        while ((m = re.exec(scaling)) !== null) {
          const key = /dex/i.test(m[2]) ? 'dexterity' : m[2].toLowerCase()
          const boostKey = SCALING_TO_BOOST[key]
          if (!boostKey) continue
          const scalingVal = parseFloat(m[1])
          rows.push({
            key,
            label: `${dmgLabel} · ${key} ×${scalingVal}`,
            scalingVal,
            boostKey,
            boostPct: (stats as Record<string, number>)[boostKey] ?? 0,
            contribution: Math.round(scalingVal * ((stats as Record<string, number>)[boostKey] ?? 0) * 100) / 100,
            color: SCALING_COLORS[key] ?? '#e8e4da'
          })
        }
      }
      if (!rows.length) return null
      const totalPct = rows.reduce((sum, row) => sum + row.contribution, 0)
      const avgEffectivePct = Math.round((totalPct / rows.length) * 100) / 100
      return { rows, totalEffectivePct: avgEffectivePct, multiplier: Math.round((1 + avgEffectivePct / 100) * 10000) / 10000, isPerHit: true }
    }

    const sc = selectedWA.scaling
    if (!sc || sc === 'Same as weapon' || sc === 'None') return null
    const re = /([\d.]+)\s*(Physical|Magic|Fire|Water|Earth|Air|Hex|Holy|True|Dex(?:terity)?|Summon)/gi
    const parsed: Record<string, number> = {}
    let m
    while ((m = re.exec(sc)) !== null) {
      parsed[/dex/i.test(m[2]) ? 'dexterity' : m[2].toLowerCase()] = parseFloat(m[1])
    }
    const rows: ScalingRow[] = []
    for (const [key, scalingVal] of Object.entries(parsed)) {
      const boostKey = SCALING_TO_BOOST[key]
      if (!boostKey) continue
      rows.push({
        key, scalingVal, boostKey,
        boostPct: (stats as Record<string, number>)[boostKey] ?? 0,
        contribution: Math.round(scalingVal * ((stats as Record<string, number>)[boostKey] ?? 0) * 100) / 100,
        color: SCALING_COLORS[key] ?? '#e8e4da'
      })
    }
    if (!rows.length) return null
    const totalEffectivePct = Math.round(rows.reduce((a, r) => a + r.contribution, 0) * 100) / 100
    return { rows, totalEffectivePct, multiplier: Math.round((1 + totalEffectivePct / 100) * 10000) / 10000, isPerHit: false }
  })()

  $: waScalingSameAsWeapon = selectedWA.scaling === 'Same as weapon'
  $: waScalingIsHealOnly = !_waHitsSeq && !!_waHealSeq

  $: _waTyped = (() => {
    if (!_waHitsSeq || Object.keys(_waDmgTypes).length === 0) return null
    const seq: HitSeq = _waHitsSeq.map(h => h.count === 1 ? h.n : h)
    if (selectedWA.hitDamageTypes && selectedWA.hitDamageTypes.length > 0) {
      return seq.map((h, i) => {
        const base = typeof h === 'number' ? h : h.n
        const count = typeof h === 'number' ? 1 : h.count
        const dtStr = selectedWA.hitDamageTypes![Math.min(i, selectedWA.hitDamageTypes!.length - 1)]
        const hitScalingStr = selectedWA.hitScalings?.[Math.min(i, (selectedWA.hitScalings?.length ?? 1) - 1)]
        
        let hitScalingMult = _waScalingMult
        if (hitScalingStr && hitScalingStr !== 'Same as weapon') {
          const scRe = /([\d.]+)\s*(Physical|Magic|Fire|Water|Earth|Air|Hex|Holy|Dex(?:terity)?|Summon)/gi
          let totalPct = 0
          let scM
          while ((scM = scRe.exec(hitScalingStr)) !== null) {
            const typeName = /dex/i.test(scM[2]) ? 'dexterity' : scM[2].toLowerCase()
            totalPct += parseFloat(scM[1]) * ((stats as Record<string, number>)[typeName + 'Boost'] ?? 0)
          }
          hitScalingMult = Math.round((1 + totalPct / 100) * 10000) / 10000
        } else if (hitScalingStr === 'Same as weapon') {
          hitScalingMult = _scalingMult
        }

        if (dtStr === 'Same as weapon') {
          const types: DamageDisplayType[] = Object.entries(_weaponDmgTypes).map(([k, mult]) => ({
            label: k.charAt(0).toUpperCase() + k.slice(1),
            rawVal: Math.round(base * 100) / 100,
            val: Math.round(base * mult * hitScalingMult * 100) / 100,
            scalingMult: hitScalingMult,
            color: DMG_TYPE_COLORS[k] ?? '#e8e4da'
          }))
          return { base, count, types }
        }
        
        const dtParsed: Record<string, number> = {}
        const re = /([\d.]+)\s*(Physical|Magic|Fire|Water|Earth|Air|Hex|Holy|True|Summon)/gi
        let m
        while ((m = re.exec(dtStr)) !== null) dtParsed[m[2].toLowerCase()] = parseFloat(m[1])
        const types: DamageDisplayType[] = Object.entries(dtParsed).map(([k, mult]) => ({
          label: k.charAt(0).toUpperCase() + k.slice(1),
          rawVal: Math.round(base * 100) / 100,
          val: Math.round(base * mult * hitScalingMult * 100) / 100,
          scalingMult: hitScalingMult,
          color: DMG_TYPE_COLORS[k] ?? '#e8e4da'
        }))
        return { base, count, types }
      })
    }
    return seqWithTypes(seq, _waDmgTypes, _waScalingMult)
  })()

  // Toggle danh sách hiển thị tất cả vũ khí
  let showAllWeapons = false
  let showCritBreakdown = false
</script>

<div class="da-container">
  <div class="da-section">
    <div class="da-header-row">
      <h3 class="da-title">DAMAGE ANALYZER</h3>
      <span class="da-subtitle">{_currentLabel || 'No Weapon Equipped'}</span>
    </div>

    {#if _weaponResult}
      <div class="da-meta-grid">
        <div class="da-meta-card">
          <span class="da-meta-label">Weapon Damage</span>
          <span class="da-meta-val font-mono">{fmtNum(_weaponResult.weaponDamage)}</span>
        </div>
        <div class="da-meta-card">
          <span class="da-meta-label">Scaling Mult</span>
          <span class="da-meta-val font-mono text-accent">{fmtMult(scalingBreakdown.multiplier)}</span>
        </div>
        <div class="da-meta-card">
          <span class="da-meta-label">Final Global Mult</span>
          <span class="da-meta-val font-mono text-orange">{fmtMult(activeFinalMult)}</span>
        </div>
      </div>

      <div class="da-scaling-box">
        <div class="da-small-title">Weapon Scaling Breakdown (+{scalingBreakdown.totalEffectivePct}%)</div>
        <div class="da-chips-wrap">
          {#each scalingBreakdown.rows as r}
            <span class="da-chip" style="--c: {r.color}; background: color-mix(in srgb, var(--c) 8%, transparent); border-color: color-mix(in srgb, var(--c) 25%, transparent)">
              {r.key.toUpperCase()}: {r.scalingVal} × {r.boostPct}% = <strong style="color: var(--c)">+{r.contribution}%</strong>
            </span>
          {/each}
        </div>
      </div>
    {:else}
      <p class="da-empty-text">Hãy chọn một vũ khí/găng tay để xem phân tích chi tiết.</p>
    {/if}
  </div>

  {#if _displayRows.length > 0}
    <div class="da-section">
      <div class="da-tabs-header">
        <span class="da-small-title">SÁT THƯƠNG ĐÒN ĐÁNH CƠ BẢN (CHƯA TÍNH DEFENSE VÀ CRIT)</span>
        <button class="da-toggle-all-btn" on:click={() => showAllWeapons = !showAllWeapons}>
          {showAllWeapons ? 'Collapse All' : 'Show Database M1/M2'}
        </button>
      </div>

      <div class="da-combo-list">
        {#each WEAPON_BASE_DMG as row}
          {#if showAllWeapons || row.type === _baseWeaponType || (_gunOverlay && row.type === _gunOverlay.type)}
            {@const isCurrent = row.type === _baseWeaponType}
            {@const isOverlay = _gunOverlay && row.type === _gunOverlay.type}
            
            <div class="da-weapon-row" class:da-weapon-row--active={isCurrent || isOverlay}>
              <div class="da-wp-name-row">
                <span class="da-wp-type">{row.type}</span>
                {#if isCurrent}<span class="da-badge da-badge--active">Equipped</span>{/if}
                {#if isOverlay}<span class="da-badge da-badge--gun">Overlay: {_gunOverlay.type}</span>{/if}
              </div>

              <div class="da-moves-grid">
                <div class="da-move-col">
                  <span class="da-move-lbl">M1 Sequence:</span>
                  {#if row.m1}
                    <div class="da-seq-items">
                      {#each seqWithTypes(row.m1, isOverlay && !_gunOverlay.m2NoLock ? _gunDmgTypes : _weaponDmgTypes, _scalingMult) as hit}
                        <div class="da-hit-token">
                          <span class="da-hit-base">{hit.base}{#if hit.count > 1}×{hit.count}{/if}</span>
                          <div class="da-hit-popover">
                            {#each hit.types as t}
                              <div style="color: {t.color}">{t.label}: {fmtNum(t.val)} ({t.rawVal} × {fmtNum(_weaponResult?.weaponDamage ?? 0)})</div>
                            {/each}
                          </div>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <span class="da-disabled-lbl">N/A</span>
                  {/if}
                </div>

                <div class="da-move-col">
                  <span class="da-move-lbl">M2 Attack:</span>
                  {#if row.m2}
                    <div class="da-seq-items">
                      {#each seqWithTypes(row.m2, isOverlay && !_gunOverlay.m2NoLock ? _gunDmgTypes : _weaponDmgTypes, _scalingMult) as hit}
                        <div class="da-hit-token">
                          <span class="da-hit-base">{hit.base}{#if hit.count > 1}×{hit.count}{/if}</span>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <span class="da-disabled-lbl">N/A</span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  <div class="da-section">
    <div class="da-header-row">
      <h4 class="da-small-title">WEAPON ART ANALYZER: <span class="text-accent">{selectedWA.name}</span></h4>
    </div>

    <div class="da-wa-layout">
      <p class="da-wa-desc">"{selectedWA.description || 'Không có mô tả.'}"</p>
      
      <div class="da-meta-grid">
        <div class="da-meta-card">
          <span class="da-meta-label">WA Base Damage Configuration</span>
          <span class="da-meta-val font-mono text-purple">{selectedWA.baseDamage || 'None'}</span>
        </div>
        <div class="da-meta-card">
          <span class="da-meta-label">WA Scaling Mult</span>
          <span class="da-meta-val font-mono text-accent">{fmtMult(_waScalingMult)}</span>
        </div>
      </div>

      {#if waScalingBreakdown}
        <div class="da-scaling-box" style="margin-top: 6px;">
          <div class="da-small-title">Weapon Art Custom Scaling Breakdown</div>
          <div class="da-chips-wrap">
            {#each waScalingBreakdown.rows as r}
              <span class="da-chip" style="--c: {r.color}; background: color-mix(in srgb, var(--c) 8%, transparent); border-color: color-mix(in srgb, var(--c) 25%, transparent)">
                {r.label || r.key.toUpperCase()}: {r.scalingVal} × {r.boostPct}% = <strong>+{r.contribution}%</strong>
              </span>
            {/each}
          </div>
        </div>
      {/if}

      {#if _waTyped}
        <div class="da-wa-hits-box">
          <span class="da-move-lbl">Bóc tách chuỗi liên hoàn Weapon Art:</span>
          <div class="da-seq-items font-mono" style="margin-top: 4px;">
            {#each _waTyped as hit, idx}
              <div class="da-wa-hit-card">
                <div class="da-wa-hit-idx">Đòn #{idx + 1} ({hit.count} hit)</div>
                <div class="da-wa-hit-types">
                  {#each hit.types as t}
                    <span style="color: {t.color}">{t.label}: <strong>{fmtNum(t.val)}</strong></span>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="da-section">
    <div class="da-small-title" style="margin-bottom: 6px;">CẤU HÌNH BỘ NHÂN SÁT THƯƠNG GLOBAL (MULTIPLIERS)</div>
    <div class="da-boosts-grid">
      {#each boosts.dmgEntries as entry}
        {@const isDisabled = disabledBoosts.has(entry.sourceName)}
        <button type="button" class="da-boost-card" class:da-boost-card--disabled={isDisabled} on:click={() => toggleBoost(entry.sourceName)}>
          <div class="da-boost-info">
            <span class="da-boost-name">{entry.sourceName}</span>
            <span class="da-boost-cond">{entry.condition || 'Always Active'}</span>
          </div>
          <span class="da-boost-val font-mono" class:text-orange={!isDisabled}>×{entry.rawMultiplier.toFixed(3)}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .da-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: var(--font-body, 'Inter', system-ui, sans-serif);
  }
  .da-section {
    background: rgba(20, 23, 21, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 12px;
  }
  .da-header-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  .da-title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--ink-muted, #8a8d85);
  }
  .da-subtitle {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--ink, #e8e4da);
  }
  .da-small-title {
    font-size: 0.58rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-muted, #8a8d85);
  }
  .da-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 6px;
    margin-bottom: 8px;
  }
  .da-meta-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.02);
    border-radius: 6px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
  }
  .da-meta-label {
    font-size: 0.52rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
  }
  .da-meta-val {
    font-size: 0.9rem;
    font-weight: 800;
  }
  .da-scaling-box {
    background: rgba(0, 0, 0, 0.15);
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.02);
  }
  .da-chips-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }
  .da-chip {
    font-size: 0.58rem;
    font-weight: 600;
    padding: 2px 6px;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--ink, #e8e4da);
  }
  .da-tabs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .da-toggle-all-btn {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--ink-muted, #8a8d85);
    font-size: 0.58rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  .da-toggle-all-btn:hover {
    color: var(--ink, #e8e4da);
    border-color: rgba(255, 255, 255, 0.15);
  }
  .da-combo-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .da-weapon-row {
    background: rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.02);
    border-radius: 6px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .da-weapon-row--active {
    background: rgba(251, 146, 60, 0.02);
    border-color: rgba(251, 146, 60, 0.15);
  }
  .da-wp-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .da-wp-type {
    font-size: 0.68rem;
    font-weight: 800;
    color: var(--ink, #e8e4da);
  }
  .da-badge {
    font-size: 0.5rem;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    text-transform: uppercase;
  }
  .da-badge--active { background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.25); color: #4ade80; }
  .da-badge--gun { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); color: #38bdf8; }
  
  .da-moves-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .da-move-col {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .da-move-lbl {
    font-size: 0.58rem;
    font-weight: 700;
    color: #6b7280;
    flex-shrink: 0;
  }
  .da-disabled-lbl {
    font-size: 0.58rem;
    color: #4b5563;
    font-style: italic;
  }
  .da-seq-items {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .da-hit-token {
    position: relative;
    background: #0e110f;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 1px 5px;
    border-radius: 4px;
    cursor: help;
  }
  .da-hit-base {
    font-size: 0.62rem;
    font-weight: 700;
    font-family: monospace;
    color: #e8e4da;
  }
  .da-hit-popover {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 4px;
    background: #141715;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 6px;
    border-radius: 4px;
    z-index: 50;
    font-size: 0.55rem;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }
  .da-hit-token:hover .da-hit-popover {
    display: block;
  }
  .da-wa-layout {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .da-wa-desc {
    margin: 0;
    font-size: 0.65rem;
    color: var(--ink-muted, #8a8d85);
    font-style: italic;
  }
  .da-wa-hits-box {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.02);
  }
  .da-wa-hit-card {
    background: #0e110f;
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .da-wa-hit-idx {
    font-size: 0.55rem;
    font-weight: 700;
    color: #4b5563;
  }
  .da-wa-hit-types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 0.62rem;
  }
  .da-boosts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 4px;
  }
  .da-boost-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    text-align: left;
    width: 100%;
    font-family: inherit;
  }
  .da-boost-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.01);
  }
  .da-boost-card--disabled {
    opacity: 0.35;
    background: transparent;
  }
  .da-boost-info {
    display: flex;
    flex-direction: column;
  }
  .da-boost-name {
    font-size: 0.62rem;
    font-weight: 700;
    color: var(--ink, #e8e4da);
  }
  .da-boost-cond {
    font-size: 0.48rem;
    color: #6b7280;
  }
  .da-boost-val {
    font-size: 0.68rem;
    font-weight: 700;
    color: #4b5563;
  }
  .da-empty-text {
    font-size: 0.65rem;
    color: #4b5563;
    font-style: italic;
    margin: 4px 0;
  }
  .font-mono { font-family: 'Courier New', monospace; }
  .text-accent { color: #34d399; }
  .text-orange { color: #fb923c; }
  .text-purple { color: #c084fc; }
</style>