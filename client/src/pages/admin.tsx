import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Users, BarChart3, Mail, Shield, Home, Crown, Trash2, Eye } from "lucide-react";
import type { User as UserType, ContactMessage, PageAnalytics, AdminStats } from "@shared/schema";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: isAdminData, isLoading: isAdminLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/is-admin"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAdminData?.isAdmin === true,
  });

  const { data: users } = useQuery<Omit<UserType, "passwordHash">[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdminData?.isAdmin === true,
  });

  const { data: messages } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAdminData?.isAdmin === true,
  });

  const { data: analytics } = useQuery<PageAnalytics[]>({
    queryKey: ["/api/admin/analytics"],
    enabled: isAdminData?.isAdmin === true,
  });

  const grantPremiumMutation = useMutation({
    mutationFn: async ({ userId, daysValid }: { userId: string; daysValid?: number }) => {
      return await apiRequest("POST", "/api/admin/grant-premium", { userId, daysValid });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Premium access granted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokePremiumMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", "/api/admin/revoke-premium", { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Premium access revoked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/contact-messages/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Message deleted.",
      });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/contact-messages/${id}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
    },
  });

  useEffect(() => {
    if (!isAdminLoading && isAdminData?.isAdmin !== true) {
      setLocation("/");
    }
  }, [isAdminData, isAdminLoading, setLocation]);

  if (isAdminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAdminData?.isAdmin !== true) {
    return null;
  }

  const filteredUsers = users?.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalPageViews = stats?.pageViews?.reduce((sum, p) => sum + p.visitCount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">Admin Dashboard</span>
            </div>
            <Button variant="ghost" onClick={() => setLocation("/")} data-testid="button-back-home">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-stat-users">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-premium">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.premiumUsers || 0}</p>
                  <p className="text-sm text-muted-foreground">Premium Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-visits">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{totalPageViews}</p>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stat-messages">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.contactMessages || 0}</p>
                  <p className="text-sm text-muted-foreground">Contact Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList data-testid="tabs-admin">
            <TabsTrigger value="users" data-testid="tab-users">User Management</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Contact Messages</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Page Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and grant premium access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-users"
                  />
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                      data-testid={`row-user-${user.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.isAdmin === 1 && (
                            <Badge variant="default" className="bg-purple-500">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => grantPremiumMutation.mutate({ userId: user.id, daysValid: 30 })}
                          disabled={grantPremiumMutation.isPending}
                          data-testid={`button-grant-30d-${user.id}`}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          +30 Days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => grantPremiumMutation.mutate({ userId: user.id })}
                          disabled={grantPremiumMutation.isPending}
                          data-testid={`button-grant-lifetime-${user.id}`}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Lifetime
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokePremiumMutation.mutate(user.id)}
                          disabled={revokePremiumMutation.isPending}
                          data-testid={`button-revoke-${user.id}`}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No users found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>View and manage messages from the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages?.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`p-4 border rounded-lg ${msg.isRead ? 'border-border' : 'border-primary bg-primary/5'}`}
                      data-testid={`row-message-${msg.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{msg.name}</p>
                          <p className="text-sm text-muted-foreground">{msg.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!msg.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markReadMutation.mutate(msg.id)}
                              data-testid={`button-mark-read-${msg.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessageMutation.mutate(msg.id)}
                            data-testid={`button-delete-message-${msg.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{msg.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, yyyy 'at' h:mm a") : "Unknown"}
                      </p>
                    </div>
                  ))}
                  {(!messages || messages.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No messages yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Page Analytics</CardTitle>
                <CardDescription>View page visit counts across the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.map((page) => (
                    <div 
                      key={page.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                      data-testid={`row-analytics-${page.id}`}
                    >
                      <div>
                        <p className="font-medium">{page.pagePath}</p>
                        <p className="text-xs text-muted-foreground">
                          Last visited: {page.lastVisited ? format(new Date(page.lastVisited), "MMM d, yyyy 'at' h:mm a") : "Unknown"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg">
                        {page.visitCount} visits
                      </Badge>
                    </div>
                  ))}
                  {(!analytics || analytics.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No page analytics yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
