
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { LogOut, UserCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const { currentDoctor, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Profile information display
  const ProfileSection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Doctor Profile</h3>
        <p className="text-sm text-muted-foreground">
          View and manage your profile information.
        </p>
      </div>
      
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex flex-col items-center justify-center space-y-2 mb-4">
          <div className="h-20 w-20 rounded-full bg-cervi-100 flex items-center justify-center">
            <UserCircle className="h-16 w-16 text-cervi-500" />
          </div>
          <h3 className="font-medium text-lg">{currentDoctor?.name || 'Doctor'}</h3>
          <p className="text-sm text-muted-foreground">{currentDoctor?.email}</p>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input value={currentDoctor?.name || ''} readOnly />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input value={currentDoctor?.email || ''} readOnly />
          </div>
          
          {currentDoctor?.specialty && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Specialty</label>
              <Input value={currentDoctor.specialty} readOnly />
            </div>
          )}
          
          {currentDoctor?.license_number && (
            <div className="space-y-1">
              <label className="text-sm font-medium">License Number</label>
              <Input value={currentDoctor.license_number} readOnly />
            </div>
          )}
          
          {currentDoctor?.hospital_affiliation && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Hospital Affiliation</label>
              <Input value={currentDoctor.hospital_affiliation} readOnly />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Account settings and logout
  const AccountSection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences.
        </p>
      </div>
      
      <div className="border rounded-lg p-4 space-y-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Confirm Logout</h4>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to logout?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">App Version</h4>
          <p className="text-sm text-muted-foreground">
            CerviScan v1.0.0
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Settings" showBackButton>
      <div className="p-4 space-y-6 pb-24">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
            <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
          
          <TabsContent value="account">
            <AccountSection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
