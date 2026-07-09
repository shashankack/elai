import { PropsWithChildren, useEffect, useState } from "react"
import { ThemeContext, ThemeOption, ThemeValue } from "./theme-context"

const THEME_KEY = "medusa_admin_theme"

function normalizeThemeOption(theme: ThemeOption): ThemeOption {
  return theme === "dark" ? "light" : theme
}

function getDefaultValue(): ThemeOption {
  const persisted = localStorage?.getItem(THEME_KEY) as ThemeOption

  if (persisted) {
    return normalizeThemeOption(persisted)
  }

  return "light"
}

function getThemeValue(selected: ThemeOption): ThemeValue {
  const normalized = normalizeThemeOption(selected)

  if (normalized === "system") {
    if (window !== undefined) {
      return "light"
    }

    // Default to light theme if we can't detect the system preference
    return "light"
  }

  return normalized
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<ThemeOption>(getDefaultValue())
  const [value, setValue] = useState<ThemeValue>(getThemeValue(state))

  const setTheme = (theme: ThemeOption) => {
    const normalized = normalizeThemeOption(theme)
    localStorage.setItem(THEME_KEY, normalized)

    const themeValue = getThemeValue(normalized)

    setState(normalized)
    setValue(themeValue)
  }

  useEffect(() => {
    const html = document.querySelector("html")
    if (html) {
      /**
       * Temporarily disable transitions to prevent
       * the theme change from flashing.
       */
      const css = document.createElement("style")
      css.appendChild(
        document.createTextNode(
          `* {
            -webkit-transition: none !important;
            -moz-transition: none !important;
            -o-transition: none !important;
            -ms-transition: none !important;
            transition: none !important;
          }`
        )
      )
      document.head.appendChild(css)

      html.classList.remove(value === "light" ? "dark" : "light")
      html.classList.add(value)
      // Ensures that native elements respect the theme, e.g. the scrollbar.
      html.style.colorScheme = value

      /**
       * Re-enable transitions after the theme has been set,
       * and force the browser to repaint.
       */
      void window.getComputedStyle(css).opacity
      document.head.removeChild(css)
    }
  }, [value])

  return (
    <ThemeContext.Provider value={{ theme: state, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
