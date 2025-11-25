"use client"

import { useState, useEffect, useCallback } from "react"
import { favoriteApi } from "../api"

type ItemType = "song" | "album" | "artist" | "playlist"

export const useFavorite = (itemType: ItemType, itemId: string) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await favoriteApi.check(itemType, itemId)
        setIsFavorite(res.data.isFavorite)
      } catch (e) {
        console.warn("Check favorite error", e)
      }
    }
    if (itemId) checkFavorite()
  }, [itemType, itemId])

  const toggleFavorite = useCallback(async () => {
    setLoading(true)
    try {
      if (isFavorite) {
        await favoriteApi.remove(itemType, itemId)
        setIsFavorite(false)
      } else {
        await favoriteApi.add(itemType, itemId)
        setIsFavorite(true)
      }
    } catch (e) {
      console.warn("Toggle favorite error", e)
    } finally {
      setLoading(false)
    }
  }, [isFavorite, itemType, itemId])

  return { isFavorite, toggleFavorite, loading }
}
