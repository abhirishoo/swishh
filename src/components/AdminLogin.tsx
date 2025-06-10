
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ADMIN_CREDENTIALS = [
  { id: "admin@swishview.com", password: "SwishAdmin2024!" },
  { id: "super@swishview.com", password: "SuperAdmin2024!" }
];

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check credentials
    const validAdmin = ADMIN_CREDENTIALS.find(
      admin => admin.id === adminId && admin.password === password
    );

    if (validAdmin) {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      // Store admin session
      localStorage.setItem('swishview_admin', JSON.stringify({ id: adminId, timestamp: Date.now() }));
      navigate("/admin");
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin credentials.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-500/20 rounded-full">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          <CardDescription className="text-gray-300">
            Enter your admin credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId" className="text-sm text-gray-200">Admin ID</Label>
              <Input
                id="adminId"
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-red-400"
                placeholder="Enter admin ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-gray-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-red-400 pr-10"
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white" 
              disabled={loading}
            >
              {loading ? "Verifying..." : "Access Admin Dashboard"}
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
