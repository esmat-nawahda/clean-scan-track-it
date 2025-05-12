
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserPlus, Pencil, Trash2, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

// Define the user roles
type UserRole = 'admin' | 'manager' | 'viewer';

interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', lastLogin: '2023-06-10 14:30' },
    { id: 2, username: 'manager1', email: 'manager1@example.com', role: 'manager', lastLogin: '2023-06-09 11:20' },
    { id: 3, username: 'viewer1', email: 'viewer1@example.com', role: 'viewer', lastLogin: '2023-06-08 09:45' },
  ]);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'viewer' as UserRole,
    },
  });
  
  // Reset form when opening the add user sheet
  useEffect(() => {
    if (isAddUserOpen) {
      form.reset({
        username: '',
        email: '',
        password: '',
        role: 'viewer',
      });
    }
  }, [isAddUserOpen, form]);
  
  // Set form values when editing a user
  useEffect(() => {
    if (currentUser && isEditUserOpen) {
      form.reset({
        username: currentUser.username,
        email: currentUser.email,
        password: '',
        role: currentUser.role,
      });
    }
  }, [currentUser, isEditUserOpen, form]);
  
  const handleAddUser = (data: any) => {
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      username: data.username,
      email: data.email,
      role: data.role,
    };
    
    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    toast({
      title: "User added",
      description: `${data.username} has been added successfully.`,
    });
  };
  
  const handleEditUser = (data: any) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? 
      { ...user, username: data.username, email: data.email, role: data.role } : 
      user
    );
    
    setUsers(updatedUsers);
    setIsEditUserOpen(false);
    setCurrentUser(null);
    toast({
      title: "User updated",
      description: `${data.username} has been updated successfully.`,
    });
  };
  
  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    
    toast({
      title: "User deleted",
      description: `${userToDelete.username} has been removed.`,
      variant: "destructive",
    });
  };
  
  const openEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditUserOpen(true);
  };
  
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 border-red-200";
      case 'manager':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'viewer':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return "Full system access";
      case 'manager':
        return "Can manage staff and content";
      case 'viewer':
        return "View-only access";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Admin Users</h2>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </TableCell>
                <TableCell>{user.lastLogin || 'Never'}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditUser(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Add User Sheet */}
      <Sheet open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <SheetDescription>
              Create a new admin user with appropriate access levels
            </SheetDescription>
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getRoleDescription(field.value as UserRole)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">Add User</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      
      {/* Edit User Sheet */}
      <Sheet open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>
              Modify user details and permissions
            </SheetDescription>
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUser)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Leave blank to keep current" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to keep the current password
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getRoleDescription(field.value as UserRole)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">Save Changes</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserManager;
