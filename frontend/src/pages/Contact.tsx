import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle,
  Building,
  Globe,
  Users,
  Heart
} from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { contactService, ContactFormData } from '../services/contactService';
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const { addInteraction } = useUserInteractionStore();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  React.useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/contact', name: 'Contact' }
    });
  }, [addInteraction]);

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'hello@ecommerce.com',
      description: 'We\'ll respond within 24 hours',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri 9AM-6PM EST',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      value: '123 Commerce St, City, State 12345',
      description: 'Come say hello at our office',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Monday - Friday',
      description: '9:00 AM - 6:00 PM EST',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    }
  ];

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by logging into your account and visiting the "My Orders" section, or by using the tracking number sent to your email.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be in their original condition with all tags attached. Some items may have different return policies.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to over 25 countries worldwide. Shipping costs and delivery times vary by location. You can check shipping options during checkout.'
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach our customer support team via email, phone, or live chat. We typically respond within 24 hours and are available Monday through Friday.'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const contactFormData: ContactFormData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    try {
      const response = await contactService.submitForm(contactFormData);
      
      if (response.success) {
        // Track the interaction
        addInteraction({
          type: 'contact_form_submit',
          targetType: 'form',
          data: { 
            formType: 'contact',
            subject: formData.subject 
          }
        });
        
        setIsSubmitted(true);
        toast.success('Thank you for your message! We\'ll get back to you soon.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(response.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
      console.error('Error sending contact message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="text-green-500 mb-6">
              <CheckCircle className="w-20 h-20 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Message Sent!</h2>
            <p className="text-muted-foreground mb-8">
              Thank you for reaching out to us. We've received your message and will get back to you within 24 hours.
            </p>
            <div className="space-y-3">
              <Button onClick={handleReset} className="w-full">
                Send Another Message
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="w-full">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Get in Touch
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Contact Us
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have a question, feedback, or need assistance? We'd love to hear from you. 
            Our team is here to help and ensure you have the best shopping experience.
          </p>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className={`${info.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <info.icon className={`w-8 h-8 ${info.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{info.title}</h3>
                  <p className="text-foreground font-medium mb-1">{info.value}</p>
                  <p className="text-muted-foreground text-sm">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-2xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl font-bold">Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What is this about?"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry..."
                        className="w-full resize-none"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <div className="space-y-8">
              {/* Company Info */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Building className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-xl font-semibold text-foreground">About Our Company</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    We're a passionate team dedicated to providing the best online shopping experience. 
                    Our mission is to connect you with quality products and exceptional service.
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>Global reach, local service</span>
                  </div>
                </CardContent>
              </Card>

              {/* Team Info */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Users className="w-8 h-8 text-primary mr-3" />
                    <h3 className="text-xl font-semibold text-foreground">Our Team</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Our customer support team consists of experienced professionals who are here to help 
                    you with any questions or concerns you may have.
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Heart className="w-4 h-4 mr-2" />
                    <span>Customer satisfaction is our priority</span>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-b-0">
                      <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Find Us</h2>
            <p className="text-muted-foreground">
              Visit our office or explore our location
            </p>
          </div>
          
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-96 bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Map integration coming soon</p>
                <p className="text-xs mt-2">123 Commerce St, City, State 12345</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-8">
                Can't find what you're looking for? Our support team is here to help you 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary text-primary-foreground px-8 py-3 text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="px-8 py-3 text-lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
