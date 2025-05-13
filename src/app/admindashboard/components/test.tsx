// "use client";

// import { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import { MoreHorizontal, Search, UserPlus } from "lucide-react";
// import RewardDialog from "./reward-dialog";
// import { trpc } from "@/app/_trpc/client";
// import { useQueryClient } from "@tanstack/react-query";

// type User = {
//   id: string;
//   email: string;
//   createdAt: string;
//   paymentMethod: string;
//   isAdmin: boolean;
//   isSuspended: boolean;
//   hasAcceptedTerms: boolean;
//   stripeSubscriptionId?: string;
// };

// export default function UserTable() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
//   const [rewardUser, setRewardUser] = useState<User | null>(null);
//   const { mutateAsync: sendRewardMutation } = trpc.sendReward.useMutation();
//   const queryClient = useQueryClient();

//   const { mutateAsync: grantRewardMutation } = trpc.grantReward.useMutation();
//   const { mutateAsync: revokeRewardMutation } = trpc.revokeReward.useMutation();

//   useEffect(() => {
//     // Simulate fetching users
//     setTimeout(() => {
//       setUsers([
//         {
//           id: "1",
//           email: "john@example.com",
//           createdAt: "2023-01-15T00:00:00Z",
//           paymentMethod: "Stripe",
//           isAdmin: true,
//           isSuspended: false,
//           hasAcceptedTerms: true,
//           stripeSubscriptionId: "sub_123",
//         },
//         {
//           id: "2",
//           email: "jane@example.com",
//           createdAt: "2023-02-20T00:00:00Z",
//           paymentMethod: "eSewa",
//           isAdmin: false,
//           isSuspended: false,
//           hasAcceptedTerms: true,
//         },
//         {
//           id: "3",
//           email: "bob@example.com",
//           createdAt: "2023-03-10T00:00:00Z",
//           paymentMethod: "Stripe",
//           isAdmin: false,
//           isSuspended: true,
//           hasAcceptedTerms: false,
//         },
//       ]);
//       setLoading(false);
//     }, 1000);

//     // In a real application, you would fetch data from your API:
//     // const fetchUsers = async () => {
//     //   try {
//     //     const response = await fetch('/api/admin/users')
//     //     const data = await response.json()
//     //     setUsers(data)
//     //   } catch (error) {
//     //     console.error('Failed to fetch users:', error)
//     //   } finally {
//     //     setLoading(false)
//     //   }
//     // }
//     //
//     // fetchUsers()
//   }, []);

//   const filteredUsers = users.filter((user) =>
//     user.email.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString();
//   };

//   const handleReward = (user: User) => {
//     setRewardUser(user);
//     setIsRewardDialogOpen(true);
//   };

//   const handleRewardSubmit = async (data: {
//     title: string;
//     description: string;
//     endDate: Date;
//   }) => {
//     if (!rewardUser) return;

//     try {
//       await grantRewardMutation({
//         userId: rewardUser.id,
//         ...data,
//       });
//       // Refetch user data to update UI
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//     } catch (error) {
//       console.error("Failed to grant reward:", error);
//       throw error;
//     }
//   };

//   const handleRevokeReward = async (userId: string) => {
//     try {
//       await revokeRewardMutation({ userId });
//       // Refetch user data to update UI
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//     } catch (error) {
//       console.error("Failed to revoke reward:", error);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between">
//         <div className="relative w-64">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search users..."
//             className="pl-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//         <Button>
//           <UserPlus className="mr-2 h-4 w-4" />
//           Add User
//         </Button>
//       </div>

//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Email</TableHead>
//               <TableHead>Joined</TableHead>
//               <TableHead>Payment</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Terms</TableHead>
//               <TableHead className="w-[80px]"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center py-8">
//                   Loading users...
//                 </TableCell>
//               </TableRow>
//             ) : filteredUsers.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center py-8">
//                   No users found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredUsers.map((user) => (
//                 <TableRow key={user.id}>
//                   <TableCell className="font-medium">{user.email}</TableCell>
//                   <TableCell>{formatDate(user.createdAt)}</TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={
//                         user.paymentMethod === "Stripe"
//                           ? "default"
//                           : "secondary"
//                       }
//                     >
//                       {user.paymentMethod}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     {user.isAdmin ? (
//                       <Badge className="bg-blue-500">Admin</Badge>
//                     ) : user.isSuspended ? (
//                       <Badge variant="destructive">Suspended</Badge>
//                     ) : (
//                       <Badge variant="outline">Active</Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {user.hasAcceptedTerms ? (
//                       <Badge
//                         variant="outline"
//                         className="bg-green-50 text-green-700 border-green-200"
//                       >
//                         Accepted
//                       </Badge>
//                     ) : (
//                       <Badge
//                         variant="outline"
//                         className="bg-amber-50 text-amber-700 border-amber-200"
//                       >
//                         Pending
//                       </Badge>
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex gap-2">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon">
//                             <MoreHorizontal className="h-4 w-4" />
//                             <span className="sr-only">Open menu</span>
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                           <DropdownMenuSeparator />
//                           <DropdownMenuItem>View details</DropdownMenuItem>
//                           <DropdownMenuItem>Edit user</DropdownMenuItem>
//                           <DropdownMenuSeparator />
//                           {user.isSuspended ? (
//                             <DropdownMenuItem>Unsuspend user</DropdownMenuItem>
//                           ) : (
//                             <DropdownMenuItem className="text-amber-600">
//                               Suspend user
//                             </DropdownMenuItem>
//                           )}
//                           <DropdownMenuItem className="text-red-600">
//                             Delete user
//                           </DropdownMenuItem>
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                       {user.stripeSubscriptionId ? (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleRevokeReward(user.id)}
//                         >
//                           Revoke Reward
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleReward(user)}
//                         >
//                           Grant Reward
//                         </Button>
//                       )}
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//       {/* Reward Dialog */}
//       {rewardUser && (
//         <RewardDialog
//           open={isRewardDialogOpen}
//           onOpenChange={setIsRewardDialogOpen}
//           userId={rewardUser.id}
//           userEmail={rewardUser.email}
//           onSubmit={handleRewardSubmit}
//         />
//       )}
//     </div>
//   );
// }
