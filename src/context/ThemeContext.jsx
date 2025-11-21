import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children, defaultTheme = "dark" }) { // Por defecto DARK
  // Intentar leer de localStorage, si no existe usar defaultTheme
  const [theme, setTheme] = useState(
    () => localStorage.getItem("vite-ui-theme") || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem("vite-ui-theme", theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeContext.Provider value={value} >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
