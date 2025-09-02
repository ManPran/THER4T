import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, MessageSquare } from 'lucide-react';
import { Story } from '@/store/stories';

interface StoryCardProps {
  story: Story;
  className?: string;
}

export function StoryCard({ story, className = '' }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'student':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'healthcare':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'community':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'Teacher/Educator';
      case 'parent':
        return 'Parent/Guardian';
      case 'student':
        return 'Student';
      case 'healthcare':
        return 'Healthcare Worker';
      case 'community':
        return 'Community Member';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <Card className={`w-full hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-3 text-foreground leading-tight">
              {story.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{story.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {story.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(story.createdAt)}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`capitalize ${getRoleColor(story.role)}`}>
                {getRoleDisplayName(story.role)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3" />
                Story shared
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Issue:</strong> {story.issue}
            </p>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-foreground leading-relaxed text-base">
              {story.story}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
