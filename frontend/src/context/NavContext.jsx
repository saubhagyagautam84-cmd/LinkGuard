import { createContext, useContext, useState } from 'react'

const NavContext = createContext(null)

export function NavProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <NavContext.Provider value={{ navOpen: open, openNav: () => setOpen(true), closeNav: () => setOpen(false) }}>
      {children}
    </NavContext.Provider>
  )
}

export const useNav = () => useContext(NavContext)
