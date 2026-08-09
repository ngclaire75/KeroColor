import { createContext, useContext, useState } from 'react'

const SearchContext = createContext(null)
const STORAGE_KEY = 'kc-search-result'

function loadStoredSearchResult() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function SearchProvider({ children }) {
  const [searchResult, setSearchResultState] = useState(loadStoredSearchResult)

  const setSearchResult = (value) => {
    setSearchResultState(value)
    try {
      if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }

  return (
    <SearchContext.Provider value={{ searchResult, setSearchResult }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  return useContext(SearchContext)
}
