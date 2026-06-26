// Dev: Vite proxy handles /api → localhost:3001
// Built extension: no proxy, call backend directly
const BASE = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api'

const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())

export const getLinks             = ()       => fetch(`${BASE}/links`).then(r => r.json())
export const getLinksByUser       = (uid)    => fetch(`${BASE}/links/mine/${uid}`).then(r => r.json())
export const addLink              = (data)   => post(`${BASE}/links`, data)
export const getUser              = (id)     => fetch(`${BASE}/users/${id}`).then(r => r.json())
export const saveUser             = (data)   => post(`${BASE}/users`, data)
export const getTrustedDomains    = (uid)    => fetch(`${BASE}/trusted-domains/${uid}`).then(r => r.json())
export const addTrustedDomain     = (data)   => post(`${BASE}/trusted-domains`, data)
