import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Shield, 
  Truck, 
  Users, 
  Award, 
  Globe, 
  ShoppingBag, 
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';

const About: React.FC = () => {
  const { addInteraction } = useUserInteractionStore();

  React.useEffect(() => {
    addInteraction({
      type: 'page_view',
      targetType: 'page',
      data: { path: '/about', name: 'About' }
    });
  }, [addInteraction]);

  const stats = [
    { label: 'Happy Customers', value: '50K+', icon: Heart, color: 'text-red-500' },
    { label: 'Products Sold', value: '1M+', icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Countries Served', value: '25+', icon: Globe, color: 'text-green-500' },
    { label: 'Years Experience', value: '8+', icon: Award, color: 'text-yellow-500' },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction.',
      color: 'text-red-500'
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description: 'Every product meets our rigorous quality standards, giving you peace of mind with every purchase.',
      color: 'text-blue-500'
    },
    {
      icon: Truck,
      title: 'Fast & Reliable',
      description: 'Swift delivery and reliable service that you can count on, every single time.',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Building a community of satisfied customers who trust and recommend our services.',
      color: 'text-purple-500'
    },
  ];

  const milestones = [
    {
      year: '2016',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize online shopping'
    },
    {
      year: '2018',
      title: 'First 10K Customers',
      description: 'Reached our first major milestone with growing customer base'
    },
    {
      year: '2020',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in 25+ countries'
    },
    {
      year: '2022',
      title: 'Mobile App Launch',
      description: 'Launched our award-winning mobile application'
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Integrated AI-powered recommendations and search'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Growing Since 2016
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Our Story
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We started with a simple mission: to make online shopping effortless, enjoyable, and trustworthy. 
            Today, we're proud to serve millions of customers worldwide with quality products and exceptional service.
          </p>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-background/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className={`${stat.color} mb-4 flex justify-center`}>
                    <stat.icon className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-foreground mb-8">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              To provide an unparalleled shopping experience that combines cutting-edge technology, 
              exceptional customer service, and a curated selection of high-quality products. 
              We believe everyone deserves access to great products at fair prices, delivered with care and speed.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-foreground mb-4">What We Do</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-primary mr-3" />
                    Curate the best products from trusted brands
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-primary mr-3" />
                    Provide seamless shopping experience
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-primary mr-3" />
                    Ensure fast and reliable delivery
                  </li>
                  <li className="flex items-center">
                    <Star className="w-5 h-5 text-primary mr-3" />
                    Offer exceptional customer support
                  </li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Our Promise</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-primary mr-3" />
                    Quality products at competitive prices
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-primary mr-3" />
                    Secure and protected transactions
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-primary mr-3" />
                    Transparent and honest communication
                  </li>
                  <li className="flex items-center">
                    <Zap className="w-5 h-5 text-primary mr-3" />
                    Continuous improvement and innovation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Our Core Values</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className={`${value.color} mb-4 flex justify-center`}>
                    <value.icon className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">Our Journey</h2>
          
          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start mb-12">
                <div className="flex-shrink-0 w-24 text-center">
                  <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-lg">{milestone.year}</span>
                  </div>
                </div>
                
                <div className="flex-1 ml-8">
                  <div className="bg-background p-6 rounded-lg shadow-lg border-l-4 border-primary">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Join Our Community</h2>
              <p className="text-muted-foreground mb-8">
                Be part of our growing family of satisfied customers. Experience the difference that quality, 
                service, and innovation can make in your shopping journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Start Shopping
                </button>
                <button className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
                  Learn More
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
