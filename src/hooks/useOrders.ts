import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import type { Order, OrderItem } from '../types/order'
import { fetchOrders, fetchOrderById, createOrder } from '../services/orders'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const reload = useCallback(() => loadOrders(), [loadOrders])

  return { orders, loading, error, reload }
}

export function useOrder(orderId?: string) {
  const [order, setOrder] = useState<{ items: any[] } & { id: string; orderNumber: string; customerId: string; customerName: string; createdAt: string; status: string; subtotal: number; discount: number; deliveryFee: number; total: number; paymentMethod: string; address: string; timeline: any[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      return
    }

    setLoading(true)
    setError(null)

    let cancelled = false

    import('../services/orders').then(({ fetchOrderById }) => {
      fetchOrderById(orderId)
        .then(order => {
          if (!cancelled) setOrder(order)
        })
        .catch(err => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load order')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })

    return () => { cancelled = true }
  }, [orderId])

  const reload = useCallback(() => {
    if (orderId) {
      setLoading(true)
      import('../services/orders').then(({ fetchOrderById }) => {
        fetchOrderById(orderId)
          .then(order => setOrder(order))
          .catch(err => setError(err instanceof Error ? err.message : 'Failed to load order'))
          .finally(() => setLoading(false))
      })
    }
  }, [orderId])

  return { order, loading, error, reload }
}

export function useCreateOrder() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (addressId: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated')
    setLoading(true)
    setError(null)
    try {
      const orderId = await createOrder(user.id, addressId)
      return orderId
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  return { create, loading, error }
}