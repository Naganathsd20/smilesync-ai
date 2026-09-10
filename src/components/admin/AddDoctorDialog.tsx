import { useCreateDoctor } from "@/hooks/use-doctors";
import { Gender } from "@prisma/client";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { formatPhoneNumber, generateAvatar } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { CameraIcon, UploadIcon, XIcon, Loader2Icon } from "lucide-react";

interface AddDoctorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddDoctorDialog({ isOpen, onClose }: AddDoctorDialogProps) {
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    speciality: "",
    gender: "MALE" as Gender,
    isActive: true,
    bio: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createDoctorMutation = useCreateDoctor();

  const handlePhoneChange = (value: string) => {
    const formattedPhoneNumber = formatPhoneNumber(value);
    setNewDoctor({ ...newDoctor, phone: formattedPhoneNumber });
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
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    let uploadedImageUrl: string | undefined = undefined;

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
          throw new Error(data.error || "Failed to upload dentist profile image.");
        }

        uploadedImageUrl = data.imageUrl;
      } catch (err: any) {
        toast.error(err.message || "Image upload failed.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    createDoctorMutation.mutate(
      {
        ...newDoctor,
        imageUrl: uploadedImageUrl,
      },
      {
        onSuccess: () => {
          toast.success(`Dr. ${newDoctor.name} added successfully!`);
          handleClose();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to add doctor.");
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    setNewDoctor({
      name: "",
      email: "",
      phone: "",
      speciality: "",
      gender: "MALE",
      isActive: true,
      bio: "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentAvatarPreview =
    previewUrl || generateAvatar(newDoctor.name || "Dentist", newDoctor.gender || "MALE");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Dentist</DialogTitle>
          <DialogDescription>
            Add a new dental professional to your hospital or clinic staff.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          {/* PROFILE IMAGE UPLOAD SECTION */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-muted/20 border border-border/50">
            <div className="relative group shrink-0">
              <Image
                src={currentAvatarPreview}
                alt="Profile Preview"
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
              <Label className="text-xs font-semibold text-foreground">Profile Image</Label>
              <p className="text-[11px] text-muted-foreground">
                Upload a professional photo (JPG, PNG, WebP up to 5MB).
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

                {selectedFile && (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name *</Label>
              <Input
                id="new-name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                placeholder="Dr. Rajesh Kumar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-speciality">Speciality *</Label>
              <Input
                id="new-speciality"
                value={newDoctor.speciality}
                onChange={(e) => setNewDoctor({ ...newDoctor, speciality: e.target.value })}
                placeholder="Orthodontist"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-email">Email *</Label>
            <Input
              id="new-email"
              type="email"
              value={newDoctor.email}
              onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
              placeholder="rajesh@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-phone">Phone</Label>
            <Input
              id="new-phone"
              value={newDoctor.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-bio">Bio / Notes</Label>
            <Input
              id="new-bio"
              value={newDoctor.bio}
              onChange={(e) => setNewDoctor({ ...newDoctor, bio: e.target.value })}
              placeholder="Experienced dental surgeon providing care."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-gender">Gender</Label>
              <Select
                value={newDoctor.gender || ""}
                onValueChange={(value) => setNewDoctor({ ...newDoctor, gender: value as Gender })}
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
              <Label htmlFor="new-status">Status</Label>
              <Select
                value={newDoctor.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setNewDoctor({ ...newDoctor, isActive: value === "active" })
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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading || createDoctorMutation.isPending}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={
              !newDoctor.name ||
              !newDoctor.email ||
              !newDoctor.speciality ||
              isUploading ||
              createDoctorMutation.isPending
            }
          >
            {isUploading ? (
              <span className="flex items-center gap-1.5">
                <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                Uploading Image...
              </span>
            ) : createDoctorMutation.isPending ? (
              "Adding..."
            ) : (
              "Add Dentist"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddDoctorDialog;