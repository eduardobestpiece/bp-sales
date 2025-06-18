import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FolderPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Folder,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { DriveFile } from "@/api/entities";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CreateFolderModal from "../components/drive/CreateFolderModal";
import UploadFileModal from "../components/drive/UploadFileModal";
import FileListItem from "../components/drive/FileListItem";

export default function Drive() {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get("folderId") || null;

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [folderId]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const allFiles = await DriveFile.filter({ parent_id: folderId });
      setFiles(allFiles);
      if (folderId) {
        const folderData = await DriveFile.get(folderId);
        setCurrentFolder(folderData);
      } else {
        setCurrentFolder(null);
      }
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    }
    setIsLoading(false);
  };

  const handleSuccess = () => {
    setShowCreateFolder(false);
    setShowUploadFile(false);
    loadFiles();
  };

  const Breadcrumbs = () => (
    <div className="flex items-center gap-2 text-xl font-semibold text-[#D9D9D9]">
      {folderId ? (
        <>
          <Link
            to={createPageUrl(`Drive?folderId=${currentFolder?.parent_id || ''}`)}
            className="text-[#9CA3AF] hover:text-[#E50F5F]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Folder className="w-6 h-6 text-[#E50F5F]" />
          <span>{currentFolder?.name || "Pasta"}</span>
        </>
      ) : (
        <>
          <Folder className="w-6 h-6 text-[#E50F5F]" />
          <span>Meu Drive</span>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#131313] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <Breadcrumbs />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateFolder(true)}
              variant="outline"
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Nova Pasta
            </Button>
            <Button
              onClick={() => setShowUploadFile(true)}
              className="bg-[#E50F5F] hover:bg-[#E50F5F]/80 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
            <Input
              placeholder="Buscar no Drive..."
              className="pl-10 bg-[#1C1C1C] border-[#656464] text-[#D9D9D9] w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-[#656464] text-[#D9D9D9] hover:bg-[#E50F5F]/20"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <div className="flex items-center rounded-md border border-[#656464]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={`rounded-r-none ${viewMode === 'list' ? 'bg-[#E50F5F]/20 text-[#E50F5F]' : 'text-[#9CA3AF]'}`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`rounded-l-none ${viewMode === 'grid' ? 'bg-[#E50F5F]/20 text-[#E50F5F]' : 'text-[#9CA3AF]'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="bg-[#1C1C1C] border border-[#656464] rounded-lg">
          <div className="px-4 py-2 border-b border-[#656464] text-xs font-medium text-[#9CA3AF] grid grid-cols-12 gap-4">
            <div className="col-span-5">Nome</div>
            <div className="col-span-2">Proprietário</div>
            <div className="col-span-2">Última modificação</div>
            <div className="col-span-2">Tamanho</div>
            <div className="col-span-1"></div>
          </div>
          {isLoading ? (
            <div className="text-center p-8 text-[#9CA3AF]">Carregando...</div>
          ) : files.length === 0 ? (
            <div className="text-center p-8 text-[#9CA3AF]">Esta pasta está vazia.</div>
          ) : (
            <div className="divide-y divide-[#656464]">
              {files.map(file => (
                <FileListItem key={file.id} file={file} onRefresh={loadFiles} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateFolderModal 
        open={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSuccess={handleSuccess}
        parentId={folderId}
      />
      <UploadFileModal
        open={showUploadFile}
        onClose={() => setShowUploadFile(false)}
        onSuccess={handleSuccess}
        parentId={folderId}
      />
    </div>
  );
}