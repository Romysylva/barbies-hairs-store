"use client";
import React, { useState } from 'react';
import { Clock, Star, Users, Check } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../utils';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  rating: number;
  reviewCount: number;
  image?: string;
  features: string[];
  staffIds: string[]; // IDs of staff who can perform this service
  isPopular?: boolean;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
  onServiceRemove: (serviceId: string) => void;
  categories?: string[];
  className?: string;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServices,
  onServiceSelect,
  onServiceRemove,
  categories,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allCategories = ['all', ...(categories || Array.from(new Set(services.map(s => s.category))))];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Services</h2>
        <p className="text-muted-foreground">
          Choose the hair services you'd like to book
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {category === 'all' ? 'All Services' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          
          return (
            <Card
              key={service.id}
              className={cn(
                'relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg',
                isSelected && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => {
                if (isSelected) {
                  onServiceRemove(service.id);
                } else {
                  onServiceSelect(service.id);
                }
              }}
            >
              {service.isPopular && (
                <Badge
                  variant="secondary"
                  className="absolute top-3 left-3 z-10 bg-warning text-warning-foreground"
                >
                  Popular
                </Badge>
              )}

              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}

              {service.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                  />
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{service.rating}</span>
                    <span>({service.reviewCount})</span>
                  </div>
                </div>

                {service.features.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Includes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {service.features.length > 3 && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          +{service.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(service.price)}
                  </span>
                  <Button
                    variant={isSelected ? "secondary" : "primary"}
                    size="sm"
                    className={cn(
                      "transition-all duration-200",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">No services found</div>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="bg-muted/30 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">
                  {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Total duration: {formatDuration(
                    selectedServices.reduce((total, serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return total + (service?.duration || 0);
                    }, 0)
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(
                    selectedServices.reduce((total, serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return total + (service?.price || 0);
                    }, 0)
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Total price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
