import { Suspense } from "react"
import { Header } from "@/components/layout/header"
import { SearchFilters } from "@/components/home/search-filters"
import { UserDirectory } from "@/components/home/user-directory"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, Star, TrendingUp, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-green-400/10" />
        <div className="relative container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              🚀 Join thousands of learners worldwide
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent leading-tight">
              Discover & Exchange
              <br />
              <span className="text-foreground">Skills</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with talented individuals in your community. Share what you know, 
              learn what you need. Build meaningful relationships through skill swapping.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Users className="mr-2 h-5 w-5" />
                Start Exploring
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2 hover:bg-muted/50">
                <BookOpen className="mr-2 h-5 w-5" />
                How It Works
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
                <div className="text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
                <div className="text-muted-foreground">Skills Exchanged</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Skill Swap?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform makes skill exchange simple, secure, and rewarding
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Skills</h3>
                <p className="text-muted-foreground">
                  All skills are verified by the community to ensure quality and authenticity
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quick Matching</h3>
                <p className="text-muted-foreground">
                  Find the perfect skill exchange partner with our intelligent matching system
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-card/50 backdrop-blur hover:bg-card/70 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Build Community</h3>
                <p className="text-muted-foreground">
                  Connect with like-minded people and build lasting relationships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Match</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search for skills, filter by availability, and connect with talented individuals
            </p>
          </div>

          <SearchFilters />

          <Suspense fallback={
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          }>
            <UserDirectory />
          </Suspense>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-green-400/10">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join our community today and discover the power of skill exchange
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-green-400 hover:from-primary/90 hover:to-green-400/90 text-white px-8 py-3 text-lg">
                <Star className="mr-2 h-5 w-5" />
                Join Now
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
