"use client";

import React from "react";
import { useState } from "react";
import { ResponsiveLayout } from "@/components/responsive-layout";

import { ManualSidebar } from "@/components/manual/manual-sidebar";
import { ManualContent } from "@/components/manual/manual-content";
import { StepByStepModal } from "@/components/manual/step-by-step-modal";
import { ImagePreviewModal } from "@/components/manual/image-preview-modal";
import { manualSections } from "@/components/manual/manual-data";

export default function Manual() {
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
    <ResponsiveLayout title="Manual da Consultoria" fullWidth={true}>
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
    </ResponsiveLayout>
  );
}
