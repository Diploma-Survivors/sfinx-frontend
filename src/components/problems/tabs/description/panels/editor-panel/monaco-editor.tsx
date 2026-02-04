'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SubmissionsService } from '@/services/submissions-service';
import { toastService } from '@/services/toasts-service';
import { LANGUAGE_DEFINITIONS, type Language } from '@/types/submissions';
import Editor from '@monaco-editor/react';
import { ChevronDown, Copy, Wand2 } from 'lucide-react';
import type { editor } from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MonacoEditorProps {
  currentLanguageId: number;
  onCurrentLanguageIdChange: (languageId: number) => void;
  currentCode: string;
  onCurrentCodeChange: (code: string) => void;
}

export default function MonacoEditor({
  currentLanguageId,
  onCurrentLanguageIdChange: setCurrentLanguageId,
  currentCode,
  onCurrentCodeChange: setCurrentCode,
}: MonacoEditorProps) {
  const [languageList, setLanguageList] = useState<Language[]>([]);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { t } = useTranslation('problems');
  // handle editor mount when editor is mounted (just call once when editor is mounted)
  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editorInstance;
  };

  // Get language list
  useEffect(() => {
    const fetchLanguageList = async () => {
      const response = await SubmissionsService.getLanguageList();
      setLanguageList(response);
    };

    fetchLanguageList();
  }, []);

  // handle language change when user changes the language in the dropdown
  const handleLanguageChange = (languageId: number) => {
    setCurrentLanguageId(languageId);
  };

  // handle editor change when user changes the code in the editor
  const handleEditorChange = (value?: string) => {
    const newSourceCode = value || '';
    setCurrentCode(newSourceCode);
  };

  const currLanguage = languageList.find(
    (lang) => lang.id === currentLanguageId
  );

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCode);
    toastService.success(t('copied_to_clipboard'));
  };

  // Format code using Monaco editor ref (unsupported for python/cpp/java)
  const handleFormatCode = () => {
    const instance = editorRef.current;
    if (!instance) return;

    const action = instance.getAction?.('editor.action.formatDocument');
    if (action) action.run();
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg overflow-hidden">
      {/* Header - LeetCode style */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          {/* Language Selector (using DropdownMenu to prevent layout shift/scroll locking) */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-w-[150px] w-auto justify-between text-sm font-normal"
              >
                {currLanguage?.name || 'Select language'}
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
              {languageList.map((lang) => (
                <DropdownMenuItem
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className="cursor-pointer"
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFormatCode}
            className="h-8 text-muted-foreground hover:text-foreground"
            title="Format Code"
          >
            <Wand2 className="w-4 h-4 mr-1.5" />
            Format
          </Button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 text-muted-foreground hover:text-foreground"
            title="Copy Code"
          >
            <Copy className="w-4 h-4 mr-1.5" />
            Copy
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={currLanguage?.monacoLanguage}
          value={currentCode}
          onChange={handleEditorChange}
          theme="light"
          onMount={handleEditorDidMount}
          loading={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          }
          options={{
            fontSize: 14,
            fontFamily: "'Geist Mono', 'Consolas', 'Monaco', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            automaticLayout: true,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              useShadows: false,
            },
            padding: { top: 16, bottom: 16 },
            overviewRulerBorder: false,
            renderLineHighlight: 'none',
          }}
        />
      </div>
    </div>
  );
}
