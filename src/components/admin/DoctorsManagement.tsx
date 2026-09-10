"use client";

import { useDeleteDoctor, useGetDoctors, useToggleDoctorStatus } from "@/hooks/use-doctors";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  EditIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  StethoscopeIcon,
  Trash2Icon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Badge } from "../ui/badge";
import AddDoctorDialog from "./AddDoctorDialog";
import EditDoctorDialog from "./EditDoctorDialog";
import { Doctor } from "@prisma/client";
import { Input } from "../ui/input";
import { toast } from "sonner";

interface DoctorWithCount extends Doctor {
  appointmentCount?: number;
}

function DoctorsManagement() {
  const { data: doctors = [], isLoading } = useGetDoctors();
  const toggleStatusMutation = useToggleDoctorStatus();
  const deleteDoctorMutation = useDeleteDoctor();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedDoctor(null);
  };

  const handleToggleStatus = (doctor: DoctorWithCount) => {
    const newStatus = !doctor.isActive;
    toggleStatusMutation.mutate(
      { doctorId: doctor.id, isActive: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Dr. ${doctor.name} is now ${newStatus ? "Active" : "Inactive"}.`
          );
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update doctor status.");
        },
      }
    );
  };

  const handleDeleteDoctor = (doctor: DoctorWithCount) => {
    const confirmMessage = doctor.appointmentCount && doctor.appointmentCount > 0
      ? `Dr. ${doctor.name} has ${doctor.appointmentCount} appointment(s). Deleting will safely deactivate them to preserve appointment history. Continue?`
      : `Are you sure you want to delete Dr. ${doctor.name}?`;

    if (!window.confirm(confirmMessage)) return;

    deleteDoctorMutation.mutate(doctor.id, {
      onSuccess: (res: any) => {
        if (res?.deactivated) {
          toast.info(res.message);
        } else {
          toast.success(res?.message || `Dr. ${doctor.name} deleted successfully.`);
        }
      },
      onError: (err: any) => {
        toast.error(err?.message || "Failed to delete doctor.");
      },
    });
  };

  const filteredDoctors = (doctors as DoctorWithCount[]).filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "ACTIVE") return matchesSearch && doc.isActive;
    if (statusFilter === "INACTIVE") return matchesSearch && !doc.isActive;
    return matchesSearch;
  });

  return (
    <>
      <Card className="mb-12 border-border/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <StethoscopeIcon className="size-5 text-primary" />
              Manage Dentists
            </CardTitle>
            <CardDescription className="mt-1">
              Add, update, and deactivate dental professionals available for patient appointments.
            </CardDescription>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/100 shrink-0"
          >
            <PlusIcon className="mr-2 size-4" />
            Add Dentist
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dentist by name, email, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setStatusFilter("ALL")}
              >
                All ({doctors.length})
              </Button>
              <Button
                variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setStatusFilter("ACTIVE")}
              >
                Active ({doctors.filter((d) => d.isActive).length})
              </Button>
              <Button
                variant={statusFilter === "INACTIVE" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs px-3"
                onClick={() => setStatusFilter("INACTIVE")}
              >
                Inactive ({doctors.filter((d) => !d.isActive).length})
              </Button>
            </div>
          </div>

          {/* DENTISTS LIST */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-muted/5">
              <StethoscopeIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No Dentists Found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "ALL"
                  ? "No dentists match your current search or filter."
                  : "Add your first dental professional to make them available for booking."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-colors gap-4 ${
                    doctor.isActive
                      ? "bg-card border-border/50 hover:border-primary/30"
                      : "bg-muted/20 border-border/40 opacity-75"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      width={52}
                      height={52}
                      className="w-13 h-13 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-base text-foreground">
                          {doctor.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium border-primary/30 text-primary"
                        >
                          {doctor.speciality}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {doctor.gender === "MALE" ? "Male" : "Female"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MailIcon className="h-3 w-3" />
                          {doctor.email}
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            {doctor.phone}
                          </div>
                        )}
                      </div>

                      {doctor.bio && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-1">
                          {doctor.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                    <div className="text-left md:text-center shrink-0">
                      <div className="font-bold text-sm text-primary">
                        {doctor.appointmentCount ?? 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Appointments</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {doctor.isActive ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold text-[11px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">
                          Inactive
                        </Badge>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => handleToggleStatus(doctor)}
                        disabled={toggleStatusMutation.isPending}
                        title={doctor.isActive ? "Deactivate dentist" : "Activate dentist"}
                      >
                        {doctor.isActive ? (
                          <>
                            <UserXIcon className="size-3.5 mr-1 text-amber-500" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheckIcon className="size-3.5 mr-1 text-emerald-500" />
                            Activate
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => handleEditDoctor(doctor)}
                      >
                        <EditIcon className="size-3.5 mr-1" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-500/20"
                        onClick={() => handleDeleteDoctor(doctor)}
                        disabled={deleteDoctorMutation.isPending}
                        title="Delete dentist"
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddDoctorDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} />

      <EditDoctorDialog
        key={selectedDoctor?.id}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        doctor={selectedDoctor}
      />
    </>
  );
}

export default DoctorsManagement;