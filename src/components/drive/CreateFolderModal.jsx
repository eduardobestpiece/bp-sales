import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DriveFile } from "@/api/entities";

export default function CreateFolderModal({ open, onClose, onSuccess, parentId }) {
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsLoading(true);

    try {
      await DriveFile.create({
        name: folderName,
        type: "folder",
        parent_id: parentId,
      });
      setFolderName("");
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar pasta:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F]">Nova Pasta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="folderName" className="text-[#9CA3AF]">Nome da Pasta</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Ex: Documentos Fiscais"
              required
              className="bg-[#131313] border-[#656464] text-[#D9D9D9]"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white">
              {isLoading ? "Criando..." : "Criar Pasta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}