import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Mail, Clock, MessageCircle, CheckCircle2 } from "lucide-react";
import { ticketsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  department: z.string().min(1, "Please select a department"),
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200, "Subject is too long"),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(2000, "Message is too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    department: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // If user is authenticated, create a support ticket
      if (isAuthenticated && user?.userid) {
        await ticketsApi.open(
          user.userid,
          formData.department,
          formData.subject,
          formData.message,
          "Medium"
        );
        toast({
          title: "Ticket Created",
          description: "We've received your message and will respond shortly.",
        });
      } else {
        // For non-authenticated users, redirect to WHMCS contact
        const ticketUrl = `${WHMCS_CONFIG.billingUrl}/submitticket.php?step=2&deptid=${formData.department}&subject=${encodeURIComponent(formData.subject)}`;
        window.open(ticketUrl, "_blank", "noopener,noreferrer");
        toast({
          title: "Redirecting to Support Portal",
          description: "Please complete your ticket submission in the new window.",
        });
      }

      setIsSuccess(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Message Sent!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for contacting us. We'll get back to you as soon as possible.
            </p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: Info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Get in Touch
              </h1>
              <p className="text-muted-foreground mb-8">
                Have a question or need assistance? We're here to help. Fill out the form and our team will respond promptly.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@vintechdev.store</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Response Time</h3>
                    <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Existing Customer?</h3>
                    <p className="text-sm text-muted-foreground">
                      <a 
                        href={`${WHMCS_CONFIG.billingUrl}/clientarea.php`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Login to your account
                      </a>
                      {" "}for faster support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className={errors.name ? "border-destructive" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleChange("department", value)}
                      >
                        <SelectTrigger className={errors.department ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(WHMCS_CONFIG.departments).map(([key, dept]) => (
                            <SelectItem key={key} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-destructive">{errors.department}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className={errors.subject ? "border-destructive" : ""}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your question or issue in detail..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        className={errors.message ? "border-destructive" : ""}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
