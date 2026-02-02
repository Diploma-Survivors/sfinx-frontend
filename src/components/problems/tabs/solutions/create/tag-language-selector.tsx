import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SubmissionsService } from '@/services/submissions-service';
import { TagsService } from '@/services/tags-service';
import type { Language } from '@/types/submissions';
import type { Tag } from '@/types/tags';
import { Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TagLanguageSelectorProps {
  selectedTags: number[];
  onTagsChange: (tags: number[]) => void;
  selectedLanguages: number[];
  onLanguagesChange: (languages: number[]) => void;
}

export default function TagLanguageSelector({
  selectedTags,
  onTagsChange,
  selectedLanguages,
  onLanguagesChange,
}: TagLanguageSelectorProps) {
  const { t } = useTranslation('problems');
  const [tags, setTags] = useState<Tag[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    TagsService.getAllTags().then(setTags);
    SubmissionsService.getLanguageList().then((res) => setLanguages(res));
  }, []);

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const filteredLangs = languages.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleAddTag = (id: number) => {
    if (!selectedTags.includes(id)) {
      onTagsChange([...selectedTags, id]);
    }
  };

  const handleRemoveTag = (id: number) => {
    onTagsChange(selectedTags.filter((t) => t !== id));
  };

  const handleAddLang = (id: number) => {
    if (!selectedLanguages.includes(id)) {
      onLanguagesChange([...selectedLanguages, id]);
    }
  };

  const handleRemoveLang = (id: number) => {
    onLanguagesChange(selectedLanguages.filter((l) => l !== id));
  };

  return (
    <div className="flex items-center gap-4 mb-2 px-1">
      {/* Tags */}
      <div className="flex items-center gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-full border-border/60 hover:bg-accent/10 hover:text-accent-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              {t('tag')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2" align="start">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder={t('search_tags')}
                className="h-8 pl-7 text-xs bg-muted/30 border-border/50"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredTags.map((tag) => (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => handleAddTag(tag.id)}
                  className="text-xs cursor-pointer focus:bg-accent/10 focus:text-accent-foreground"
                >
                  {tag.name}
                </DropdownMenuItem>
              ))}
              {filteredTags.length === 0 && (
                <div className="text-xs text-center text-muted-foreground py-2">
                  {t('no_tags_found')}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-wrap gap-2">
          {selectedTags.map((id) => {
            const tag = tags.find((t) => t.id === id);
            if (!tag) return null;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="h-8 px-3 rounded-full gap-1 font-normal bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border border-border/50"
              >
                {tag.name}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                  onClick={() => handleRemoveTag(id)}
                />
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Languages */}
      <div className="flex items-center gap-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 rounded-full border-border/60 hover:bg-accent/10 hover:text-accent-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              {t('language')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2" align="start">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder={t('search_languages')}
                className="h-8 pl-7 text-xs bg-muted/30 border-border/50"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredLangs.map((lang) => (
                <DropdownMenuItem
                  key={lang.id}
                  onClick={() => handleAddLang(lang.id)}
                  className="text-xs cursor-pointer focus:bg-accent/10 focus:text-accent-foreground"
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
              {filteredLangs.length === 0 && (
                <div className="text-xs text-center text-muted-foreground py-2">
                  {t('no_languages_found')}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((id) => {
            const lang = languages.find((l) => l.id === id);
            if (!lang) return null;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="h-8 px-3 rounded-full gap-1 font-normal bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border border-border/50"
              >
                {lang.name}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                  onClick={() => handleRemoveLang(id)}
                />
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
