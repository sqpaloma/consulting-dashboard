import React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { Section } from "./manual-data";

interface ManualSidebarProps {
  sections: Section[];
  activeSection: string;
  onSectionToggle: (sectionId: string) => void;
}

export function ManualSidebar({
  sections,
  activeSection,
  onSectionToggle,
}: ManualSidebarProps) {
  return (
    <Card className="bg-white sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Sumário
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {sections.map((section) => (
            <div key={section.id}>
              <button
                onClick={() => onSectionToggle(section.id)}
                className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                  activeSection === section.id
                    ? "bg-gray-100 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-2">
                  <section.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {section.title}
                  </span>
                </div>
                {section.subsections.length > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
              {activeSection === section.id &&
                section.subsections.length > 0 && (
                  <div className="pl-6 pb-2">
                    {section.subsections.map((subsection) => (
                      <a
                        key={subsection.id}
                        href={`#${subsection.id}`}
                        className="block py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {subsection.title}
                      </a>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
