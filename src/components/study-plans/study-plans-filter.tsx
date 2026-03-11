import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RotateCcw } from "lucide-react";
import type { FilterStudyPlanDto } from "@/types/study-plans";
import { StudyPlanDifficulty } from "@/types/study-plans";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils"; // Optional if needed for complex classes

interface StudyPlansFilterProps {
  filters: FilterStudyPlanDto;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onFiltersChange: (updates: Partial<FilterStudyPlanDto>) => void;
  onReset: () => void;
}

export default function StudyPlansFilter({
  filters,
  keyword,
  onKeywordChange,
  onFiltersChange,
  onReset,
}: StudyPlansFilterProps) {
  const { t } = useTranslation("study-plans");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          {t("explore_plans")}
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={t("search_placeholder", "Search plans...")}
            className="pl-9 bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">
            {t("difficulty_label", "Difficulty")}
          </Label>
          <Select
            value={filters.difficulty || "all"}
            onValueChange={(val) =>
              onFiltersChange({
                difficulty:
                  val === "all" ? undefined : (val as StudyPlanDifficulty),
              })
            }
          >
            <SelectTrigger className="w-full bg-muted border-border focus:ring-primary/50">
              <SelectValue
                placeholder={t("any_difficulty", "Any Difficulty")}
              />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              <SelectItem value="all">
                {t("any_difficulty", "Any Difficulty")}
              </SelectItem>
              {Object.values(StudyPlanDifficulty).map((diff) => (
                <SelectItem key={diff} value={diff} className="capitalize">
                  {t(`difficulty.${diff}`, diff)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50">
          <Label
            htmlFor="premium-toggle"
            className="text-sm text-foreground cursor-pointer"
          >
            {t("premium_only", "Premium Only")}
          </Label>
          <Checkbox
            id="premium-toggle"
            checked={!!filters.isPremium}
            onCheckedChange={(checked: boolean | "indeterminate") =>
              onFiltersChange({
                isPremium: checked === true ? true : undefined,
              })
            }
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        onClick={onReset}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        {t("reset_filters", "Reset Filters")}
      </Button>
    </div>
  );
}
