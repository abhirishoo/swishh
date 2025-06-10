import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Eye, 
  Calendar, 
  DollarSign, 
  Play, 
  Pause, 
  CheckCircle,
  CreditCard,
  LogOut,
  BarChart3
} from "lucide-react";
import SwishViewLogo from "@/components/SwishViewLogo";
import CampaignActions from "@/components/CampaignActions";
import CampaignForm from "@/components/CampaignForm";
import UserAvatar from "@/components/UserAvatar";
import YouTubeThumbnail from "@/components/YouTubeThumbnail";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Dashboard auth state change:", event, session);
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
          fetchCampaigns();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    console.log("Checking user session...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No session found, redirecting to auth");
      navigate("/auth");
      return;
    }
    
    console.log("User session found:", session.user.email);
    setUser(session.user);
    localStorage.setItem('swishview_user', JSON.stringify(session.user));
    fetchCampaigns();
  };

  const fetchCampaigns = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log("Fetching campaigns for user:", session.user.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
      
      console.log("Campaigns fetched:", data);
      setCampaigns(data || []);
    } catch (error: any) {
      console.error("Fetch campaigns error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log("Signing out...");
    await supabase.auth.signOut();
    localStorage.removeItem('swishview_user');
    navigate("/");
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCampaign(null);
    fetchCampaigns();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCampaign(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      paused: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-4 w-4";
    switch (status) {
      case 'active':
        return <Play className={`${iconClass} text-green-600`} />;
      case 'completed':
        return <CheckCircle className={`${iconClass} text-blue-600`} />;
      case 'paused':
        return <Pause className={`${iconClass} text-gray-600`} />;
      default:
        return <CreditCard className={`${iconClass} text-yellow-600`} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg sm:text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <SwishViewLogo />
              <div className="flex items-center space-x-2 sm:space-x-4">
                <UserAvatar user={user} />
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, {user?.email}
                </span>
                <Button variant="outline" onClick={handleSignOut} size="sm">
                  <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <CampaignForm
            campaign={editingCampaign}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <SwishViewLogo />
            <div className="flex items-center space-x-2 sm:space-x-4">
              <UserAvatar user={user} />
              <span className="text-sm text-gray-600 hidden sm:inline">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut} size="sm">
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Your Campaigns
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mt-2">
            Manage and track your video promotion campaigns
          </p>
        </div>

        <div className="mb-8">
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Campaign
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <Card className="text-center py-12 sm:py-16 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent>
              <BarChart3 className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                No campaigns yet
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                Create your first campaign to start promoting your videos
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* YouTube Thumbnail Section */}
                    <div className="lg:w-80 xl:w-96 flex-shrink-0">
                      {(campaign.youtube_video_url || campaign.video_url) ? (
                        <YouTubeThumbnail 
                          videoUrl={campaign.youtube_video_url || campaign.video_url} 
                          size="lg"
                          className="h-48 lg:h-full"
                        />
                      ) : (
                        <div className="h-48 lg:h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Play className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Campaign Details Section */}
                    <div className="flex-1 p-6 lg:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                              {campaign.title}
                            </h3>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-sm sm:text-base text-gray-600">
                            Target: {campaign.target_views?.toLocaleString()} views
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <Eye className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-xs text-blue-600 font-medium">Current Views</p>
                            <p className="text-lg font-bold text-blue-900">
                              {campaign.current_views?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <p className="text-xs text-green-600 font-medium">Budget</p>
                            <p className="text-lg font-bold text-green-900">${campaign.budget}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Duration</p>
                            <p className="text-lg font-bold text-purple-900">{campaign.campaign_duration} days</p>
                          </div>
                        </div>
                      </div>

                      {campaign.status === 'pending' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <Button
                            onClick={() => navigate(`/payment/${campaign.id}`)}
                            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            size="lg"
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            Complete Payment with PayPal
                          </Button>
                          <p className="text-sm text-yellow-700 mt-2">
                            Campaign will activate after payment confirmation
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center text-sm text-gray-600 mb-3 sm:mb-0">
                          {getStatusIcon(campaign.status)}
                          <span className="ml-2 capitalize font-medium">{campaign.status}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                        </div>

                        <CampaignActions
                          campaign={campaign}
                          onCampaignUpdated={fetchCampaigns}
                          onEditClick={() => handleEditCampaign(campaign)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
