import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, BookOpen, Lightbulb } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import PlaybookSelectionModal from "./PlaybookSelectionModal";
import TemplateSelectionModal from "./TemplateSelectionModal";

export default function CreateActivityDropdown({ onCreateNew, onRefresh, workflows = [], users = [] }) {
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Atividade
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
          <DropdownMenuItem 
            onClick={onCreateNew}
            className="cursor-pointer hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nova Atividade
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowPlaybookModal(true)}
            className="cursor-pointer hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Baseado em Playbook
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowTemplateModal(true)}
            className="cursor-pointer hover:bg-[#E50F5F]/20 focus:bg-[#E50F5F]/20"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Baseado em Modelo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PlaybookSelectionModal
        open={showPlaybookModal}
        onClose={() => setShowPlaybookModal(false)}
        onSuccess={onRefresh}
        workflows={workflows}
        users={users}
      />

      <TemplateSelectionModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSuccess={onRefresh}
        workflows={workflows}
        users={users}
      />
    </>
  );
}