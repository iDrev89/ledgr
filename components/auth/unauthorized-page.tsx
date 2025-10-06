// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
// import { usePermissions } from "@/hooks/use-permissions";

// export function UnauthorizedPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { userRole, isAdmin } = usePermissions();
//   const [errorMessage, setErrorMessage] = useState<string>("");

//   useEffect(() => {
//     const error = searchParams.get('error');
//     if (error === 'unauthorized') {
//       setErrorMessage("You don't have permission to access that page.");
//     }
//   }, [searchParams]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-2">
//             <ShieldAlert className="h-12 w-12 text-destructive" />
//           </div>
//           <CardTitle className="text-2xl">Access Denied</CardTitle>
//           <CardDescription>
//             You don't have permission to access this resource
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {errorMessage && (
//             <Alert variant="destructive">
//               <ShieldAlert className="h-4 w-4" />
//               <AlertDescription>{errorMessage}</AlertDescription>
//             </Alert>
//           )}
          
//           <div className="text-center text-sm text-muted-foreground">
//             <p>Your current role: <span className="font-medium">{userRole || 'none'}</span></p>
//           </div>

//           <div className="flex flex-col space-y-2">
//             <Button onClick={() => router.back()} variant="outline">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Go Back
//             </Button>
//             <Button onClick={() => router.push('/dashboard')}>
//               <Home className="h-4 w-4 mr-2" />
//               Return to Dashboard
//             </Button>
//           </div>

//           {!isAdmin() && (
//             <Alert>
//               <AlertDescription className="text-sm">
//                 If you need access to this resource, please contact your administrator.
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


