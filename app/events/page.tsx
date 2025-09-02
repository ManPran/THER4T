import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, Users, ArrowRight, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/Navigation"

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Join the Movement
            </Badge>
            <h1 className="font-serif font-bold text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
              Events & <span className="text-primary">Community Action</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow Texans at rallies, town halls, and organizing meetings. Together, we're stronger.
            </p>
          </div>
        </div>
      </section>

      {/* County & City Meetings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif font-bold text-3xl text-foreground mb-4">County & City Government Meetings</h2>
              <p className="text-muted-foreground text-lg">
                Attend these critical government meetings to make your voice heard on local issues.
              </p>
            </div>

            <div className="space-y-8">
              {/* Austin / Travis County */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-primary text-primary-foreground">Austin / Travis County</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">Travis County Commissioners Court</CardTitle>
                      <CardDescription className="text-base">
                        Voting sessions and special meetings for Travis County government.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>August 7, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>9:00 AM (Regular Session)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>August 14, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Special Meeting (Dallas County)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>August 19, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Confirmed Agenda Published (Documenters.org)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>August 26, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>10:00 AM (Confirmed via Legistar)</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Regular Court Dates:</strong> September 9, October 16, October 30, November 13, December 11, December 18, 2025
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Joint Committee:</strong> Last held June 16, 2025. No additional 2025 meetings currently scheduled.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plano (Collin County) */}
              <Card className="border-l-4 border-l-secondary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-secondary text-secondary-foreground">Plano (Collin County)</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">Plano City Council & Commissions</CardTitle>
                      <CardDescription className="text-base">
                        Regular meetings and special sessions for Plano city government.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 11, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>5:00 PM (City Council Meeting)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 25, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>7:00 PM (Regular Meeting)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 17-23, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Planning & Zoning Commission (4:00-5:00 PM)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 20, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Board & Commission Reception</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Upcoming Regular Sessions:</strong> September 8 and September 22, 2025 (following second and fourth Monday pattern)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Harris County */}
              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-accent text-accent-foreground">Harris County (Houston)</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">Harris County Commissioners Court</CardTitle>
                      <CardDescription className="text-base">
                        Regular and special sessions for Harris County government.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>August 7, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>10:00 AM (Regular Session)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>August 14, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>10:00 AM (Special Meeting)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>August 26, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>10:00 AM (Confirmed Future Meeting)</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Ongoing Schedule:</strong> Likely bi-weekly Thursday sessions beyond August (exact dates not yet listed)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dallas County */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-primary text-primary-foreground">Dallas County</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">Dallas County Commissioners Court</CardTitle>
                      <CardDescription className="text-base">
                        First & Third Tuesdays of each month at 9:00 AM.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>August 19, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>9:00 AM (Regular Meeting)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>September 2, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>9:00 AM (Regular Meeting)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>September 16, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>9:00 AM (Regular Meeting)</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Additional Likely Dates:</strong> October 7, October 21, November 4, November 18, December 2, December 16, 2025
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Galveston County */}
              <Card className="border-l-4 border-l-secondary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-secondary text-secondary-foreground">Galveston County</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">Commissioners' Court Special Meetings</CardTitle>
                      <CardDescription className="text-base">
                        Special court meetings scheduled for August 2025.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 4, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>9:30 AM</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 15, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>1:30 PM</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 18, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>9:30 AM</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span>August 29, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>3:30 PM @ 174 Calder Rd., League City (Room 100)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Williamson County */}
              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-accent text-accent-foreground">Williamson County</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">County Commissioners' Court</CardTitle>
                      <CardDescription className="text-base">
                        Public sessions and budget hearings for Williamson County.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>August 26, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Public Session</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>September 3, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Public Hearing on 2025-2026 Budget</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>September 9, 2025</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Regular Meeting - Tax Abatement Discussion</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smith County */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-3 bg-primary text-primary-foreground">Smith County (Tyler Region)</Badge>
                      <CardTitle className="font-serif text-2xl mb-2">Commissioners' Court</CardTitle>
                      <CardDescription className="text-base">
                        Regular meetings with public attendance welcome.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Meets Tuesdays at 9:30 AM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Specific dates not listed - check county agenda page</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <strong>Note:</strong> Agendas are posted in advance and open to public attendance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Civic Engagement Tips */}
            <div className="mt-12">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-serif">Next Steps for Effective Civic Engagement</CardTitle>
                  <CardDescription>
                    Make the most of these government meetings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Before Attending:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Check agendas before attending to align participation with relevant items</li>
                        <li>• Many agendas require sign-up 72 hours in advance</li>
                        <li>• Register as a speaker if you want to address the body</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Access Options:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Attend in person or online (most meetings allow both)</li>
                        <li>• View livestreams or recordings if remote access needed</li>
                        <li>• Target based on legislative interest in your area</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Event Calendar */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif font-bold text-3xl text-foreground mb-4">Event Calendar</h2>
              <p className="text-muted-foreground text-lg">
                Stay up to date with all upcoming events and important dates.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">March 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={`text-center p-2 text-sm hover:bg-muted rounded-lg cursor-pointer ${
                        [15, 18, 20, 22, 23].includes(day)
                          ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/20 border border-primary/40 rounded"></div>
                    <span className="text-muted-foreground">Event Day</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-bold text-3xl mb-4">Can't Find an Event Near You?</h2>
            <p className="text-xl mb-8 opacity-90">
              Start your own! We'll provide you with the tools and support to organize in your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="font-semibold text-lg px-8">
                Organize an Event
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-semibold text-lg px-8 bg-transparent"
              >
                Get Organizing Kit
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
