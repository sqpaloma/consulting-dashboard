"use client";

import React from "react";
import { useState } from "react";
import {
  Calendar,
  Settings,
  BarChart3,
  Grid3X3,
  ArrowLeft,
  MessageSquare,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ManualSidebar } from "./manual-sidebar";
import { ManualContent } from "./manual-content";
import { StepByStepModal } from "./step-by-step-modal";
import { ImagePreviewModal } from "./image-preview-modal";
import { manualSections } from "./manual-data";

export function ManualPage() {
  const [activeSection, setActiveSection] = useState<string>("objetivo");
  const [stepByStepModal, setStepByStepModal] = useState<string | null>(null);
  const [stepImages, setStepImages] = useState<{ [key: string]: File[] }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleImageUpload = (stepId: string, files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setStepImages((prev) => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), ...newFiles],
    }));
  };

  const removeImage = (stepId: string, index: number) => {
    setStepImages((prev) => ({
      ...prev,
      [stepId]: prev[stepId]?.filter((_, i) => i !== index) || [],
    }));
  };

  const openImagePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const closeImagePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const closeStepByStepModal = () => {
    setStepByStepModal(null);
    closeImagePreview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
              <div className="w-12 h-12 bg-blue-700 rounded-full border-2 border-green-400 flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">ng</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-white">novak</span>
                <span className="text-2xl font-light text-green-400">
                  gouveia
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/analytics">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-700"
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700 bg-blue-700"
            >
              <BookOpen className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Manual de Trabalho</h1>
          <p className="text-gray-300">
            Departamento Consultores de Serviços – Engenharia
          </p>
        </div>

        {/* Manual Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <ManualSidebar
              sections={manualSections}
              activeSection={activeSection}
              onSectionToggle={toggleSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <ManualContent
              activeSection={activeSection}
              sections={manualSections}
              onStepByStepClick={setStepByStepModal}
            />
          </div>
        </div>
      </div>

      {/* Step by Step Modal */}
      {stepByStepModal && (
        <StepByStepModal
          modalType={stepByStepModal}
          onClose={closeStepByStepModal}
          stepImages={stepImages[stepByStepModal] || []}
          onImageUpload={(files) => handleImageUpload(stepByStepModal, files)}
          onRemoveImage={(index) => removeImage(stepByStepModal, index)}
          onImagePreview={openImagePreview}
        />
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <ImagePreviewModal
          imageUrl={imagePreview}
          onClose={closeImagePreview}
        />
      )}
    </div>
  );
}
