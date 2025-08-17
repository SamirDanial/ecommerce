import React from "react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { 
  Sparkles, 
  Award, 
  Users, 
  Globe, 
  Heart, 
  Star,
  ArrowRight,
  CheckCircle,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter
} from "lucide-react";

const About: React.FC = () => {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "/team/sarah.jpg",
      bio: "Visionary leader with 15+ years in fashion retail. Passionate about sustainable fashion and customer experience.",
      skills: ["Leadership", "Strategy", "Fashion Retail"],
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      image: "/team/michael.jpg",
      bio: "Award-winning designer who brings creativity and innovation to every collection. Expert in trend forecasting.",
      skills: ["Design", "Trends", "Innovation"],
      linkedin: "#",
      twitter: "#"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Operations",
      image: "/team/emily.jpg",
      bio: "Operations expert ensuring smooth delivery and exceptional customer service across all touchpoints.",
      skills: ["Operations", "Customer Service", "Logistics"],
      linkedin: "#",
      twitter: "#"
    }
  ];

  const achievements = [
    { number: "50K+", label: "Happy Customers", icon: Heart, color: "text-red-500" },
    { number: "100+", label: "Design Awards", icon: Award, color: "text-yellow-500" },
    { number: "25+", label: "Countries Served", icon: Globe, color: "text-blue-500" },
    { number: "4.9", label: "Customer Rating", icon: Star, color: "text-green-500" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make is centered around our customers' needs and satisfaction."
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "We never compromise on quality, ensuring every product meets our high standards."
    },
    {
      icon: Zap,
      title: "Innovation Driven",
      description: "Constantly pushing boundaries to bring you the latest trends and technologies."
    },
    {
      icon: Target,
      title: "Sustainability Focus",
      description: "Committed to eco-friendly practices and responsible fashion production."
    }
  ];

  const portfolioProjects = [
    {
      title: "Summer Collection 2024",
      category: "Fashion Design",
      image: "/portfolio/summer-collection.jpg",
      description: "A vibrant collection featuring sustainable materials and modern silhouettes.",
      technologies: ["Sustainable Fabrics", "Modern Design", "Eco-friendly"],
      link: "#"
    },
    {
      title: "E-commerce Platform",
      category: "Digital Experience",
      image: "/portfolio/ecommerce-platform.jpg",
      description: "Revolutionary online shopping experience with AI-powered recommendations.",
      technologies: ["React", "AI/ML", "UX Design"],
      link: "#"
    },
    {
      title: "Brand Identity",
      category: "Branding",
      image: "/portfolio/brand-identity.jpg",
      description: "Complete brand transformation including logo, packaging, and marketing materials.",
      technologies: ["Logo Design", "Packaging", "Marketing"],
      link: "#"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-1/2 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-8 right-8 animate-bounce">
          <Sparkles className="h-8 w-8 text-yellow-300" />
        </div>
        <div className="absolute bottom-8 left-8 animate-pulse">
          <Award className="h-6 w-6 text-pink-300" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              variant="secondary" 
              className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              <Star className="h-4 w-4 mr-2" />
              About Our Company
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Crafting Fashion Excellence
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're passionate about creating exceptional fashion experiences that inspire confidence and celebrate individuality. 
              Our journey is marked by innovation, quality, and unwavering commitment to our customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                Explore Our Story
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-black bg-white hover:bg-gray-100 hover:text-gray-900 font-semibold px-8 py-4 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300"
                onClick={() => {
                  document.getElementById('portfolio-section')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
              >
                View Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <achievement.icon className={`h-12 w-12 mx-auto mb-4 ${achievement.color}`} />
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {achievement.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Founded in 2018, we started with a simple mission: to create fashion that makes people feel confident and beautiful. 
              What began as a small boutique has grown into a beloved brand, serving customers worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Craftsmanship</h3>
                  <p className="text-gray-600">Every piece is carefully crafted using premium materials and attention to detail.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable Growth</h3>
                  <p className="text-gray-600">We've grown organically, always staying true to our values and customer relationships.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Focus</h3>
                  <p className="text-gray-600">Building lasting relationships with our customers and the fashion community.</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-blue-100 leading-relaxed">
                  To inspire confidence through exceptional fashion, while maintaining the highest standards of quality, 
                  sustainability, and customer service. We believe that everyone deserves to feel beautiful and confident.
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 rounded-2xl p-4">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from design to customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="bg-white rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio-section" className="py-20 bg-gradient-to-r from-gray-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Showcasing our best work and achievements across fashion, design, and digital innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioProjects.map((project, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="relative overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-sm opacity-80">Project Image</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      View Project
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-3 bg-blue-100 text-blue-800">
                    {project.category}
                  </Badge>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{project.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind our success, dedicated to bringing you the best fashion experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-sm opacity-80">Team Member</p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 mb-4 leading-relaxed">{member.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Let's Work Together
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Ready to start your fashion journey? Get in touch with us and let's create something amazing together.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                <p className="text-blue-100">hello@fashionbrand.com</p>
              </div>
              
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                <p className="text-blue-100">+1 (555) 123-4567</p>
              </div>
              
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
                <p className="text-blue-100">123 Fashion Street, NY 10001</p>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Get In Touch
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
