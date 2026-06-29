import type { Race, Guild, GuildRank, Perk } from '../../types'

import racesRaw  from '../../../data/races.json'
import guildsRaw from '../../../data/guilds.json'
import perksRaw  from '../../../data/perks.json'

const perksTyped: Perk[] = perksRaw as Perk[]

export const races:  Race[]  = racesRaw  as Race[]
export const guilds: Guild[] = guildsRaw as Guild[]

const RACE_MAP  = Object.fromEntries(races.map(r => [r.name, r]))
const GUILD_MAP = Object.fromEntries(guilds.map(g => [g.name, g]))
const PERK_MAP  = Object.fromEntries(perksTyped.map(p => [p.name, p]))

export function getRace(name: string):  Race  | undefined { return RACE_MAP[name]  }
export function getGuild(name: string): Guild | undefined { return GUILD_MAP[name] }
export function getPerk(name: string)                     { return PERK_MAP[name]  }

export function getGuildRank(guild: Guild, rank: number): GuildRank | undefined {
  for (let i = 0; i < guild.ranks.length; i++) {
    if (guild.ranks[i].rank === rank) return guild.ranks[i]
  }
  return undefined
}

export function isMonkGuild(guildName: string): boolean {
  return guildName === "Monk"
}