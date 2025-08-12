import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User,
  Settings,
  Bookmark,
  BookmarkX,
  TrendingUp,
  Star,
  ArrowUp,
  MessageSquare,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Mail,
  Edit2,
  Save,
  X,
  Trophy,
  Activity,
  Heart,
  Eye,
  Brain,
  BookOpen,
  Briefcase
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  skills?: string[];
  karmaScore?: number;
  createdAt?: string;
}

interface UserStats {
  toolsSubmitted: number;
  promptsSubmitted: number;
  coursesSubmitted: number;
  jobsSubmitted: number;
  totalUpvotes: number;
  totalViews: number;
  bookmarksCount: number;
  commentsCount: number;
}

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get tab from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'overview';

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: [] as string[],
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: (user as any)?.firstName || '',
        lastName: (user as any)?.lastName || '',
        bio: (user as any)?.bio || '',
        skills: (user as any)?.skills || [],
      });
    }
  }, [user]);

  // Mock user stats - in real app this would come from API
  const userStats: UserStats = {
    toolsSubmitted: 12,
    promptsSubmitted: 25,
    coursesSubmitted: 3,
    jobsSubmitted: 1,
    totalUpvotes: 147,
    totalViews: 2840,
    bookmarksCount: 89,
    commentsCount: 156,
  };

  const { data: bookmarks } = useQuery({
    queryKey: ["/api/bookmarks"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest("PUT", "/api/user/profile", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        firstName: (user as any)?.firstName || '',
        lastName: (user as any)?.lastName || '',
        bio: (user as any)?.bio || '',
        skills: (user as any)?.skills || [],
      });
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !editForm.skills.includes(skill)) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${(user as any)?.firstName[0]}${(user as any)?.lastName[0]}`;
    }
    if (user?.firstName) {
      return (user as any)?.firstName[0];
    }
    if (user?.email) {
      return (user as any)?.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${(user as any)?.firstName} ${(user as any)?.lastName}`;
    }
    if (user?.firstName) {
      return (user as any)?.firstName;
    }
    return user?.email || 'User';
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date((user as any)?.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'Recently';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="loading-shimmer w-32 h-8 rounded"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Profile Header */}
      <section className="hero-gradient py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={user?.profileImageUrl} alt={getDisplayName()} />
                <AvatarFallback className="text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {getDisplayName()}
                  </h1>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="ml-auto"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {getMemberSince()}</span>
                  </div>
                </div>

                {/* Karma Score */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Trophy className="w-3 h-3 mr-1" />
                    {user?.karmaScore || 0} Karma
                  </Badge>
                </div>

                {/* Bio */}
                {isEditing ? (
                  <div className="space-y-3 max-w-md">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground max-w-md">
                    {user?.bio || "No bio added yet. Click 'Edit Profile' to add one."}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-auto">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.totalUpvotes}
                  </div>
                  <div className="text-sm text-muted-foreground">Upvotes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.totalViews}
                  </div>
                  <div className="text-sm text-muted-foreground">Views</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.bookmarksCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Bookmarks</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.commentsCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Skills</h3>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editForm.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <Input
                    placeholder="Add a skill..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        addSkill(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addSkill(input.value);
                      input.value = '';
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {user?.skills && (user as any)?.skills.length > 0 ? (
                  (user as any)?.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <User className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="submissions">
              <Brain className="w-4 h-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contribution Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span>Tools Submitted</span>
                      </div>
                      <Badge variant="secondary">{userStats.toolsSubmitted}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <span>Prompts Submitted</span>
                      </div>
                      <Badge variant="secondary">{userStats.promptsSubmitted}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        <span>Courses Submitted</span>
                      </div>
                      <Badge variant="secondary">{userStats.coursesSubmitted}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        <span>Jobs Submitted</span>
                      </div>
                      <Badge variant="secondary">{userStats.jobsSubmitted}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Heart className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Upvoted "GPT-4 Assistant Pro"</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Bookmark className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Bookmarked "Creative Writing Prompts"</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Commented on "AI Video Editor"</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Submissions</h3>
              <p className="text-muted-foreground">
                Tools, prompts, courses, and jobs you've submitted will appear here.
              </p>
            </div>
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks">
            {(bookmarks as any) && (bookmarks as any).length > 0 ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:gap-6">
                  {(bookmarks as any).map((bookmark: any) => (
                    <div
                      key={bookmark.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {bookmark.itemType}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Bookmarked {new Date(bookmark.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {bookmark.item && (
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                {bookmark.item.title || bookmark.item.name}
                              </h3>
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {bookmark.item.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {bookmark.item.upvotes !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <ArrowUp className="w-4 h-4" />
                                    {bookmark.item.upvotes}
                                  </span>
                                )}
                                {bookmark.item.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    {bookmark.item.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (bookmark.itemType === 'tool') {
                                window.location.href = `/tools/${bookmark.itemId}`;
                              } else if (bookmark.itemType === 'prompt') {
                                window.location.href = `/prompts/${bookmark.itemId}`;
                              }
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await apiRequest("POST", `/api/${bookmark.itemType}s/${bookmark.itemId}/bookmark`);
                                queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
                              } catch (error) {
                                console.error("Failed to remove bookmark:", error);
                              }
                            }}
                          >
                            <BookmarkX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your Bookmarks</h3>
                <p className="text-muted-foreground">
                  Items you've bookmarked will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
              <p className="text-muted-foreground">
                Your complete activity history will be shown here.
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
              <p className="text-muted-foreground">
                Privacy settings, notifications, and account preferences will be available here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
