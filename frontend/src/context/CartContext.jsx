import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const CartContext = createContext(null)

function lineUnitPrice(item, size) {
  const base = item.discounted_price ?? item.price
  return base + (size?.price_modifier || 0)
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((item, size, quantity) => {
    setLines((prev) => {
      const sizeKey = size ? `${size.name_en}` : 'default'
      const cartKey = `${item.id}::${sizeKey}`
      const existing = prev.find((l) => l.cartKey === cartKey)
      if (existing) {
        return prev.map((l) =>
          l.cartKey === cartKey ? { ...l, quantity: l.quantity + quantity } : l
        )
      }
      return [...prev, { cartKey, item, size, quantity }]
    })
    setIsOpen(true)
  }, [])

  const removeLine = useCallback((cartKey) => {
    setLines((prev) => prev.filter((l) => l.cartKey !== cartKey))
  }, [])

  const updateQuantity = useCallback((cartKey, quantity) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.cartKey !== cartKey)
        : prev.map((l) => (l.cartKey === cartKey ? { ...l, quantity } : l))
    )
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + lineUnitPrice(l.item, l.size) * l.quantity, 0),
    [lines]
  )

  return (
    <CartContext.Provider
      value={{
        lines,
        addItem,
        removeLine,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isOpen,
        setIsOpen,
        lineUnitPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
