import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { UploadFile as UploadFileIntegration } from "@/api/integrations";
import { DriveFile } from "@/api/entities";

export default function UploadFileModal({ open, onClose, onSuccess, parentId }) {
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    if (newFiles) {
      setFilesToUpload(prev => [...prev, ...Array.from(newFiles)]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };
  
  const onAreaClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (fileToRemove) => {
    setFilesToUpload(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) return;
    setIsLoading(true);

    try {
      for (const file of filesToUpload) {
        const { file_url } = await UploadFileIntegration({ file });
        
        await DriveFile.create({
          name: file.name,
          type: "file",
          parent_id: parentId,
          file_url: file_url,
          file_type: file.type,
          file_size: file.size,
        });
      }
      setFilesToUpload([]);
      onSuccess();
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFilesToUpload([]);
    setIsLoading(false);
    setIsDragActive(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1C1C1C] border-[#656464] text-[#D9D9D9]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#E50F5F]">Fazer Upload de Arquivos</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onAreaClick}
            className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
              ${isDragActive ? 'border-[#E50F5F] bg-[#E50F5F]/10' : 'border-[#656464]'}
            `}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleChange}
            />
            <UploadCloud className="w-12 h-12 mx-auto text-[#9CA3AF]" />
            <p className="mt-2 text-[#D9D9D9]">
              {isDragActive ? 'Solte os arquivos aqui' : 'Arraste e solte arquivos aqui, ou clique para selecionar'}
            </p>
          </div>

          {filesToUpload.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-[#D9D9D9] font-medium">Arquivos para Enviar:</h4>
              {filesToUpload.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#131313] rounded">
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-sm text-[#D9D9D9]">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(file)} className="text-[#9CA3AF] hover:text-red-500 w-6 h-6">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-[#656464] text-[#D9D9D9] hover:bg-[#656464]/20"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isLoading || filesToUpload.length === 0} 
            className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Enviando..." : `Enviar ${filesToUpload.length} Arquivo(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}