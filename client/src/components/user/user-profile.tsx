import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, UpdateUserProfile } from "@shared/schema";
import { 
  Save, 
  Upload, 
  User as UserIcon, 
  Building, 
  Mail, 
  IdCard,
  Edit,
  X
} from "lucide-react";

interface UserProfileProps {
  onClose?: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfile>({
    fullName: "",
    licenseNumber: "",
    email: "",
    companyName: "",
    companyLogo: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Initialize form data when user data is loaded
  React.useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        fullName: user.fullName || "",
        licenseNumber: user.licenseNumber || "",
        email: user.email || "",
        companyName: user.companyName || "",
        companyLogo: user.companyLogo || ""
      });
    }
  }, [user, isEditing]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile) => {
      const response = await fetch(`/api/user/profile`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
      toast({
        title: "Perfil Atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  const handleInputChange = (field: keyof UpdateUserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleInputChange("companyLogo", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        licenseNumber: user.licenseNumber || "",
        email: user.email || "",
        companyName: user.companyName || "",
        companyLogo: user.companyLogo || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando perfil...</div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">Erro ao carregar perfil do usuário</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-primary" />
            Perfil do Usuário
          </CardTitle>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
            )}
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                data-testid="button-close-profile"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Logo */}
          <div className="text-center">
            {(formData.companyLogo || user.companyLogo) ? (
              <div className="w-24 h-24 mx-auto mb-4 rounded-lg border border-border overflow-hidden bg-muted">
                <img 
                  src={formData.companyLogo || user.companyLogo || ""} 
                  alt="Logo da Empresa"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto mb-4 rounded-lg border border-border flex items-center justify-center bg-muted">
                <Building className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="logo-upload"
                  data-testid="input-logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-1" />
                      Alterar Logo
                    </span>
                  </Button>
                </Label>
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    value={formData.fullName || ""}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Nome completo"
                    data-testid="input-full-name"
                  />
                ) : (
                  <div className="p-2 text-sm bg-muted rounded-md">{user.fullName}</div>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    data-testid="input-email"
                  />
                ) : (
                  <div className="p-2 text-sm bg-muted rounded-md flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    {user.email}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="licenseNumber">Número da Licença</Label>
                {isEditing ? (
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber || ""}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="Ex: IL-FSE-12345"
                    data-testid="input-license-number"
                  />
                ) : (
                  <div className="p-2 text-sm bg-muted rounded-md flex items-center">
                    <IdCard className="w-4 h-4 mr-2 text-muted-foreground" />
                    {user.licenseNumber || "Não informado"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                {isEditing ? (
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Nome da sua empresa"
                    data-testid="input-company-name"
                  />
                ) : (
                  <div className="p-2 text-sm bg-muted rounded-md flex items-center">
                    <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                    {user.companyName || "Não informado"}
                  </div>
                )}
              </div>

              <div>
                <Label>Role</Label>
                <div className="p-2">
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              </div>

              <div>
                <Label>Username</Label>
                <div className="p-2 text-sm bg-muted rounded-md">@{user.username}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel-edit"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                <Save className="w-4 h-4 mr-1" />
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}