import type { WeaponBlade, WeaponHandle, MonkGlove, MonkEssence } from '../../types'

import bladesRaw   from '../../../data/blades.json'
import handlesRaw  from '../../../data/handles.json'
import glovesRaw   from '../../../data/gloves.json'
import essencesRaw from '../../../data/essences.json'

export const blades:   WeaponBlade[]  = bladesRaw   as WeaponBlade[]
export const handles:  WeaponHandle[] = handlesRaw  as WeaponHandle[]
export const gloves:   MonkGlove[]    = glovesRaw   as MonkGlove[]
export const essences: MonkEssence[]  = essencesRaw as MonkEssence[]

const BLADE_MAP   = Object.fromEntries(blades.map(b => [b.name, b]))
const HANDLE_MAP  = Object.fromEntries(handles.map(h => [h.name, h]))
const GLOVE_MAP   = Object.fromEntries(gloves.map(g => [g.name, g]))
const ESSENCE_MAP = Object.fromEntries(essences.map(e => [e.name, e]))

export function getBlade(name: string)   { return BLADE_MAP[name]   }
export function getHandle(name: string)  { return HANDLE_MAP[name]  }
export function getGlove(name: string)   { return GLOVE_MAP[name]   }
export function getEssence(name: string) { return ESSENCE_MAP[name] }