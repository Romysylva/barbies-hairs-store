"use client";
import React, { useState } from 'react';
import { DashboardLayout } from '../../../../../shared/components/layout/DashboardLayout';
import { Card, CardHeader, CardContent } from '../../../../../shared/components/ui/Card';
import { Badge } from '../../../../../shared/components/ui/Badge';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { ProductCard } from '../../../../../shared/components/product/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  Search, 
  Filter, 
  Grid3X3,
  List,
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react';

// Mock products data for shop
const mockShopProducts = [
  {
    _id: '1',
    name: 'Premium Hair Serum',
    description: 'Nourishing serum for damaged hair with argan oil',
    category: { _id: '1', name: 'Hair Care', slug: 'hair-care', createdAt: '', updatedAt: '' },
    price: 49.99,
    priceDiscount: 39.99,
    images: ['/api/placeholder/300/300'],
    imageCover: '/api/placeholder/300/300',
    ratingsAverage: 4.5,
    ratingsQuantity: 89,
    quantity: 150,
    sold: 89,
    featured: true,
    bestseller: false,
    newArrival: false,
    slug: 'premium-hair-serum',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    _id: '2',
    name: 'Professional Hair Dryer',
    description: 'High-performance hair dryer with ionic technology',
    category: { _id: '2', name: 'Styling Tools', slug: 'styling-tools', createdAt: '', updatedAt: '' },
    price: 129.99,
    images: ['/api/placeholder/300/300'],
    imageCover: '/api/placeholder/300/300',
    ratingsAverage: 4.8,
    ratingsQuantity: 156,
    quantity: 45,
    sold: 234,
    featured: false,
    bestseller: true,
    newArrival: false,
    slug: 'professional-hair-dryer',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    _id: '3',
    name: 'Curl Defining Cream',
    description: 'Enhance and define natural curls with long-lasting hold',
    category: { _id: '1', name: 'Hair Care', slug: 'hair-care', createdAt: '', updatedAt: '' },
    price: 34.99,
    images: ['/api/placeholder/300/300'],
    imageCover: '/api/placeholder/300/300',
    ratingsAverage: 4.3,
    ratingsQuantity: 67,
    quantity: 89,
    sold: 156,
    featured: false,
    bestseller: false,
    newArrival: true,
    slug: 'curl-defining-cream',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    _id: '4',
    name: 'Hair Styling Kit',
    description: 'Complete professional styling kit with brush and clips',
    category: { _id: '2', name: 'Styling Tools', slug: 'styling-tools', createdAt: '', updatedAt: '' },
    price: 89.99,
    images: ['/api/placeholder/300/300'],
    imageCover: '/api/placeholder/300/300',
    ratingsAverage: 4.2,
    ratingsQuantity: 45,
    quantity: 23,
    sold: 78,
    featured: false,
    bestseller: false,
    newArrival: false,
    slug: 'hair-styling-kit',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
];

const categories = [
  { id: '', name: 'All Categories' },
  { id: 'hair-care', name: 'Hair Care' },
  { id: 'styling-tools', name: 'Styling Tools' },
  { id: 'accessories', name: 'Accessories' },
];

export default function ShopPage() {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistedProducts, setWishlistedProducts] = useState<string[]>([]);

  const filteredProducts = mockShopProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.slug === selectedCategory;
    const matchesPrice = (product.priceDiscount || product.price) >= priceRange[0] && 
                        (product.priceDiscount || product.price) <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddToCart = (product: any) => {
    addToCart({ product, quantity: 1 });
  };

  const handleAddToWishlist = (product: any) => {
    setWishlistedProducts(prev => 
      prev.includes(product._id)
        ? prev.filter(id => id !== product._id)
        : [...prev, product._id]
    );
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" leftIcon={<Heart className="h-4 w-4" />}>
        Wishlist ({mockShopProducts.length})
      </Button>
      <Button variant="primary" size="sm" leftIcon={<ShoppingCart className="h-4 w-4" />}>
        Cart (0)
      </Button>
    </div>
  );

  return (
    <DashboardLayout
      title="Shop Hair Products"
      description={`Discover our premium collection of hair care products (${filteredProducts.length} items)`}
      user={user}
      onLogout={logout}
      actions={actions}
      searchPlaceholder="Search products..."
    >
      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search products..."
                leftIcon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                className="input min-w-40"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
              <select 
                className="input min-w-32"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popularity">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              >
                Filters
              </Button>

              <div className="flex border border-border rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 text-sm ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 text-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Advanced Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <select className="input">
                    <option value="">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Availability</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      In Stock
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-border" />
                      On Sale
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Button variant="primary" size="sm">Apply Filters</Button>
                <Button variant="ghost" size="sm">Clear All</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              isWishlisted={wishlistedProducts.includes(product._id)}
              linkPrefix="/shop"
              showQuickActions={true}
              showBadges={true}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src={product.imageCover}
                      alt={product.name}
                      className="h-full w-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(product.ratingsAverage)
                                    ? "text-warning-500 fill-current"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">
                              ({product.ratingsQuantity})
                            </span>
                          </div>
                          
                          <Badge variant="outline" size="sm">
                            {product.category.name}
                          </Badge>
                          
                          {product.featured && (
                            <Badge variant="primary" size="sm">Featured</Badge>
                          )}
                          {product.bestseller && (
                            <Badge variant="secondary" size="sm">Best Seller</Badge>
                          )}
                          {product.newArrival && (
                            <Badge variant="outline" size="sm">New</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-primary">
                            ${product.priceDiscount || product.price}
                          </span>
                          {product.priceDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant={wishlistedProducts.includes(product._id) ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleAddToWishlist(product)}
                          leftIcon={<Heart className={`h-4 w-4 ${wishlistedProducts.includes(product._id) ? 'fill-current' : ''}`} />}
                        >
                          {wishlistedProducts.includes(product._id) ? 'Remove' : 'Wishlist'}
                        </Button>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.quantity === 0}
                          leftIcon={<ShoppingCart className="h-4 w-4" />}
                        >
                          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search criteria or browse different categories.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
              <Button variant="primary" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setPriceRange([0, 200]);
              }}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="primary" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
