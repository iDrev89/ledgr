"use client"
import {
  Activity,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Package,
  Calculator,
} from "lucide-react";
import { MetricCard } from "@/components/overview/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/shared/PageHeader";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        pageTitle="Business Dashboard"
        pageDes="Monitor your business performance and key financial metrics."
      />

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Today's Revenue"
          value="$2,450"
          change={12}
          changeType="increase"
          icon={DollarSign}
          description="Sales revenue today"
          trend="up"
        />
        <MetricCard
          title="Sales Count"
          value={28}
          change={8}
          changeType="increase"
          icon={ShoppingCart}
          description="Transactions today"
          trend="up"
        />
        <MetricCard
          title="Daily Expenses"
          value="$645"
          change={-5}
          changeType="decrease"
          icon={TrendingDown}
          description="Operating costs today"
          trend="down"
        />
        <MetricCard
          title="Net Profit"
          value="$1,805"
          change={15}
          changeType="increase"
          icon={TrendingUp}
          description="Profit today"
          trend="up"
        />
      </div>

      {/* Business Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$47,850</div>
            <p className="text-xs text-muted-foreground">
              Total revenue this month
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <span className="text-sm font-medium">+18.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span className="text-sm font-medium">34.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              Products in stock
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Low Stock</span>
                <span className="text-sm font-medium text-orange-600">12 items</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">3 items</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Top Seller</span>
                <span className="text-sm font-medium">Ana García</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Commission Due</span>
                <span className="text-sm font-medium">$890</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">New Sale</div>
                <div className="text-sm text-muted-foreground">Register sale</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="p-2 bg-red-500/10 rounded-full">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="font-medium">Record Expense</div>
                <div className="text-sm text-muted-foreground">Add business cost</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="p-2 bg-green-500/10 rounded-full">
                <Package className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="font-medium">Check Inventory</div>
                <div className="text-sm text-muted-foreground">View stock levels</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Calculator className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">Payroll</div>
                <div className="text-sm text-muted-foreground">Manage payments</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-green-500/10 rounded-full">
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Sale completed</div>
                <div className="text-xs text-muted-foreground">Ana García sold 3 units - $450</div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-500/10 rounded-full">
                <Package className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Inventory updated</div>
                <div className="text-xs text-muted-foreground">Product A restocked - 50 units added</div>
                <div className="text-xs text-muted-foreground">15 minutes ago</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1 bg-red-500/10 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Expense recorded</div>
                <div className="text-xs text-muted-foreground">Office supplies - $125</div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1 bg-purple-500/10 rounded-full">
                <Calculator className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Payroll processed</div>
                <div className="text-xs text-muted-foreground">Weekly commissions calculated</div>
                <div className="text-xs text-muted-foreground">3 hours ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}