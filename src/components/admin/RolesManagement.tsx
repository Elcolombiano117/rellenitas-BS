import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Shield, UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
}

const AVAILABLE_ROLES = ['admin', 'user', 'moderator'];

export const RolesManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithRoles();
  }, []);

  const fetchUsersWithRoles = async () => {
    try {
      setLoading(true);
      
      // Obtener todos los perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .order("email");

      if (profilesError) throw profilesError;

      // Obtener todos los roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combinar datos
      const usersWithRoles: UserWithRoles[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || "Sin email",
        full_name: profile.full_name,
        roles: userRoles?.filter(ur => ur.user_id === profile.id).map(ur => ur.role) || []
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: "Rol asignado",
        description: `Rol ${role} asignado correctamente`,
      });

      fetchUsersWithRoles();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el rol",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast({
        title: "Rol removido",
        description: `Rol ${role} removido correctamente`,
      });

      fetchUsersWithRoles();
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "No se pudo remover el rol",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-poppins font-bold">Gestión de Roles</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios y Roles del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Vista móvil */}
          <div className="block lg:hidden space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4 border border-border">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-foreground">{user.full_name || "Sin nombre"}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Roles actuales:</div>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <div key={role} className="flex items-center gap-1">
                            <Badge variant={getRoleBadgeVariant(role)}>
                              {role}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveRole(user.id, role)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin roles</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Asignar rol:</div>
                    <div className="flex gap-2">
                      <Select onValueChange={(role) => handleAddRole(user.id, role)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ROLES.filter(r => !user.roles.includes(r)).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Vista escritorio */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "Sin nombre"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <div key={role} className="flex items-center gap-1">
                              <Badge variant={getRoleBadgeVariant(role)}>
                                {role}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleRemoveRole(user.id, role)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select onValueChange={(role) => handleAddRole(user.id, role)}>
                        <SelectTrigger className="w-[180px] ml-auto">
                          <SelectValue placeholder="Asignar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ROLES.filter(r => !user.roles.includes(r)).map((role) => (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                {role}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay usuarios registrados
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
