'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ChefHat, Package } from 'lucide-react'
import Link from 'next/link'
import OperationsPageHeader from '@/components/operations/OperationsPageHeader'

interface Product {
  id: string
  name: string
  slug: string
}

interface Ingredient {
  id: string
  name: string
  unit: string
}

interface Recipe {
  id: string
  product_id: string
  ingredient_id: string
  percentage: number
  notes: string | null
}

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recipesRes, productsRes, ingredientsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/products/all'),
        fetch('/api/ingredients')
      ])

      if (!recipesRes.ok || !productsRes.ok || !ingredientsRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [recipesData, productsData, ingredientsData] = await Promise.all([
        recipesRes.json(),
        productsRes.json(),
        ingredientsRes.json()
      ])

      setRecipes(recipesData.data || [])
      setProducts(productsData.data || [])
      setIngredients(ingredientsData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe ingredient?')) {
      return
    }

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete recipe')
      }

      setRecipes(recipes.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recipe')
    }
  }

  const handleRecipeSaved = () => {
    fetchData()
    setShowAddForm(false)
    setEditingRecipe(null)
  }

  // Group recipes by product and enrich with product/ingredient data
  const recipesByProduct = recipes.reduce((acc, recipe) => {
    const product = products.find(p => p.id === recipe.product_id)
    const ingredient = ingredients.find(i => i.id === recipe.ingredient_id)
    
    if (!product) return acc
    
    const productName = product.name
    if (!acc[productName]) {
      acc[productName] = {
        product,
        ingredients: []
      }
    }
    
    acc[productName].ingredients.push({
      ...recipe,
      ingredients: ingredient || { id: '', name: 'Unknown', unit: '' }
    })
    
    return acc
  }, {} as Record<string, { product: Product; ingredients: (Recipe & { ingredients: Ingredient })[] }>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm underline"
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OperationsPageHeader
        title="Recipe Management"
        description="Manage product recipes and ingredient percentages"
        icon={<ChefHat className="h-8 w-8 text-orange-600" />}
        actions={
          <div className="flex items-center space-x-4">
            <Link
              href="/operations/inventory"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Package className="w-4 h-4 mr-2" />
              Manage Inventory
            </Link>
            <div className="text-sm text-gray-600">
              {Object.keys(recipesByProduct).length} products
            </div>
          </div>
        }
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Recipe Ingredient
          </button>
        </div>
      </div>

      {(showAddForm || editingRecipe) && (
        <>
          {console.log('🔧 Form should be visible - showAddForm:', showAddForm, 'editingRecipe:', !!editingRecipe)}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-screen overflow-y-auto border-4 border-blue-500">
              <RecipeForm
                recipe={editingRecipe}
                products={products}
                ingredients={ingredients}
                onSave={handleRecipeSaved}
                onCancel={() => {
                  setShowAddForm(false)
                  setEditingRecipe(null)
                }}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-8">
        {Object.entries(recipesByProduct).map(([productName, { product, ingredients }]) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
              <p className="text-sm text-gray-600">
                {ingredients.length} ingredients
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {ingredients
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-24 text-right">
                            <span className="text-lg font-semibold text-gray-900">
                              {recipe.percentage}%
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {recipe.ingredients.name}
                            </h4>
                            {recipe.notes && (
                              <p className="text-sm text-gray-600">{recipe.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 ml-28">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${recipe.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4 z-10 relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setEditingRecipe(recipe)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer pointer-events-auto border border-transparent hover:border-blue-200"
                          type="button"
                          title="Edit ingredient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete(recipe.id)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer pointer-events-auto border border-transparent hover:border-red-200"
                          type="button"
                          title="Delete ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg">
                    {ingredients.reduce((sum, r) => sum + r.percentage, 0).toFixed(2)}%
                  </span>
                </div>
                {ingredients.reduce((sum, r) => sum + r.percentage, 0) !== 100 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Recipe doesn't add up to 100%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(recipesByProduct).length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first recipe ingredient.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Recipe Ingredient
          </button>
        </div>
      )}
    </div>
  )
}

function RecipeForm({
  recipe,
  products,
  ingredients,
  onSave,
  onCancel
}: {
  recipe: Recipe | null
  products: Product[]
  ingredients: Ingredient[]
  onSave: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    product_id: recipe?.product_id || '',
    ingredient_id: recipe?.ingredient_id || '',
    percentage: recipe?.percentage || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (recipe) {
      setFormData({
        product_id: recipe.product_id,
        ingredient_id: recipe.ingredient_id,
        percentage: recipe.percentage.toString()
      })
    }
  }, [recipe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = recipe ? `/api/recipes/${recipe.id}` : '/api/recipes'
      const method = recipe ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save recipe')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {console.log('🔧 RecipeForm rendering - recipe:', !!recipe)}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {recipe ? 'Edit Recipe Ingredient' : 'Add Recipe Ingredient'}
        </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredient
            </label>
            <select
              value={formData.ingredient_id}
              onChange={(e) => setFormData({ ...formData, ingredient_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an ingredient</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.percentage}
              onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (recipe ? 'Update' : 'Add')}
          </button>
        </div>
      </form>
    </div>
    </>
  )
}
