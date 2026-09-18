import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { CartItem, CartSummary } from '../types/cart'
import type { Product } from '../types/product'
import { fetchCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart } from '../services/cart'

type CartContextValue = {
  items: (CartItem & { product: Product })[]
  summary: CartSummary
  loading: boolean
  itemCount: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  setQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clear: () => Promise<void>
  reload: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([])
  const [loading, setLoading] = useState(true)

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { items: cartItems } = await fetchCart(user.id)
      setItems(cartItems)
    } catch (err) {
      console.error('Failed to load cart:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCart()

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user?.id}` },
        () => loadCart()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadCart])

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    if (!user) throw new Error('User not authenticated')
    await addToCart(user.id, productId, quantity)
    await loadCart()
  }, [user, loadCart])

  const setQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user) throw new Error('User not authenticated')
    await updateCartItemQuantity(user.id, itemId, quantity)
    await loadCart()
  }, [user, loadCart])

  const removeItem = useCallback(async (itemId: string) => {
    if (!user) throw new Error('User not authenticated')
    await removeFromCart(user.id, itemId)
    await loadCart()
  }, [user, loadCart])

  const clear = useCallback(async () => {
    if (!user) throw new Error('User not authenticated')
    await clearCart(user.id)
    await loadCart()
  }, [user, loadCart])

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
    const discount = items.reduce((sum, item) => {
      const itemDiscount = ((item.product?.price || 0) * item.quantity * (item.product?.discountPercent || 0)) / 100
      return sum + itemDiscount
    }, 0)
    const deliveryFee = 150
    const total = subtotal - discount + deliveryFee
    return { subtotal, discount, deliveryFee, total }
  }, [items])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      summary,
      loading,
      itemCount,
      addItem,
      setQuantity,
      removeItem,
      clear,
      reload: loadCart,
    }),
    [items, summary, loading, itemCount, addItem, setQuantity, removeItem, clear, loadCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within CartProvider')
  return value
}