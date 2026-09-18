/* eslint-disable react-hooks/set-state-in-effect -- data fetching and derived state sync require setState inside effects */
 /* eslint-disable react-hooks/refs -- stable filters/dataLength refs intentionally mutated during render for stable callbacks */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Product } from '../types/product'
import type { Category } from '../types/category'
import type { Manufacturer } from '../types/manufacturer'
import { fetchProducts } from '../services/products'

export interface ProductFilters {
  categoryId?: string
  manufacturerId?: string
  query?: string
  isActive?: boolean
  isFeatured?: boolean
}

export function useProducts(filters: ProductFilters = {}) {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  // Stabilize filters object — callers often pass inline literals which create a new
  // reference every render and would cause infinite refetch loops.
  const filtersKey = JSON.stringify(filters)
  const parsedFilters = useMemo<ProductFilters>(() => JSON.parse(filtersKey), [filtersKey])

  const filtersRef = useRef<ProductFilters>(parsedFilters)
  filtersRef.current = parsedFilters
  const dataLengthRef = useRef(0)
  dataLengthRef.current = data.length

  const loadProducts = useCallback(async (reset = false) => {
    setLoading(true)
    setError(null)
    try {
      const offset = reset ? 0 : dataLengthRef.current
      const result = await fetchProducts({ ...filtersRef.current, offset })
      if (reset) {
        setData(result.data)
      } else {
        setData(prev => [...prev, ...result.data])
      }
      setHasMore(result.hasMore)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts(true)
  }, [filtersKey, loadProducts])

  const reload = useCallback(() => loadProducts(true), [loadProducts])

  return { data, loading, error, hasMore, total, reload }
}

export function useProduct(productId?: string) {
  const [product, setProduct] = useState<Product | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productId) {
      setProduct(undefined)
      return
    }

    setLoading(true)
    setError(null)

    let cancelled = false

    import('../services/products').then(({ fetchProductById }) => {
      fetchProductById(productId)
        .then(product => {
          if (!cancelled) {
            setProduct(product || undefined)
          }
        })
        .catch(err => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Failed to load product')
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })

    return () => { cancelled = true }
  }, [productId])

  const reload = useCallback(() => {
    if (productId) {
      setLoading(true)
      import('../services/products').then(({ fetchProductById }) => {
        fetchProductById(productId)
          .then(product => setProduct(product || undefined))
          .catch(err => setError(err instanceof Error ? err.message : 'Failed to load product'))
          .finally(() => setLoading(false))
      })
    }
  }, [productId])

  return { product, loading, error, reload }
}

export function useCategories() {
  const [data, setData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    import('../services/products').then(({ fetchCategories }) => {
      fetchCategories()
        .then(categories => {
          if (!cancelled) setData(categories)
        })
        .catch(err => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load categories')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })
    return () => { cancelled = true }
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    import('../services/products').then(({ fetchCategories }) => {
      fetchCategories()
        .then(categories => setData(categories))
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to load categories'))
        .finally(() => setLoading(false))
    })
  }, [])

  return { data, loading, error, reload }
}

export function useManufacturers() {
  const [data, setData] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    import('../services/products').then(({ fetchManufacturers }) => {
      fetchManufacturers()
        .then(manufacturers => {
          if (!cancelled) setData(manufacturers)
        })
        .catch(err => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load manufacturers')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })
    return () => { cancelled = true }
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    import('../services/products').then(({ fetchManufacturers }) => {
      fetchManufacturers()
        .then(manufacturers => setData(manufacturers))
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to load manufacturers'))
        .finally(() => setLoading(false))
    })
  }, [])

  return { data, loading, error, reload }
}

export function useProductSearch(query: string) {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setData([])
      return
    }

    const debounce = setTimeout(() => {
      setLoading(true)
      import('../services/products').then(({ searchProducts }) => {
        searchProducts(query)
          .then(products => setData(products))
          .catch(err => setError(err instanceof Error ? err.message : 'Search failed'))
          .finally(() => setLoading(false))
      })
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  return { data, loading, error }
}
