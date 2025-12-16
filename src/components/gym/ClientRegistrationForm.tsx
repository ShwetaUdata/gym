import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGym } from '@/context/GymContext';
import { useToast } from '@/hooks/use-toast';
import { calculateAge, calculateEndDate, getDayOfWeek } from '@/utils/pricing';
import { MembershipType } from '@/types/gym';
import { clientApi } from '@/services/apiService';
import { User, MapPin, Briefcase, Phone, Calendar, Mail, Dumbbell, Heart, Zap, UserCheck } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: '1', label: '1 Month' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '1 Year' },
  { value: 'custom', label: 'Custom' },
];

export function ClientRegistrationForm() {
  const navigate = useNavigate();
  const { refreshClients } = useGym();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    occupation: '',
    mobile: '',
    dob: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    email: '',
    slot: '' as 'morning' | 'evening' | '',
    membershipPeriod: '',
    customMonths: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [membershipType, setMembershipType] = useState<MembershipType>({
    gym: false,
    cardio: false,
    crossfit: false,
    pt: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedAge = formData.dob ? calculateAge(formData.dob) : 0;
  const months = formData.membershipPeriod === 'custom' 
    ? parseInt(formData.customMonths) || 0 
    : parseInt(formData.membershipPeriod) || 0;
  const endDate = formData.startDate && months ? calculateEndDate(formData.startDate, months) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobile || !formData.dob || !formData.gender || !formData.slot) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including time slot",
        variant: "destructive",
      });
      return;
    }

    if (!membershipType.gym && !membershipType.cardio && !membershipType.crossfit && !membershipType.pt) {
      toast({
        title: "Select Membership",
        description: "Please select at least one membership type",
        variant: "destructive",
      });
      return;
    }

    if (!months || months < 1) {
      toast({
        title: "Invalid Period",
        description: "Please select a valid membership period",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const registrationDay = getDayOfWeek(new Date());
      
      const response = await clientApi.register({
        name: formData.name,
        address: formData.address,
        occupation: formData.occupation,
        mobile: formData.mobile,
        dob: formData.dob,
        age: calculatedAge,
        gender: formData.gender as 'male' | 'female' | 'other',
        email: formData.email,
        slot: formData.slot as 'morning' | 'evening',
        membershipType,
        membershipPeriod: months,
        startDate: formData.startDate,
        endDate,
        registrationDay,
      });

      const client = response.client;
      
      // Refresh clients in context
      refreshClients();

      toast({
        title: "Registration Successful! 🎉",
        description: `Welcome to PowerFit Gym! Your Client ID is ${client.clientId}. A welcome email has been sent to ${formData.email}.`,
      });

      navigate(`/payment/${client.clientId}`);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className="max-w-2xl mx-auto animate-slide-up">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl gradient-text">New Member Registration</CardTitle>
        <CardDescription>Join the PowerFit family and transform your life</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    placeholder="Enter mobile number"
                    className="pl-10"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dob"
                    type="date"
                    className="pl-10"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                  />
                </div>
                {calculatedAge > 0 && (
                  <p className="text-sm text-primary">Age: {calculatedAge} years</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="occupation"
                    placeholder="Your occupation"
                    className="pl-10"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slot">Member Slot *</Label>
                <Select
                  value={formData.slot}
                  onValueChange={(value) => setFormData({ ...formData, slot: value as 'morning' | 'evening' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Enter your address"
                    className="pl-10"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Membership Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Membership Type *
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'gym', label: 'Gym', icon: Dumbbell, price: '₹1,500/mo' },
                { key: 'cardio', label: 'Cardio', icon: Heart, price: '₹500/mo' },
                { key: 'crossfit', label: 'Crossfit', icon: Zap, price: '₹500/mo' },
                { key: 'pt', label: 'PT', icon: UserCheck, price: '₹12,000/mo' },
              ].map(({ key, label, icon: Icon, price }) => (
                <label
                  key={key}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    membershipType[key as keyof MembershipType]
                      ? 'border-primary bg-primary/10 glow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={membershipType[key as keyof MembershipType]}
                    onCheckedChange={(checked) =>
                      setMembershipType({ ...membershipType, [key]: checked })
                    }
                    className="sr-only"
                  />
                  <Icon className={`w-8 h-8 mb-2 ${
                    membershipType[key as keyof MembershipType] ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className="font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">{price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Membership Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Membership Period
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Select Period *</Label>
                <Select
                  value={formData.membershipPeriod}
                  onValueChange={(value) => setFormData({ ...formData, membershipPeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.membershipPeriod === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customMonths">Number of Months</Label>
                  <Input
                    id="customMonths"
                    type="number"
                    min="1"
                    placeholder="Enter months"
                    value={formData.customMonths}
                    onChange={(e) => setFormData({ ...formData, customMonths: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              
              {endDate && (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <div className="h-11 flex items-center px-4 rounded-lg bg-secondary/50 border border-border">
                    <span className="text-primary font-medium">{new Date(endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
