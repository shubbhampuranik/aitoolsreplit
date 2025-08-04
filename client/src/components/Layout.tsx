import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Search, 
  Bell, 
  User, 
  Menu, 
  X,
  LogOut,
  Settings,
  Bookmark,
  TrendingUp,
  Users,
  MessageSquare,
  BookOpen,
  Briefcase,
  Newspaper
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Tools", href: "/tools", icon: Brain },
    { name: "Models", href: "/models", icon: Brain },
    { name: "Prompts", href: "/prompts", icon: MessageSquare },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "News", href: "/news", icon: Newspaper },
  ];

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.startsWith(item.href);
        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={mobile ? "w-full justify-start" : ""}
              onClick={() => mobile && setMobileMenuOpen(false)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href={isAuthenticated ? "/" : "/"}>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-foreground">AI Hub</span>
                </div>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <NavLinks />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Search - Desktop only */}
              <div className="hidden lg:flex items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                      3
                    </Badge>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                          <AvatarFallback>
                            {user?.firstName?.[0] || user?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <Link href="/profile">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Bookmarks
                      </DropdownMenuItem>
                      <Link href="/admin">
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Button variant="ghost" onClick={handleLogin}>
                    Sign In
                  </Button>
                  <Button onClick={handleLogin}>
                    Join Free
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Mobile Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        className="pl-10"
                      />
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col space-y-2">
                      <NavLinks mobile />
                    </div>

                    {/* Auth Buttons for Mobile */}
                    {!isAuthenticated && (
                      <div className="flex flex-col space-y-2 pt-4 border-t">
                        <Button variant="outline" onClick={handleLogin} className="w-full">
                          Sign In
                        </Button>
                        <Button onClick={handleLogin} className="w-full">
                          Join Free
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AI Hub</span>
              </div>
              <p className="text-muted-foreground mb-4">
                The ultimate destination for discovering, learning, and connecting with the AI community.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  <TrendingUp className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Users className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Discover</h3>
              <ul className="space-y-2">
                <li><Link href="/tools"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">AI Tools</span></Link></li>
                <li><Link href="/prompts"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Prompts</span></Link></li>
                <li><Link href="/courses"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Courses</span></Link></li>
                <li><Link href="/jobs"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Jobs</span></Link></li>
                <li><Link href="/news"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">News</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Community</h3>
              <ul className="space-y-2">
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Discussions</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Collections</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Leaderboards</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Events</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Discord</span></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Submit Tool</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">API</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Blog</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 AI Hub. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Privacy Policy</span>
              <span className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Terms of Service</span>
              <span className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer">Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
