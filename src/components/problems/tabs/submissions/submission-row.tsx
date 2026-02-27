import { useLanguage } from "@/hooks/use-language";
import { getStatusMeta } from "@/lib/utils/testcase-status";
import type { Submission } from "@/types/submissions";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Clock, Cpu } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SubmissionRowProps {
  submission: Submission;
  index: number;
  isSelected: boolean;
  onSelect: (submission: Submission) => void;
}

const locales: Record<string, any> = {
  en: enUS,
  vi: vi,
};

const formatRuntime = (runtime: number) => {
  if (runtime === 0) return "CE";
  const runtimeInMs = runtime * 1000;
  return `${runtimeInMs.toFixed(0)} ms`;
};

const formatMemory = (memory: number) => {
  if (memory === 0) return "CE";
  const memoryInMB = memory / 1024;
  return `${memoryInMB.toFixed(0)} MB`;
};

export default function SubmissionRow({
  submission,
  index,
  isSelected,
  onSelect,
}: SubmissionRowProps) {
  const { getLanguageName } = useLanguage();
  const { i18n } = useTranslation();

  return (
    <tr
      className={`cursor-pointer transition-all duration-200 group ${
        isSelected ? "bg-gray-200" : "hover:bg-gray-100"
      }`}
      onClick={() => onSelect(submission)}
      style={{
        animationDelay: `${index * 50} ms`,
        animation: "fadeInUp 0.25s ease-out forwards",
      }}
    >
      {/* Status */}
      <td className="px-4 py-3">
        {(() => {
          const statusInfo = getStatusMeta(submission.status);
          return (
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md transition-all duration-200 group-hover:scale-105">
                <span className={statusInfo.iconColor}>{statusInfo.icon}</span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-semibold text-gray-900 capitalize ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
                <span className="text-[10px] text-gray-500">
                  {formatDistanceToNow(new Date(submission.submittedAt), {
                    addSuffix: true,
                    locale: locales[i18n.language] || enUS,
                  })}
                </span>
              </div>
            </div>
          );
        })()}
      </td>

      {/* Language */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-xs flex items-baseline gap-1">
            <span className="font-semibold text-gray-900">
              {getLanguageName(submission.languageId)}
            </span>
          </div>
        </div>
      </td>

      {/* Runtime */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-900">
            {formatRuntime(submission.executionTime)}
          </span>
        </div>
      </td>

      {/* Memory */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Cpu className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-900">
            {formatMemory(submission.memoryUsed)}
          </span>
        </div>
      </td>
    </tr>
  );
}
