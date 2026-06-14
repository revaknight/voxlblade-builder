export interface StatDef {
  key: string
  label: string
}

export const ELEMENTAL_BOOST_STATS: StatDef[] = [
  { key: 'dexterityBoost', label: 'Dexterity' },
  { key: 'physicalBoost',  label: 'Physical'  },
  { key: 'magicBoost',     label: 'Magic'     },
  { key: 'fireBoost',      label: 'Fire'      },
  { key: 'waterBoost',     label: 'Water'     },
  { key: 'earthBoost',     label: 'Earth'     },
  { key: 'airBoost',       label: 'Air'       },
  { key: 'hexBoost',       label: 'Hex'       },
  { key: 'holyBoost',      label: 'Holy'      },
  { key: 'summonBoost',    label: 'Summon'    },
]

export const NEGATIVE_ELEMENTAL_BOOST_STATS: StatDef[] = ELEMENTAL_BOOST_STATS.map(s => ({
  key: `neg:${s.key}`,
  label: s.label,
}))