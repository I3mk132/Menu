import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import CategoryFilter from '../components/menu/CategoryFilter'
import ItemCard from '../components/menu/ItemCard'
import ItemModal from '../components/menu/ItemModal'
import CartDrawer from '../components/menu/CartDrawer'
import { getCategories, getMenuItems } from '../services/api'

export default function MenuPage() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error

  const load = async () => {
    setStatus('loading')
    try {
      const [cats, menuItems] = await Promise.all([getCategories(), getMenuItems()])
      setCategories(cats)
      setItems(menuItems)
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const visibleItems = useMemo(
    () => (activeCategory ? items.filter((i) => i.category_id === activeCategory) : items),
    [items, activeCategory]
  )

  return (
    <div className="flex min-h-screen flex-col bg-bg font-body">
      <Navbar />
      {status === 'ready' && (
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      )}

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-textMuted">
            <RefreshCw className="animate-spin" size={22} />
            <p className="text-sm">{t('common.loading')}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="text-sm text-textMuted">{t('common.error')}</p>
            <button
              type="button"
              onClick={load}
              className="rounded-control bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryHover"
            >
              {t('common.retry')}
            </button>
          </div>
        )}

        {status === 'ready' && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item) => (
                <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />

      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <CartDrawer />
    </div>
  )
}
