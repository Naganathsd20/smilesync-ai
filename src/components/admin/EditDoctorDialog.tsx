import { useUpdateDoctor } from "@/hooks/use-doctors";
import { formatPhoneNumber, generateAvatar } from "@/lib/utils";
import { Doctor, Gender } from "@prisma/client";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { CameraIcon, UploadIcon, XIcon, Loader2Icon } from "lucide-react";

interface EditDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

function EditDoctorDialog({ doctor, isOpen, onClose }: EditDoctorDialogProps) {
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(doctor);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDoctorMutation = useUpdateDoctor();

  const handlePhoneChange = (value: string) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    if (editingDoctor) {
      setEditingDoctor({ ...editingDoctor, phone: formattedPhoneNumber });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsImageRemoved(false);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!editingDoctor) return;

    let finalImageUrl: string | undefined = undefined;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/upload/doctor-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error || "Failed to upload dentist profile image.",
          );
        }

        finalImageUrl = data.imageUrl;
      } catch (err: any) {
        toast.error(err.message || "Image upload failed.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (isImageRemoved) {
      finalImageUrl = generateAvatar(editingDoctor.name, editingDoctor.gender);
    }

    updateDoctorMutation.mutate(
      {
        ...editingDoctor,
        bio: editingDoctor.bio || undefined,
        ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl }),
      },
      {
        onSuccess: () => {
          toast.success(`Dr. ${editingDoctor.name} updated successfully!`);
          handleClose();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update doctor.");
        },
      },
    );
  };

  const handleClose = () => {
    onClose();
    setEditingDoctor(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(false);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentAvatarPreview =
    previewUrl ||
    (isImageRemoved
      ? generateAvatar(
          editingDoctor?.name || "Dentist",
          editingDoctor?.gender || "MALE",
        )
      : editingDoctor?.imageUrl ||
        generateAvatar(
          editingDoctor?.name || "Dentist",
          editingDoctor?.gender || "MALE",
        ));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Dentist</DialogTitle>
          <DialogDescription>
            Update dentist profile information and status.
          </DialogDescription>
        </DialogHeader>

        {editingDoctor && (
          <div className="grid gap-4 py-3">
            {/* PROFILE IMAGE EDIT SECTION */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-muted/20 border border-border/50">
              <div className="relative group shrink-0">
                <Image
                  src={currentAvatarPreview}
                  alt={editingDoctor.name}
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-full object-cover ring-2 ring-primary/30 shadow-md bg-muted"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change profile photo"
                >
                  <CameraIcon className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <Label className="text-xs font-semibold text-foreground">
                  Profile Image
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Replace photo or reset to default avatar.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs px-2.5 gap-1.5"
                    disabled={isUploading}
                  >
                    <UploadIcon className="w-3 h-3 text-primary" />
                    {selectedFile ? "Change Image" : "Upload Image"}
                  </Button>

                  {(selectedFile || !isImageRemoved) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="h-7 text-xs px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1"
                      disabled={isUploading}
                    >
                      <XIcon className="w-3 h-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingDoctor.name}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="speciality">Speciality</Label>
                <Input
                  id="speciality"
                  value={editingDoctor.speciality}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      speciality: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingDoctor.email}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editingDoctor.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Notes</Label>
              <Input
                id="bio"
                value={editingDoctor.bio || ""}
                onChange={(e) =>
                  setEditingDoctor({ ...editingDoctor, bio: e.target.value })
                }
                placeholder="Experienced dental surgeon providing care."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={editingDoctor.gender || ""}
                  onValueChange={(value) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      gender: value as Gender,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingDoctor.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      isActive: value === "active",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading || updateDoctorMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={isUploading || updateDoctorMutation.isPending}
          >
            {isUploading ? (
              <span className="flex items-center gap-1.5">
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                Uploading Image...
              </span>
            ) : updateDoctorMutation.isPending ? (
              "Saving..."
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditDoctorDialog;
