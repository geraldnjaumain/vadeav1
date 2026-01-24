"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { LoadingDots } from "@/components/ui/loading-dots";
import { TableSkeleton } from "@/components/ui/skeleton";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation"; // Keeping for redirect state
import { Search, MoreHorizontal, Trash2, Mail, Shield, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserManagementPage() {
    const currentUser = useQuery(api.users.currentUser);
    // Only run query if we have a user and they are admin
    const shouldFetchUsers = currentUser !== undefined && currentUser?.role === "admin";

    const users = useQuery(api.users.getAllUsers,
        shouldFetchUsers ? {} : "skip"
    );
    const deleteUser = useMutation(api.users.deleteUser);
    const [editingUser, setEditingUser] = useState<any>(null); // User object for editing
    const updateUser = useMutation(api.users.adminUpdateUser);
    const generateLink = useMutation(api.users.generateImpersonationLink);
    const { signIn, signOut } = useAuthActions();

    const [search, setSearch] = useState("");
    const [linkingUser, setLinkingUser] = useState<any>(null); // Student being linked

    // Redirect if not admin (e.g. while impersonating)
    if (currentUser !== undefined && currentUser?.role !== "admin") {
        if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
        }
        return <LoadingAnimation message="Redirecting..." />;
    }
    const [parentSearch, setParentSearch] = useState("");
    const [selectedParent, setSelectedParent] = useState<any>(null);
    const linkChild = useMutation(api.users.adminLinkChildToParent);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleImpersonate = async () => {
        if (!editingUser) return;
        if (!confirm(`Log in as ${editingUser.name}? You will need to logout to return to admin.`)) return;

        try {
            // @ts-ignore
            const token = await generateLink({ userId: editingUser._id });

            // Set flag for TopBar to show "Exit View"
            if (typeof window !== "undefined") {
                localStorage.setItem("isImpersonating", "true");
            }

            await signOut();
            await signIn("admin", { impersonationToken: token });
            // Force reload to clear client cache
            window.location.href = "/dashboard";
        } catch (error) {
            console.error(error);
            toast.error("Impersonation failed");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            await updateUser({
                id: editingUser._id,
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                permissions: editingUser.permissions,
                isSuspended: editingUser.isSuspended,
            });
            toast.success("User updated successfully");
            setEditingUser(null);
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setDeletingId(id);
        try {
            // @ts-ignore
            await deleteUser({ id });
            toast.success("User deleted successfully");
        } catch (error) {
            toast.error("Failed to delete user");
        } finally {
            setDeletingId(null);
        }
    };

    const handleLinkParent = async () => {
        if (!linkingUser || !selectedParent) return;

        try {
            await linkChild({
                studentId: linkingUser._id,
                parentId: selectedParent._id
            });
            toast.success(`Linked ${linkingUser.name} to ${selectedParent.name}`);
            setLinkingUser(null);
            setSelectedParent(null);
            setParentSearch("");
        } catch (error) {
            toast.error("Failed to link parent");
        }
    };

    if (users === undefined) return <div className="space-y-6"><TableSkeleton rows={10} cols={5} /></div>;

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase())
    );

    // Filter potential parents
    const potentialParents = users.filter(u =>
        u.role === "parent" &&
        (u.name?.toLowerCase().includes(parentSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(parentSearch.toLowerCase()))
    ).slice(0, 5); // Limit to 5 results

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ... Existing UI ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Management</h1>
                    <p className="text-zinc-500">Manage {users.length} registered users</p>
                </div>
                <div className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead className="w-[300px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                    No users found matching "{search}"
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers?.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                    {user.name?.[0]?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-900">{user.name || "Unknown"}</span>
                                                <span className="text-xs text-zinc-500 md:hidden">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                            user.role === "admin" ? "bg-purple-100 text-purple-800" :
                                                user.role === "teacher" ? "bg-blue-100 text-blue-800" :
                                                    user.role === "parent" ? "bg-green-100 text-green-800" :
                                                        "bg-zinc-100 text-zinc-800"
                                        )}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-600 hidden md:table-cell">{user.email}</TableCell>
                                    <TableCell>
                                        {user.isSuspended ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                <span className="text-xs font-semibold text-red-600">Suspended</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-zinc-600">Active</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {user.role === "student" && (
                                                    <DropdownMenuItem
                                                        onClick={() => setLinkingUser(user)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Link to Parent
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem asChild>
                                                    <a href={`/admin/users/${user._id}`} className="cursor-pointer flex items-center">
                                                        <Search className="mr-2 h-4 w-4" />
                                                        View Profile
                                                    </a>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                                                    onClick={() => handleDelete(user._id)}
                                                    disabled={deletingId === user._id || user.role === "admin"}
                                                >
                                                    {deletingId === user._id ? (
                                                        <LoadingDots size="w-1 h-1" className="mr-2" />
                                                    ) : (
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    )}
                                                    Delete User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setEditingUser(user)}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Link Parent Dialog */}
            <Dialog open={!!linkingUser} onOpenChange={(open) => !open && setLinkingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Link Parent to {linkingUser?.name}</DialogTitle>
                        <DialogDescription>
                            Search for a parent to link this student account to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Search Parent</Label>
                            <Input
                                placeholder="Search by name or email..."
                                value={parentSearch}
                                onChange={(e) => setParentSearch(e.target.value)}
                            />
                        </div>
                        {parentSearch && (
                            <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                                {potentialParents?.length === 0 ? (
                                    <div className="p-3 text-sm text-zinc-500">No parents found</div>
                                ) : (
                                    potentialParents?.map(p => (
                                        <div
                                            key={p._id}
                                            className={cn(
                                                "p-3 text-sm cursor-pointer hover:bg-zinc-50 flex justify-between items-center",
                                                selectedParent?._id === p._id && "bg-blue-50 border-l-4 border-blue-500"
                                            )}
                                            onClick={() => setSelectedParent(p)}
                                        >
                                            <div>
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-zinc-500 text-xs">{p.email}</div>
                                            </div>
                                            {selectedParent?._id === p._id && (
                                                <div className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setLinkingUser(null)}>Cancel</Button>
                            <Button onClick={handleLinkParent} disabled={!selectedParent}>Link Parent</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                {/* ... Existing Edit Dialog Content ... */}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to {editingUser?.name || "User"}'s profile.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editingUser?.name || ""}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                value={editingUser?.email || ""}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <Input
                                id="edit-role"
                                value={editingUser?.role || ""}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            />
                            <p className="text-xs text-zinc-500">Supported: student, parent, teacher, admin</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Special Permissions</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {["manage_complaints", "manage_cohorts", "create_forums", "access_finance"].map(perm => (
                                    <div key={perm} className="flex items-center space-x-2 bg-zinc-50 p-2 rounded-md border border-zinc-100">
                                        <input
                                            type="checkbox"
                                            id={`perm-${perm}`}
                                            checked={editingUser?.permissions?.includes(perm) || false}
                                            onChange={(e) => {
                                                const currentPerms = editingUser?.permissions || [];
                                                if (e.target.checked) {
                                                    setEditingUser({ ...editingUser, permissions: [...currentPerms, perm] });
                                                } else {
                                                    setEditingUser({ ...editingUser, permissions: currentPerms.filter((p: string) => p !== perm) });
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`perm-${perm}`} className="text-sm font-medium text-zinc-700 capitalize select-none cursor-pointer">
                                            {perm.replace("_", " ")}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-100">
                            <Label className="text-red-700">Account Status</Label>
                            <div className="flex items-center gap-2 p-3 border border-red-100 bg-red-50 rounded-md">
                                <input
                                    type="checkbox"
                                    id="suspend-user"
                                    className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                                    checked={editingUser?.isSuspended || false}
                                    onChange={(e) => setEditingUser({ ...editingUser, isSuspended: e.target.checked })}
                                />
                                <label htmlFor="suspend-user" className="text-sm font-medium text-red-900 cursor-pointer">
                                    Suspend Account (Block Logins)
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-between">
                            <Button type="button" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={handleImpersonate}>
                                <Shield className="mr-2 h-4 w-4" />
                                Login As User
                            </Button>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
