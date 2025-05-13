"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { trpc } from "@/app/_trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import { CustomInput } from "./custom-input";
import { Checkbox } from "@/components/ui/checkbox";
import debounce from "lodash/debounce";
import { PDFManager } from "./pdf-manager";
import RewardDialog from "./reward-dialog";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: string | null;
  isSuspend: boolean;
  esewaCurrentPeriodEnd: string | null;
}

type SortField = "name" | "email";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "active" | "suspended";
type TypeFilter = "all" | "subscribed" | "normal";

const USERS_PER_PAGE = 5;

export default function UserTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [rewardUser, setRewardUser] = useState<User | null>(null);
  const [userToRevoke, setUserToRevoke] = useState<User | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const { mutateAsync: grantRewardMutation } = trpc.grantReward.useMutation();
  const { mutateAsync: revokeRewardMutation } = trpc.revokeReward.useMutation();

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Filtering state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const {
    data: paginatedUsers,
    isLoading,
    isError,
    refetch,
  } = trpc.getPaginatedUsers.useQuery({
    page: currentPage,
    limit: USERS_PER_PAGE,
    searchTerm: debouncedSearchTerm,
  });

  // Removed the unused isPending state variable 
  // and using isLoading from the query instead

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activate" | "suspend" | "delete" | null
  >(null);
  const { mutateAsync: suspendUserMutation } = trpc.suspendUser.useMutation();
  const { mutateAsync: unsuspendUserMutation } =
    trpc.unSuspendUser.useMutation();
  const { mutateAsync: deleteUser } = trpc.deleteUser.useMutation();
  const { mutateAsync: editUserMutation } = trpc.editUser.useMutation();

  // Fixed the useCallback dependency warning
  const getUserType = useCallback((user: User) => {
    if (user.stripeSubscriptionId && user.stripeCurrentPeriodEnd) {
      const currentPeriodEnd = new Date(user.stripeCurrentPeriodEnd);
      if (currentPeriodEnd > new Date()) {
        return "Subscribed";
      }
    } else if (user.esewaCurrentPeriodEnd) {
      const currentPeriodEnd = new Date(user.esewaCurrentPeriodEnd);
      if (currentPeriodEnd > new Date()) {
        return "Subscribed";
      }
    }
    return "Normal";
  }, []);

  // Apply sorting and filtering to users - use useMemo to prevent recalculation on every render
  const filteredAndSortedUsers = useMemo(() => {
    if (!paginatedUsers?.users) return [];

    return [...paginatedUsers.users]
      .filter((user) => {
        // Apply status filter
        if (statusFilter === "active" && user.isSuspend) return false;
        if (statusFilter === "suspended" && !user.isSuspend) return false;

        // Apply type filter
        const userType = getUserType(user);
        if (typeFilter === "subscribed" && userType !== "Subscribed")
          return false;
        if (typeFilter === "normal" && userType !== "Normal") return false;

        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        if (sortField === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortField === "email") {
          return sortOrder === "asc"
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        }
        return 0;
      });
  }, [
    paginatedUsers?.users,
    statusFilter,
    typeFilter,
    sortField,
    sortOrder,
    getUserType,
  ]);

  // Handle select all checkbox separately to avoid infinite loop
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(filteredAndSortedUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  useEffect(() => {
    if (paginatedUsers) {
      setTotalPages(Math.ceil(paginatedUsers.total / USERS_PER_PAGE));
    }
  }, [paginatedUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Debounce search term
  const debouncedSearch = useCallback((term: string) => {
    const debouncedFn = debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300);
    debouncedFn(term);
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewName(user.name);
    setIsEditDialogOpen(true);
  };

  const handleSuspend = (user: User) => {
    setSelectedUser(user);
    setIsSuspendDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (editingUser) {
      try {
        setIsSaving(true);
        await editUserMutation({
          id: editingUser.id,
          name: newName,
        });
        setIsEditDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Failed to update user:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const confirmSuspend = async () => {
    if (selectedUser) {
      try {
        setIsSaving(true);
        if (selectedUser.isSuspend) {
          await unsuspendUserMutation({ id: selectedUser.id });
        } else {
          await suspendUserMutation({ id: selectedUser.id });
        }
        setIsSuspendDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Error suspending user:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        setIsSaving(true);
        await deleteUser({
          id: selectedUser.id,
        });
        setIsDeleteDialogOpen(false);
        refetch();
      } catch (error) {
        console.error("Failed to Delete user:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBulkAction = (action: "activate" | "suspend" | "delete") => {
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  // Add a new state for bulk reward dialog
  const [isBulkRewardDialogOpen, setIsBulkRewardDialogOpen] = useState(false);
  const [bulkRewardAction, setBulkRewardAction] = useState<
    "grant" | "revoke" | null
  >(null);
  const [bulkRewardData, setBulkRewardData] = useState<{
    title: string;
    description: string;
    endDate: Date;
  }>({
    title: "",
    description: "",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
  });

  // Add these refs and state for the calendar toggle
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Add this function to toggle the calendar visibility
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  // Add this effect to handle clicking outside the calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // Add these functions after the existing handleBulkAction function
  const handleBulkReward = (action: "grant" | "revoke") => {
    setBulkRewardAction(action);
    setIsBulkRewardDialogOpen(true);
  };

  const confirmBulkAction = async () => {
    setIsSaving(true);
    try {
      switch (bulkAction) {
        case "activate":
          await Promise.all(
            selectedUsers.map((id) => unsuspendUserMutation({ id }))
          );
          break;
        case "suspend":
          await Promise.all(
            selectedUsers.map((id) => suspendUserMutation({ id }))
          );
          break;
        case "delete":
          await Promise.all(selectedUsers.map((id) => deleteUser({ id })));
          break;
      }
      setIsBulkActionDialogOpen(false);
      setSelectedUsers([]);
      setSelectAll(false);
      refetch();
    } catch (error) {
      console.error(`Failed to perform bulk ${bulkAction} action:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmBulkReward = async () => {
    setIsSaving(true);
    try {
      if (bulkRewardAction === "grant") {
        await Promise.all(
          selectedUsers.map((id) =>
            grantRewardMutation({
              userId: id,
              title: bulkRewardData.title,
              description: bulkRewardData.description,
              endDate: bulkRewardData.endDate.toISOString(),
            })
          )
        );
        toast.success(`Rewards granted to ${selectedUsers.length} users`);
      } else if (bulkRewardAction === "revoke") {
        await Promise.all(
          selectedUsers.map((id) => revokeRewardMutation({ userId: id }))
        );
        toast.success(`Rewards revoked from ${selectedUsers.length} users`);
      }
      setIsBulkRewardDialogOpen(false);
      setSelectedUsers([]);
      setSelectAll(false);
      refetch();
    } catch (error) {
      console.error(
        `Failed to perform bulk ${bulkRewardAction} action:`,
        error
      );
      toast.error(`Failed to ${bulkRewardAction} rewards`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReward = (user: User) => {
    setRewardUser(user);
    setIsRewardDialogOpen(true);
  };

  const handleRewardSubmit = async (data: {
    title: string;
    description: string;
    endDate: Date;
  }) => {
    if (!rewardUser) return;
    try {
      await grantRewardMutation({
        userId: rewardUser.id,
        title: data.title,
        description: data.description,
        endDate: data.endDate.toISOString(),
      });

      refetch();
      toast.success("Reward Granted successfully");
    } catch (error) {
      console.error("Failed to grant reward:", error);
      throw error;
    }
  };

  const handleRevokeReward = async (user: User) => {
    setUserToRevoke(user);
  };

  const confirmRevokeReward = async () => {
    if (!userToRevoke) return;
    
    try {
      setIsRevoking(true);
      await revokeRewardMutation({ userId: userToRevoke.id });
      refetch();
      toast.success("Reward revoked successfully");
      setUserToRevoke(null);
    } catch (error) {
      console.error("Failed to revoke reward:", error);
      toast.error("Failed to revoke reward");
    } finally {
      setIsRevoking(false);
    }
  };

  // Toggle sort order or set new sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (isError) {
    return <div>Error loading users.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <CustomInput
              type="text"
              placeholder="Search by name, email, or status..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 pr-4 py-2 w-full text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Filters <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="font-semibold">
                Status
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => setStatusFilter("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "active"}
                onCheckedChange={() => setStatusFilter("active")}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "suspended"}
                onCheckedChange={() => setStatusFilter("suspended")}
              >
                Suspended
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="font-semibold">
                User Type
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === "all"}
                onCheckedChange={() => setTypeFilter("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === "subscribed"}
                onCheckedChange={() => setTypeFilter("subscribed")}
              >
                Subscribed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={typeFilter === "normal"}
                onCheckedChange={() => setTypeFilter("normal")}
              >
                Normal
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-x-2">
          <Button
            onClick={() => handleBulkAction("activate")}
            disabled={selectedUsers.length === 0}
          >
            Activate All
          </Button>
          <Button
            onClick={() => handleBulkAction("suspend")}
            disabled={selectedUsers.length === 0}
          >
            Suspend All
          </Button>
          <Button
            onClick={() => handleBulkReward("grant")}
            disabled={selectedUsers.length === 0}
            variant="outline"
          >
            Grant Rewards
          </Button>
          <Button
            onClick={() => handleBulkReward("revoke")}
            disabled={selectedUsers.length === 0}
            variant="outline"
          >
            Revoke Rewards
          </Button>
          <Button
            onClick={() => handleBulkAction("delete")}
            variant="destructive"
            disabled={selectedUsers.length === 0}
          >
            Delete All
          </Button>
        </div>
      </div>
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAllChange}
                />
              </TableHead>
              <TableHead className="w-[50px]">Id</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Name
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 ${
                      sortField === "name"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              </TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  Email
                  <ArrowUpDown
                    className={`ml-1 h-4 w-4 ${
                      sortField === "email"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(
                            selectedUsers.filter((id) => id !== user.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {(currentPage - 1) * USERS_PER_PAGE + index + 1}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isSuspend
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.isSuspend ? "Suspended" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getUserType(user) === "Subscribed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getUserType(user)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspend(user)}
                      >
                        {user.isSuspend ? "Activate" : "Suspend"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </Button>
                      <PDFManager
                        userId={user.id}
                        isPending={isLoading}
                        setIsPending={() => {}}
                      />
                      {getUserType(user) === "Subscribed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeReward(user)}
                        >
                          Revoke Reward
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReward(user)}
                        >
                          Grant Reward
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div>
          Showing{" "}
          {filteredAndSortedUsers.length > 0
            ? (currentPage - 1) * USERS_PER_PAGE + 1
            : 0}{" "}
          to{" "}
          {Math.min(
            currentPage * USERS_PER_PAGE,
            filteredAndSortedUsers.length
          )}{" "}
          of {paginatedUsers?.total || 0} users
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isLoading}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = currentPage + i - Math.min(2, currentPage - 1);
            return pageNumber > 0 && pageNumber <= totalPages ? (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNumber)}
                disabled={isLoading}
              >
                {pageNumber}
              </Button>
            ) : null;
          }).filter(Boolean)}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isLoading}
          >
            Last
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user&apos;s information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {selectedUser?.isSuspend ? "activate" : "suspend"} this user?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSuspendDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isSuspend ? "default" : "destructive"}
              onClick={confirmSuspend}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {selectedUser?.isSuspend ? "Activate" : "Suspend"} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog
        open={isBulkActionDialogOpen}
        onOpenChange={setIsBulkActionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} the selected users? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={bulkAction === "delete" ? "destructive" : "default"}
              onClick={confirmBulkAction}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm {bulkAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Reward Dialog */}
      <Dialog
        open={isBulkRewardDialogOpen}
        onOpenChange={setIsBulkRewardDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkRewardAction === "grant"
                ? "Grant Rewards"
                : "Revoke Rewards"}
            </DialogTitle>
            <DialogDescription>
              {bulkRewardAction === "grant"
                ? `You are about to grant rewards to ${selectedUsers.length} users.`
                : `You are about to revoke rewards from ${selectedUsers.length} users.`}
            </DialogDescription>
          </DialogHeader>

          {bulkRewardAction === "grant" && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Reward Title</Label>
                <Input
                  id="title"
                  value={bulkRewardData.title}
                  onChange={(e) =>
                    setBulkRewardData({
                      ...bulkRewardData,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Monthly Subscription Reward"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={bulkRewardData.description}
                  onChange={(e) =>
                    setBulkRewardData({
                      ...bulkRewardData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe the reward..."
                />
              </div>
              <div className="grid gap-2 relative">
                <Label>Valid Until</Label>
                <Button
                  type="button"
                  ref={buttonRef}
                  variant="outline"
                  onClick={toggleCalendar}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !bulkRewardData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bulkRewardData.endDate ? (
                    format(bulkRewardData.endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>

                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute top-full left-0 z-50 bg-white border rounded-md shadow-lg mt-1"
                  >
                    <Calendar
                      mode="single"
                      selected={bulkRewardData.endDate}
                      onSelect={(date) => {
                        if (date) {
                          setBulkRewardData({
                            ...bulkRewardData,
                            endDate: date,
                          });
                        }
                        setShowCalendar(false);
                      }}
                      initialFocus
                      fromDate={new Date(new Date().setHours(0, 0, 0, 0))} // Set to start of today
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkRewardDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkReward}
              disabled={
                isSaving ||
                (bulkRewardAction === "grant" &&
                  (!bulkRewardData.title || !bulkRewardData.description))
              }
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm {bulkRewardAction === "grant" ? "Grant" : "Revoke"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Revoke Reward Confirmation Dialog */}
      <Dialog open={!!userToRevoke} onOpenChange={() => setUserToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the reward from {userToRevoke?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToRevoke(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRevokeReward}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Revoke Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {rewardUser && (
        <RewardDialog
          open={isRewardDialogOpen}
          onOpenChange={(open) => {
            setIsRewardDialogOpen(open);
            if (!open) {
              setRewardUser(null);
            }
          }}
          userId={rewardUser.id}
          userEmail={rewardUser.email}
          onSubmit={handleRewardSubmit}
          isSubscribed={Boolean(rewardUser.stripeCurrentPeriodEnd)}
        />
      )}
    </div>
  );
}