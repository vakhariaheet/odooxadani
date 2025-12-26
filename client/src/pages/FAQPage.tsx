import { useState } from 'react';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  Lightbulb,
  Settings,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FAQItem } from '@/types/landing';

export const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'general', label: 'General', icon: HelpCircle },
    { id: 'teams', label: 'Team Formation', icon: Users },
    { id: 'ideas', label: 'Idea Validation', icon: Lightbulb },
    { id: 'technical', label: 'Technical', icon: Settings },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'general',
      question: 'What is HackTeam and how does it work?',
      answer:
        'HackTeam is a platform that connects hackathon participants with compatible teammates and helps validate project ideas. Our AI-powered matching algorithm analyzes skills, experience levels, and project interests to form balanced teams. You can also submit ideas for community feedback before hackathons begin.',
    },
    {
      id: '2',
      category: 'general',
      question: 'Is HackTeam free to use?',
      answer:
        'Yes! HackTeam offers a free tier that includes basic team matching, idea submission, and community access. We also offer premium features for advanced analytics, priority matching, and exclusive hackathon opportunities.',
    },
    {
      id: '3',
      category: 'teams',
      question: 'How does the team matching algorithm work?',
      answer:
        'Our algorithm considers multiple factors: complementary technical skills, experience levels, communication preferences, timezone compatibility, and project interests. It creates a compatibility score and suggests the best matches. You can also manually browse and connect with other participants.',
    },
    {
      id: '4',
      category: 'teams',
      question: 'Can I form a team with my existing friends?',
      answer:
        'Absolutely! You can invite friends to join your team directly, or use our platform to find additional members to complete your team. Many users combine existing connections with new teammates found through our matching system.',
    },
    {
      id: '5',
      category: 'teams',
      question: "What if I don't get along with my matched teammates?",
      answer:
        'We have a feedback system and team adjustment features. If there are compatibility issues, you can provide feedback and request new matches. Our community guidelines ensure respectful interactions, and we have moderation in place.',
    },
    {
      id: '6',
      category: 'ideas',
      question: 'How does idea validation work?',
      answer:
        "Submit your hackathon idea with a description of the problem, solution, and target audience. The community votes and provides feedback on feasibility, market potential, and technical complexity. You'll also get insights from experienced judges and mentors.",
    },
    {
      id: '7',
      category: 'ideas',
      question: 'Will my idea be stolen if I share it publicly?',
      answer:
        "Ideas themselves aren't typically protectable, and execution matters more than the initial concept. However, you can choose to share ideas privately with potential teammates only, or use our anonymous feedback feature for sensitive concepts.",
    },
    {
      id: '8',
      category: 'ideas',
      question: "Can I work on someone else's idea?",
      answer:
        "Yes! Many successful teams form around great ideas from other participants. When you join someone's idea, you become a co-creator and contributor. Make sure to discuss roles, responsibilities, and any intellectual property considerations upfront.",
    },
    {
      id: '9',
      category: 'technical',
      question: 'What skill levels do you support?',
      answer:
        'We welcome everyone from complete beginners to senior engineers. Our matching algorithm balances experience levels to create learning opportunities. Beginners get paired with mentors, while experienced developers can lead teams or tackle complex challenges.',
    },
    {
      id: '10',
      category: 'technical',
      question: 'Which programming languages and technologies are supported?',
      answer:
        'We support all major programming languages, frameworks, and technologies. Our skill taxonomy includes web development, mobile apps, AI/ML, blockchain, IoT, game development, and more. You can specify your expertise level in each area.',
    },
    {
      id: '11',
      category: 'technical',
      question: 'Do you integrate with hackathon platforms like Devpost?',
      answer:
        'Yes! We integrate with major hackathon platforms and organizers. You can import your hackathon registrations, sync project submissions, and showcase your achievements. This helps build your reputation and track your progress over time.',
    },
    {
      id: '12',
      category: 'general',
      question: 'How do I build my reputation on the platform?',
      answer:
        'Complete your profile, participate in hackathons, provide helpful feedback on ideas, and maintain good team collaboration ratings. Successful project completions, wins, and positive teammate reviews all contribute to your reputation score.',
    },
    {
      id: '13',
      category: 'teams',
      question: 'What happens if a team member drops out?',
      answer:
        'Our platform can help you find replacement team members quickly. We maintain a pool of available participants and can suggest matches based on your existing team composition and project needs. Emergency matching is available during hackathons.',
    },
    {
      id: '14',
      category: 'general',
      question: 'Can I use HackTeam for virtual hackathons?',
      answer:
        'Absolutely! We support both in-person and virtual hackathons. For virtual events, we provide additional collaboration tools, timezone coordination features, and communication preferences to ensure smooth remote teamwork.',
    },
    {
      id: '15',
      category: 'technical',
      question: 'Is my data secure and private?',
      answer:
        'Yes, we take privacy seriously. We use industry-standard encryption, secure authentication, and follow GDPR compliance. You control what information is visible to other users, and we never share personal data with third parties without consent.',
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              Frequently Asked Questions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Got Questions? We Have Answers</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Find quick answers to common questions about team formation, idea validation, and
              using our platform effectively.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    No questions found matching your search.
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <Card key={faq.id} className="overflow-hidden">
                      <button className="w-full text-left" onClick={() => toggleExpanded(faq.id)}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {categories.find((c) => c.id === faq.category)?.label}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-left">{faq.question}</h3>
                            </div>
                            <div className="ml-4">
                              {expandedItems.has(faq.id) ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {expandedItems.has(faq.id) && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </CardContent>
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/contact">
                  Contact Support
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">15+</div>
                <div className="text-sm text-muted-foreground">FAQ Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Self-Service Success</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Available Access</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
