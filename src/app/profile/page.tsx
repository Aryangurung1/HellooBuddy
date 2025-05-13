"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export default function ProfilePage() {
  const { user } = useKindeBrowserClient();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { data: currentUser, refetch: refetchCurrentUser } = trpc.getCurrentUser.useQuery();
  const { data: kindeUser, refetch: refetchKindeUser } = trpc.getCurrentUserFromKinde.useQuery();

  // Initialize name when Kinde user data is available
  useEffect(() => {
    if (kindeUser) {
      const fullName = `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim();
      setNewName(fullName);
    }
  }, [kindeUser]);
  
  const { mutate: updateUserImage } = trpc.updateUserImage.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
      setIsUploading(false);
      setSelectedImage(null);
      // Refetch both user data to ensure UI is updated
      await Promise.all([refetchCurrentUser(), refetchKindeUser()]);
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile image",
        variant: "destructive",
      });
      setIsUploading(false);
      setSelectedImage(null);
    },
  });
  
  const { mutate: editUser } = trpc.editUser.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Name updated successfully",
      });
      setIsSaving(false);
      setIsEditing(false);
      // Refetch the Kinde user data to get the updated name
      await refetchKindeUser();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert image to base64 and upload
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      // Calculate total chunks
      const totalChunks = Math.ceil(base64String.length / CHUNK_SIZE);
      let uploadedChunks = 0;

      // Upload chunks sequentially
      for (let i = 0; i < totalChunks; i++) {
        const chunk = base64String.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const isLastChunk = i === totalChunks - 1;

        await updateUserImage({
          userId: user.id,
          imageChunk: chunk,
          chunkIndex: i,
          totalChunks,
          isLastChunk,
          fileName: file.name,
          fileType: file.type,
        });

        uploadedChunks++;
        setUploadProgress((uploadedChunks / totalChunks) * 100);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
      setSelectedImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newName.trim()) return;
    
    setIsSaving(true);
    
    // Split the full name into first and last name
    const nameParts = newName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    console.log(firstName, lastName);
    // Update name in Kinde through our tRPC mutation
    editUser({
      id: user.id,
      name: newName.trim(),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    // Reset name to original Kinde user data
    if (kindeUser?.given_name || kindeUser?.family_name) {
      const fullName = `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim();
      setNewName(fullName);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-semibold mb-8 text-center">My Profile</h1>
          
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
              {(selectedImage || currentUser?.image || kindeUser?.picture) ? (
                <Image
                  src={selectedImage || currentUser?.image || kindeUser?.picture || ''}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl text-gray-500">
                    {(kindeUser?.given_name?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  disabled={isUploading}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading... {Math.round(uploadProgress)}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Change Profile Picture
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={kindeUser?.email || user?.email || ""}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSaving}
                  />
                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !newName.trim() || newName === `${kindeUser?.given_name || ''} ${kindeUser?.family_name || ''}`.trim()}
                    >
                      {isSaving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Name
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <Input
                    type="text"
                    value={`${kindeUser?.given_name || ''} ${kindeUser?.family_name || ''}`.trim() || "No name set"}
                    disabled
                    className="bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-4"
                    onClick={() => {
                      setIsEditing(true);
                      setNewName(`${kindeUser?.given_name || ''} ${kindeUser?.family_name || ''}`.trim());
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 