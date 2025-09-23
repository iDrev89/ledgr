import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileQuestion,
  Home,
  Truck,
  Package,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 ">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <Card className="relative w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileQuestion className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-muted-foreground/20 mb-2">
              404
            </div>
            <p className="text-sm text-muted-foreground">
              This might happen if you followed a broken link or typed the URL
              incorrectly.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/shipments">
                  <Truck className="mr-2 h-4 w-4" />
                  Shipments
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/orders">
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link href="/fleet">
                  <Users className="mr-2 h-4 w-4" />
                  Fleet
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              CargoMax Logistics Platform
            </p>
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link
                href="/help"
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
