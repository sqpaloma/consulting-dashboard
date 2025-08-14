import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "./manual-data";
import { ObjetivoContent } from "./content/objetivo-content";
import { OrganizacaoContent } from "./content/organizacao-content";
import { AtendimentoContent } from "./content/atendimento-content";
import { ProcessosContent } from "./content/processos-content";
import { TerceirosContent } from "./content/terceiros-content";
import { SistemaContent } from "./content/sistema-content";
import { NormasContent } from "./content/normas-content";
import { MelhoriasContent } from "./content/melhorias-content";
import { AnexosContent } from "./content/anexos-content";

interface ManualContentProps {
  activeSection: string;
  sections: Section[];
  onStepByStepClick: (modalType: string) => void;
}

export function ManualContent({
  activeSection,
  sections,
  onStepByStepClick,
}: ManualContentProps) {
  const currentSection = sections.find((s) => s.id === activeSection);

  const renderSectionContent = () => {
    switch (activeSection) {
      case "objetivo":
        return <ObjetivoContent />;
      case "organizacao":
        return <OrganizacaoContent />;
      case "atendimento":
        return <AtendimentoContent />;
      case "processos":
        return <ProcessosContent onStepByStepClick={onStepByStepClick} />;
      case "terceiros":
        return <TerceirosContent />;
      case "sistema":
        return <SistemaContent />;
      case "normas":
        return <NormasContent />;
      case "melhorias":
        return <MelhoriasContent />;
      case "anexos":
        return <AnexosContent />;
      default:
        return null;
    }
  };

  if (!currentSection) return null;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center">
          {currentSection.icon && (
            <span className="mr-2">
              {React.createElement(currentSection.icon, {
                className: "h-5 w-5 text-gray-600",
              })}
            </span>
          )}
          {currentSection.title}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderSectionContent()}</CardContent>
    </Card>
  );
}
