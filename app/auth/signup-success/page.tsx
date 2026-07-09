import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Heart } from "lucide-react"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-accent flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Arogya Path</h1>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-secondary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Account Created Successfully!</CardTitle>
            <CardDescription>Welcome to the Arogya Path healthcare management system</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your account has been created and you can now access the healthcare management dashboard. Please check
              your email to confirm your account for full access to all features.
            </p>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">Sign In to Dashboard</Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
