"use client";
import React, { useState } from 'react';
import { Star, Clock, Award, Users, Check } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../utils';

export interface Staff {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  experience: number; // years
  specialties: string[];
  serviceIds: string[]; // Services this staff member can perform
  availability: {
    [key: string]: string[]; // day: available time slots
  };
  isTopRated?: boolean;
  languages?: string[];
}

interface StaffSelectorProps {
  staff: Staff[];
  selectedStaff?: string;
  onStaffSelect: (staffId: string) => void;
  selectedServices?: string[];
  selectedDate?: Date;
  selectedTime?: string;
  showAnyStaff?: boolean;
  className?: string;
}

export const StaffSelector: React.FC<StaffSelectorProps> = ({
  staff,
  selectedStaff,
  onStaffSelect,
  selectedServices = [],
  selectedDate,
  selectedTime,
  showAnyStaff = true,
  className
}) => {
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'name'>('rating');

  // Filter staff based on selected services
  const availableStaff = staff.filter(member => {
    // If no services selected, show all staff
    if (selectedServices.length === 0) return true;
    
    // Check if staff can perform at least one of the selected services
    return selectedServices.some(serviceId => 
      member.serviceIds.includes(serviceId)
    );
  });

  // Check if staff is available for selected date/time
  const isStaffAvailable = (member: Staff) => {
    if (!selectedDate || !selectedTime) return true;
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const availableSlots = member.availability[dayName] || [];
    
    return availableSlots.includes(selectedTime);
  };

  // Sort staff
  const sortedStaff = [...availableStaff].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.experience - a.experience;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Stylist</h2>
        <p className="text-muted-foreground">
          Choose your preferred hair stylist for your appointment
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="rating">Highest Rating</option>
            <option value="experience">Most Experience</option>
            <option value="name">Name</option>
          </select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {availableStaff.length} stylist{availableStaff.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Any Stylist Option */}
      {showAnyStaff && (
        <Card
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-lg',
            selectedStaff === 'any' && 'ring-2 ring-primary bg-primary/5'
          )}
          onClick={() => onStaffSelect('any')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Any Available Stylist
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We'll assign you to the best available stylist for your selected time
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span>4.8+ rating guaranteed</span>
                  </div>
                  <Badge variant="secondary" size="sm">
                    Flexible
                  </Badge>
                </div>
              </div>
              
              {selectedStaff === 'any' && (
                <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStaff.map((member) => {
          const isSelected = selectedStaff === member.id;
          const isAvailable = isStaffAvailable(member);
          
          return (
            <Card
              key={member.id}
              className={cn(
                'relative cursor-pointer transition-all duration-200 hover:shadow-lg',
                isSelected && 'ring-2 ring-primary bg-primary/5',
                !isAvailable && 'opacity-60'
              )}
              onClick={() => isAvailable && onStaffSelect(member.id)}
            >
              {member.isTopRated && (
                <Badge
                  variant="secondary"
                  className="absolute top-3 left-3 z-10 bg-yellow-500 text-white"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Top Rated
                </Badge>
              )}

              {isSelected && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}

              {!isAvailable && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-10">
                  <Badge variant="destructive">
                    Not Available
                  </Badge>
                </div>
              )}

              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center border-2 border-border">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {isAvailable && (
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                      {member.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {member.title}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{member.rating}</span>
                        <span>({member.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{member.experience}y exp</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {member.bio}
                </p>

                {member.specialties.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {specialty}
                        </Badge>
                      ))}
                      {member.specialties.length > 3 && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          +{member.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {member.languages && member.languages.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Languages:</span> {member.languages.join(', ')}
                    </p>
                  </div>
                )}

                <Button
                  variant={isSelected ? "secondary" : "primary"}
                  size="sm"
                  fullWidth
                  disabled={!isAvailable}
                  className={cn(
                    "transition-all duration-200",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isSelected ? 'Selected' : isAvailable ? 'Select' : 'Unavailable'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedStaff.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <div className="text-muted-foreground mb-2">No stylists available</div>
          <p className="text-sm text-muted-foreground">
            Try selecting different services or adjusting your appointment time
          </p>
        </div>
      )}

      {/* Selected Staff Summary */}
      {selectedStaff && selectedStaff !== 'any' && (
        <Card className="bg-muted/30 border-primary/20">
          <CardContent className="p-4">
            {(() => {
              const selected = staff.find(s => s.id === selectedStaff);
              if (!selected) return null;
              
              return (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {selected.name} selected
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selected.title} • {selected.rating}★ ({selected.reviewCount} reviews)
                    </p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {selectedStaff === 'any' && (
        <Card className="bg-muted/30 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">
                  Any available stylist selected
                </h4>
                <p className="text-sm text-muted-foreground">
                  We'll match you with the perfect stylist for your appointment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
