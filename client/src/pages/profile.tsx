import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { User, LogOut, ShoppingBag, Calendar, CheckCircle2 } from "lucide-react";
import type { User as UserType, AccessToken } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: isLoadingUser } = useQuery<UserType | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: accessTokens = [], isLoading: isLoadingTokens } = useQuery<AccessToken[]>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProductName = (product: string) => {
    const names: Record<string, string> = {
      exam: "Full Exam Mode",
      scenario: "Scenario Quiz Mode",
      bundle: "Bundle Package",
    };
    return names[product] || product;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-profile-title">
            My Profile
          </h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-home"
          >
            Back to Home
          </Button>
        </div>

        <div className="grid gap-8">
          <Card data-testid="card-user-info">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl" data-testid="text-user-name">
                    {user.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-1" data-testid="text-user-email">
                    {user.email}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card data-testid="card-purchased-products">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Purchased Products
              </CardTitle>
              <CardDescription>
                Your active quiz mode access and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTokens ? (
                <p className="text-muted-foreground">Loading purchases...</p>
              ) : accessTokens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4" data-testid="text-no-purchases">
                    You haven't purchased any products yet.
                  </p>
                  <Button onClick={() => setLocation("/")} data-testid="button-browse-products">
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {accessTokens.map((token) => {
                    const expired = isExpired(token.expiresAt);
                    return (
                      <div
                        key={token.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                        data-testid={`product-${token.product}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold" data-testid={`text-product-name-${token.product}`}>
                              {getProductName(token.product)}
                            </h3>
                            {expired ? (
                              <Badge variant="destructive" data-testid={`badge-expired-${token.product}`}>
                                Expired
                              </Badge>
                            ) : (
                              <Badge variant="default" data-testid={`badge-active-${token.product}`}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span data-testid={`text-purchased-date-${token.product}`}>
                                Purchased {formatDate(token.createdAt)}
                              </span>
                            </div>
                            {token.expiresAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span data-testid={`text-expiry-date-${token.product}`}>
                                  {expired ? "Expired" : "Expires"} {formatDate(token.expiresAt)}
                                </span>
                              </div>
                            )}
                            {!token.expiresAt && (
                              <Badge variant="secondary" data-testid={`badge-lifetime-${token.product}`}>
                                Lifetime Access
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
