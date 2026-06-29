export const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100)   / 100
export const round4 = (v: number) => Math.round((v + Number.EPSILON) * 10000) / 10000
