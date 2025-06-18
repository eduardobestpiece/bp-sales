import React from 'react';
import {
  FileText,
  Folder,
  Image,
  Sheet,
  Film,
  Music,
  Archive,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FileIcon = ({ type, fileType }) => {
  if (type === "folder") return <Folder className="w-5 h-5 text-yellow-400" />;
  
  if (fileType?.startsWith("image/")) return <Image className="w-5 h-5 text-purple-400" />;
  if (fileType === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (fileType?.includes("spreadsheet") || fileType?.includes("csv")) return <Sheet className="w-5 h-5 text-green-500" />;
  if (fileType?.startsWith("video/")) return <Film className="w-5 h-5 text-blue-400" />;
  if (fileType?.startsWith("audio/")) return <Music className="w-5 h-5 text-pink-400" />;
  if (fileType?.includes("zip") || fileType?.includes("archive")) return <Archive className="w-5 h-5 text-orange-400" />;
  
  return <FileText className="w-5 h-5 text-gray-400" />;
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function FileListItem({ file, onRefresh }) {
  const content = (
    <div className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-[#E50F5F]/10 transition-colors">
      <div className="col-span-5 flex items-center gap-3">
        <FileIcon type={file.type} fileType={file.file_type} />
        <span className="text-sm font-medium text-[#D9D9D9] truncate">{file.name}</span>
      </div>
      <div className="col-span-2 text-sm text-[#9CA3AF] truncate">{file.created_by}</div>
      <div className="col-span-2 text-sm text-[#9CA3AF]">
        {format(new Date(file.updated_date), "dd MMM, yyyy", { locale: ptBR })}
      </div>
      <div className="col-span-2 text-sm text-[#9CA3AF]">
        {file.type === 'file' ? formatBytes(file.file_size) : '--'}
      </div>
      <div className="col-span-1 text-right">
        <button className="p-1 rounded-md hover:bg-[#656464]/20 text-[#9CA3AF]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (file.type === 'folder') {
    return (
      <Link to={createPageUrl(`Drive?folderId=${file.id}`)}>
        {content}
      </Link>
    );
  }

  return (
    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}