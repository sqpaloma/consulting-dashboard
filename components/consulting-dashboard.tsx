"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Calendar,
  Settings,
  BarChart3,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  Upload,
  FileSpreadsheet,
  BookOpen,
  Save,
  History,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import * as XLSX from "xlsx"
import {
  saveDashboardData,
  loadDashboardData,
  getDashboardUploadHistory,
  clearAllDashboardData,
  getDashboardItemsByCategory,
  type DashboardData as DashboardDataType,
  type DashboardItem,
  type DashboardUpload,
} from "@/lib/dashboard-supabase"

interface DashboardData {
  totalItens: number
  aguardandoAprovacao: number
  analises: number
  orcamentos: number
  emExecucao: number
}

export function ConsultingDashboard() {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false)
  const [isWorkSession, setIsWorkSession] = useState(true) // true = trabalho, false = descanso
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Novos estados para dados da planilha
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalItens: 0,
    aguardandoAprovacao: 0,
    analises: 0,
    orcamentos: 0,
    emExecucao: 0,
  })
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Novos estados para modais
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any[]>([])
  const [processedItems, setProcessedItems] = useState<any[]>([])

  const [dashboardUploadHistory, setDashboardUploadHistory] = useState<DashboardUpload[]>([])
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [dashboardSaveStatus, setDashboardSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false)

  // Timer effects
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Sessão terminou
            setIsRunning(false)
            if (isWorkSession) {
              // Terminou trabalho, iniciar descanso
              setIsWorkSession(false)
              setSessions((prev) => prev + 1)
              return 5 * 60 // 5 minutos de descanso
            } else {
              // Terminou descanso, iniciar trabalho
              setIsWorkSession(true)
              return 25 * 60 // 25 minutos de trabalho
            }
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, isWorkSession])

  useEffect(() => {
    loadSavedDashboardData()
    loadDashboardUploadHistory()
  }, [])

  // Timer functions
  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsWorkSession(true)
    setTimeLeft(25 * 60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = isWorkSession ? 25 * 60 : 5 * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          alert("Planilha deve conter pelo menos uma linha de cabeçalho e uma linha de dados.")
          return
        }

        // Primeira linha são os cabeçalhos
        const headers = jsonData[0] as string[]

        // Encontra os índices das colunas importantes
        const statusIndex = headers.findIndex((header) => header && header.toLowerCase().includes("status"))
        const osIndex = headers.findIndex(
          (header) => header && (header.toLowerCase().includes("os") || header.toLowerCase().includes("ordem")),
        )

        if (statusIndex === -1) {
          alert("Coluna 'status' não encontrada na planilha.")
          return
        }

        // Processa os dados
        const processedData = {
          totalItens: 0,
          aguardandoAprovacao: 0,
          analises: 0,
          orcamentos: 0,
          emExecucao: 0,
          items: [] as any[],
        }

        // Processa cada linha de dados (pula o cabeçalho)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          if (!row || row.length === 0) continue

          const status = row[statusIndex]?.toString().toLowerCase().trim()
          const os = osIndex !== -1 ? row[osIndex]?.toString() : `OS-${i}`

          // Cria o item
          const item = {
            id: os,
            os: os,
            status: row[statusIndex]?.toString() || "Não definido",
            titulo: row[1] || `Item ${i}`, // Assume que a segunda coluna é o título
            cliente: row[2] || "Cliente não informado", // Assume que a terceira coluna é o cliente
            data: new Date().toLocaleDateString("pt-BR"),
            valor: row[3] ? `R$ ${Number.parseFloat(row[3]).toLocaleString("pt-BR")}` : "Valor não informado",
            rawData: row,
          }

          processedData.items.push(item)
          processedData.totalItens++

          // Categoriza baseado no status
          if (status.includes("aguardando") || status.includes("pendente") || status.includes("aprovação")) {
            processedData.aguardandoAprovacao++
          } else if (
            status.includes("análise") ||
            status.includes("analise") ||
            status.includes("revisão") ||
            status.includes("revisao")
          ) {
            processedData.analises++
          } else if (
            status.includes("orçamento") ||
            status.includes("orcamento") ||
            status.includes("cotação") ||
            status.includes("cotacao")
          ) {
            processedData.orcamentos++
          } else if (
            status.includes("execução") ||
            status.includes("execucao") ||
            status.includes("andamento") ||
            status.includes("progresso")
          ) {
            processedData.emExecucao++
          }
        }

        // Atualiza o estado
        setDashboardData({
          totalItens: processedData.totalItens,
          aguardandoAprovacao: processedData.aguardandoAprovacao,
          analises: processedData.analises,
          orcamentos: processedData.orcamentos,
          emExecucao: processedData.emExecucao,
        })

        // Armazena os itens processados para uso nos modais
        setProcessedItems(processedData.items)

        alert(`Planilha carregada com sucesso! ${processedData.totalItens} itens processados.`)
      } catch (error) {
        console.error("Erro ao processar planilha:", error)
        alert("Erro ao processar a planilha. Verifique se o arquivo está no formato correto (.xlsx ou .xls).")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)) // Janeiro 2025

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const calendarDays = []

  // Dias vazios no início
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const highlightedDays = [9, 12, 21, 25, 30]
  const today = 15

  const activities = [
    {
      time: "08:00",
      title: "Reunião de Equipe (Reunião Interna)",
      date: "19 Abril, 2025",
      duration: "08:30",
      participants: [
        { name: "João", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Sarah", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    {
      time: "10:00",
      title: "Revisão de Estratégia com Cliente",
      date: "19 Abril, 2025",
      duration: "10:30",
      participants: [
        { name: "Miguel", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Lisa", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
  ]

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]

  const loadSavedDashboardData = async () => {
    setIsDashboardLoading(true)
    try {
      const { dashboardData, items } = await loadDashboardData()
      if (dashboardData && items.length > 0) {
        setDashboardData({
          totalItens: dashboardData.total_itens,
          aguardandoAprovacao: dashboardData.aguardando_aprovacao,
          analises: dashboardData.analises,
          orcamentos: dashboardData.orcamentos,
          emExecucao: dashboardData.em_execucao,
        })
        setProcessedItems(
          items.map((item) => ({
            id: item.os,
            os: item.os,
            titulo: item.titulo || `Item ${item.os}`,
            cliente: item.cliente || "Cliente não informado",
            status: item.status,
            valor: item.valor || "Valor não informado",
            data: item.data_registro || new Date().toLocaleDateString("pt-BR"),
            rawData: item.raw_data,
          })),
        )
      }
    } catch (error) {
      console.error("Erro ao carregar dados salvos do dashboard:", error)
    } finally {
      setIsDashboardLoading(false)
    }
  }

  const loadDashboardUploadHistory = async () => {
    try {
      const history = await getDashboardUploadHistory()
      setDashboardUploadHistory(history)
    } catch (error) {
      console.error("Erro ao carregar histórico do dashboard:", error)
    }
  }

  const handleSaveDashboardData = async () => {
    if (processedItems.length === 0) {
      alert("Nenhum dado para salvar. Faça upload de uma planilha primeiro.")
      return
    }

    setDashboardSaveStatus("saving")
    try {
      const dashboardDataToSave: DashboardDataType = {
        total_itens: dashboardData.totalItens,
        aguardando_aprovacao: dashboardData.aguardandoAprovacao,
        analises: dashboardData.analises,
        orcamentos: dashboardData.orcamentos,
        em_execucao: dashboardData.emExecucao,
        devolucoes: 0,
        movimentacoes: 0,
      }

      const itemsToSave: DashboardItem[] = processedItems.map((item) => ({
        os: item.os,
        titulo: item.titulo,
        cliente: item.cliente,
        status: item.status,
        valor: item.valor,
        data_registro: item.data,
        raw_data: item.rawData,
      }))

      const result = await saveDashboardData(dashboardDataToSave, itemsToSave, fileName, "Paloma")

      if (result.success) {
        setDashboardSaveStatus("saved")
        await loadDashboardUploadHistory()
        setTimeout(() => setDashboardSaveStatus("idle"), 3000)
        alert("Dados do dashboard salvos com sucesso! Agora outras pessoas podem visualizar estes dados.")
      } else {
        setDashboardSaveStatus("error")
        setTimeout(() => setDashboardSaveStatus("idle"), 3000)
        alert("Erro ao salvar dados do dashboard. Tente novamente.")
      }
    } catch (error) {
      setDashboardSaveStatus("error")
      setTimeout(() => setDashboardSaveStatus("idle"), 3000)
      console.error("Erro ao salvar dados do dashboard:", error)
      alert("Erro ao salvar dados do dashboard. Tente novamente.")
    }
  }

  const handleClearDashboardData = async () => {
    if (confirm("Tem certeza que deseja limpar todos os dados do dashboard? Esta ação não pode ser desfeita.")) {
      setIsDashboardLoading(true)
      try {
        await clearAllDashboardData()
        setDashboardData({
          totalItens: 0,
          aguardandoAprovacao: 0,
          analises: 0,
          orcamentos: 0,
          emExecucao: 0,
        })
        setProcessedItems([])
        setFileName("")
        setDashboardUploadHistory([])
        alert("Dados do dashboard limpos com sucesso!")
      } catch (error) {
        alert("Erro ao limpar dados do dashboard.")
      } finally {
        setIsDashboardLoading(false)
      }
    }
  }

  const generateModalData = async (type: string) => {
    if (processedItems.length === 0) {
      // Dados de exemplo se não houver planilha carregada
      const baseItems = [
        {
          id: "OS-001",
          os: "OS-001",
          titulo: "Análise Estrutural Edifício A",
          cliente: "Construtora ABC",
          data: "15/01/2025",
          status: "Em andamento",
          valor: "R$ 15.000",
        },
      ]
      return baseItems.slice(0, Math.floor(Math.random() * 5) + 3)
    }

    // Tenta carregar dados específicos do banco
    try {
      const itemsFromDB = await getDashboardItemsByCategory(type)
      if (itemsFromDB.length > 0) {
        return itemsFromDB.map((item) => ({
          id: item.os,
          os: item.os,
          titulo: item.titulo || `Item ${item.os}`,
          cliente: item.cliente || "Cliente não informado",
          status: item.status,
          valor: item.valor || "Valor não informado",
          data: item.data_registro || new Date().toLocaleDateString("pt-BR"),
          rawData: item.raw_data,
        }))
      }
    } catch (error) {
      console.error("Erro ao carregar dados do modal:", error)
    }

    // Fallback para filtrar os itens locais
    let filteredItems = processedItems

    switch (type) {
      case "aprovacao":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase()
          return status.includes("aguardando") || status.includes("pendente") || status.includes("aprovação")
        })
        break
      case "analises":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase()
          return (
            status.includes("análise") ||
            status.includes("analise") ||
            status.includes("revisão") ||
            status.includes("revisao")
          )
        })
        break
      case "orcamentos":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase()
          return (
            status.includes("orçamento") ||
            status.includes("orcamento") ||
            status.includes("cotação") ||
            status.includes("cotacao")
          )
        })
        break
      case "execucao":
        filteredItems = processedItems.filter((item) => {
          const status = item.status.toLowerCase()
          return (
            status.includes("execução") ||
            status.includes("execucao") ||
            status.includes("andamento") ||
            status.includes("progresso")
          )
        })
        break
      default:
        filteredItems = processedItems
    }

    return filteredItems
  }

  const openModal = async (type: string) => {
    setActiveModal(type)
    const data = await generateModalData(type)
    setModalData(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-700 rounded-full border-2 border-green-400 flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">ng</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-white">novak</span>
                <span className="text-2xl font-light text-green-400">gouveia</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
              <Grid3X3 className="h-5 w-5" />
            </Button>
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/manual">
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <BookOpen className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Olá!</h1>
          <h2 className="text-3xl font-light text-gray-100">
            Bom dia, <span className="text-green-400">Paloma</span>
          </h2>
          <p className="text-gray-300">Vamos tornar hoje produtivo. Aqui está sua visão geral.</p>
        </div>

        {dashboardUploadHistory.length > 0 && (
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-800">Dados compartilhados disponíveis</p>
                    <p className="text-sm text-gray-600">
                      Último upload: {dashboardUploadHistory[0]?.file_name} por {dashboardUploadHistory[0]?.uploaded_by}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
                    className="bg-transparent"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Histórico
                  </Button>
                  {historyDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                      {dashboardUploadHistory.map((upload) => (
                        <div key={upload.id} className="p-3 border-b border-gray-100 last:border-b-0">
                          <div className="font-medium text-sm text-gray-800">{upload.file_name}</div>
                          <div className="text-xs text-gray-600">
                            {upload.uploaded_by} • {upload.total_records} registros
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(upload.upload_date || "").toLocaleString("pt-BR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Button */}
        <div className="flex justify-end">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Upload className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSaveDashboardData}
              disabled={processedItems.length === 0 || dashboardSaveStatus === "saving"}
              variant="outline"
              size="icon"
              className={`bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm ${
                dashboardSaveStatus === "saved"
                  ? "border-green-400 text-green-300"
                  : dashboardSaveStatus === "error"
                    ? "border-red-400 text-red-300"
                    : ""
              }`}
              title="Salvar & Compartilhar"
            >
              {dashboardSaveStatus === "saving" ? (
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
              ) : dashboardSaveStatus === "saved" ? (
                <CheckCircle className="h-4 w-4" />
              ) : dashboardSaveStatus === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={handleClearDashboardData}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              disabled={isDashboardLoading}
              title="Limpar Dados"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </Button>

            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            {fileName && (
              <div className="flex items-center space-x-1 text-white/80 text-sm">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{fileName.substring(0, 5)}...xls</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Metrics Cards - Todos em cima */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {/* Total Itens */}
            <Card
              onClick={() => openModal("total")}
              className="bg-white border-2 border-blue-300 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Total Itens</span>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-800">{dashboardData.totalItens}</div>
              </CardContent>
            </Card>

            {/* Aguardando Aprovação */}
            <Card
              onClick={() => openModal("aprovacao")}
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Aguardando Aprovação</span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.aguardandoAprovacao}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-500">
                    {dashboardData.totalItens > 0
                      ? Math.round((dashboardData.aguardandoAprovacao / dashboardData.totalItens) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-green-500">
                    {dashboardData.totalItens > 0
                      ? Math.round(
                          ((dashboardData.totalItens - dashboardData.aguardandoAprovacao) / dashboardData.totalItens) *
                            100,
                        )
                      : 100}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Análises */}
            <Card
              onClick={() => openModal("analises")}
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Análises</span>
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.analises}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-500">
                    {dashboardData.totalItens > 0
                      ? Math.round((dashboardData.analises / dashboardData.totalItens) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-green-500">
                    {dashboardData.totalItens > 0
                      ? Math.round(
                          ((dashboardData.totalItens - dashboardData.analises) / dashboardData.totalItens) * 100,
                        )
                      : 100}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Orçamentos */}
            <Card
              onClick={() => openModal("orcamentos")}
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Orçamentos</span>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.orcamentos}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-500">
                    {dashboardData.totalItens > 0
                      ? Math.round((dashboardData.orcamentos / dashboardData.totalItens) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-green-500">
                    {dashboardData.totalItens > 0
                      ? Math.round(
                          ((dashboardData.totalItens - dashboardData.orcamentos) / dashboardData.totalItens) * 100,
                        )
                      : 100}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Em Execução */}
            <Card
              onClick={() => openModal("execucao")}
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Em Execução</span>
                  <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{dashboardData.emExecucao}</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-500">
                    {dashboardData.totalItens > 0
                      ? Math.round((dashboardData.emExecucao / dashboardData.totalItens) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-green-500">
                    {dashboardData.totalItens > 0
                      ? Math.round(
                          ((dashboardData.totalItens - dashboardData.emExecucao) / dashboardData.totalItens) * 100,
                        )
                      : 100}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Devoluções */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Devoluções</span>
                  <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-500">0%</span>
                  <span className="text-green-500">100%</span>
                </div>
              </CardContent>
            </Card>

            {/* Movimentações */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Movimentações</span>
                  <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">0</div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-red-500">0%</span>
                  <span className="text-green-500">100%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segunda linha: Sessão de Trabalho e Próximos Agendamentos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Sprint */}
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800">
                    {isWorkSession ? "Sessão de Trabalho" : "Tempo de Descanso"}
                  </CardTitle>
                  <div className="text-sm text-gray-500">Sessões: {sessions}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={isWorkSession ? "#22c55e" : "#3b82f6"}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40 * (getProgress() / 100)} ${2 * Math.PI * 40}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-gray-800">{formatTime(timeLeft)}</div>
                      <div className="text-sm text-gray-500 text-center">
                        {isWorkSession ? "Foco no trabalho" : "Hora do descanso"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={toggleTimer}
                      className={`${
                        isWorkSession ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                      } text-white`}
                    >
                      {isRunning ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={resetTimer}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reiniciar
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Próximo:</div>
                    <div className="text-sm font-medium text-gray-700">
                      {isWorkSession ? "5 min de descanso" : "25 min de trabalho"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card className="bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-800">Próximos Agendamentos</CardTitle>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button variant="ghost" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium text-gray-700">Jan 2025</span>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                    <div key={day} className="p-2 text-gray-500 font-medium">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <div key={index} className="p-2">
                      {day && (
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                            day === today
                              ? "bg-green-500 text-white"
                              : highlightedDays.includes(day)
                                ? "bg-green-200 text-gray-800"
                                : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {day}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Terceira linha: Total de Projetos e Concluídos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total de Projetos</div>
                    <div className="text-2xl font-bold text-gray-800">24</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +10% aumento em relação ao mês passado
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Grid3X3 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Concluídos</div>
                <div className="text-2xl font-bold text-gray-800">5</div>
                <div className="flex items-center text-xs text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5% comparado ao mês passado
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Activity Planner */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Planejador de Atividades Diárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {timeSlots.map((time) => (
                <div key={time} className="flex-shrink-0 text-center">
                  <div className="text-sm text-gray-500 mb-4">{time}</div>
                  <div className="w-24 h-2 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mt-6">
              {activities.map((activity, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{activity.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{activity.date}</span>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.duration}
                        </div>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {activity.participants.map((participant, pIndex) => (
                        <Avatar key={pIndex} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{participant.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {isDashboardLoading && (
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Carregando dados compartilhados...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeModal === "total" && "Todos os Itens"}
                  {activeModal === "aprovacao" && "Itens Aguardando Aprovação"}
                  {activeModal === "analises" && "Análises"}
                  {activeModal === "orcamentos" && "Orçamentos"}
                  {activeModal === "execucao" && "Itens em Execução"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveModal(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {modalData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">{item.titulo}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">OS:</span>
                            <div className="font-mono text-blue-600">{item.os || item.id}</div>
                          </div>
                          <div>
                            <span className="font-medium">Cliente:</span>
                            <div>{item.cliente}</div>
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>
                            <div>{item.data}</div>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.status.toLowerCase().includes("concluído") ||
                                  item.status.toLowerCase().includes("concluido")
                                    ? "bg-green-100 text-green-800"
                                    : item.status.toLowerCase().includes("andamento") ||
                                        item.status.toLowerCase().includes("execução") ||
                                        item.status.toLowerCase().includes("execucao")
                                      ? "bg-blue-100 text-blue-800"
                                      : item.status.toLowerCase().includes("pendente") ||
                                          item.status.toLowerCase().includes("aguardando")
                                        ? "bg-yellow-100 text-yellow-800"
                                        : item.status.toLowerCase().includes("revisão") ||
                                            item.status.toLowerCase().includes("revisao") ||
                                            item.status.toLowerCase().includes("análise") ||
                                            item.status.toLowerCase().includes("analise")
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Valor:</span>
                            <div className="font-semibold text-green-600">{item.valor}</div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://app.novakgouveia.com.br", "_blank")}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {modalData.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">Nenhum item encontrado</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Total: {modalData.length} itens</div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setActiveModal(null)}>
                    Fechar
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Exportar Lista</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
