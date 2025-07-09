"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Briefcase,
  Building,
} from "lucide-react";
import Image from "next/image";

export function LoginPage() {
  const {
    signIn,
    createUser,
    hasUsers,
    allowNewUsers,
    isLoading: authLoading,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Create user form
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    position: "",
    department: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        toast.success("Login realizado com sucesso!");
        // Forçar redirecionamento para o dashboard
        window.location.href = "/";
      } else {
        toast.error(result.error || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro inesperado ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    // Validar senha
    if (newUser.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUser(newUser);

      if (result.success) {
        toast.success("Usuário criado com sucesso!");
        // Forçar redirecionamento para o dashboard
        window.location.href = "/";
      } else {
        toast.error(result.error || "Erro ao criar usuário");
      }
    } catch (error) {
      console.error("Create user error:", error);
      toast.error("Erro inesperado ao criar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFirstUser = () => {
    setNewUser({
      name: "Paloma",
      email: "paloma@novakgouveia.com",
      password: "123456",
      position: "Gerente",
      department: "Administrativo",
    });
    setShowCreateForm(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 flex items-center justify-center relative">
              <Image
                src="/logo.png"
                alt="Logo Novak & Gouveia"
                width={80}
                height={80}
                className="rounded-full border-2 border-green-400 bg-blue-700 object-cover"
                priority
              />
            </div>
          </div>
          <div className="flex justify-center items-center space-x-2 mb-2">
            <span className="text-3xl font-bold text-white">novak</span>
            <span className="text-3xl font-light text-green-400">gouveia</span>
          </div>
          <p className="text-blue-200 text-sm">Dashboard de Consultoria</p>
        </div>

        {/* Login/Create Form */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {showCreateForm ? "Criar Usuário" : "Fazer Login"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showCreateForm ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10"
                      placeholder="Sua senha"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            ) : (
              // Create User Form
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Nome Completo *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="text-white">
                    E-mail *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newEmail"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">
                    Senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 pr-10"
                      placeholder="Senha (min. 6 caracteres)"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-white">
                    Cargo
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="position"
                      type="text"
                      value={newUser.position}
                      onChange={(e) =>
                        setNewUser({ ...newUser, position: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                      placeholder="Cargo (opcional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-white">
                    Departamento
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="department"
                      type="text"
                      value={newUser.department}
                      onChange={(e) =>
                        setNewUser({ ...newUser, department: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
                      placeholder="Departamento (opcional)"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando..." : "Criar Usuário"}
                </Button>
              </form>
            )}

            {/* Switch between login/create */}
            <div className="space-y-2">
              <Separator className="bg-white/20" />

              {hasUsers === false && !showCreateForm && (
                <div className="text-center">
                  <p className="text-sm text-white mb-2">
                    Nenhum usuário encontrado. Crie o primeiro usuário.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-white border-white/20 bg-white/10 hover:bg-white/20"
                    onClick={handleCreateFirstUser}
                  >
                    Criar Primeiro Usuário (Paloma)
                  </Button>
                </div>
              )}

              {allowNewUsers === true && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                  >
                    {showCreateForm ? "Voltar ao Login" : "Criar Novo Usuário"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
