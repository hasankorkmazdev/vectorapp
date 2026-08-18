import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown, Plus, Tag as TagIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { tagService } from "@/features/tags/services/tag-service";
import type { Tag } from "@/features/tags/types";

interface TagSelectorProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTags = () => {
    tagService.getAll().then(setTags).catch(() => {});
  };

  useEffect(() => {
    loadTags();
  }, []);

  const selectedTags = tags.filter((tag) => value.includes(tag.id));

  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const showCreateOption = search.trim().length > 0 &&
    !tags.some((tag) => tag.name.toLowerCase() === search.trim().toLowerCase());

  const handleCreateTag = async () => {
    const name = search.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await tagService.create({ name });
      setTags((prev) => [...prev, res.data.data]);
      onChange([...value, res.data.data.id]);
      setSearch("");
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <TagIcon className="h-4 w-4" />
              {t("accounts.tagsPlaceholder")}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder={t("accounts.tagsSearchPlaceholder")}
            />
            <CommandList>
              <CommandEmpty className="p-1">
                {showCreateOption ? (
                  <button
                    type="button"
                    disabled={creating}
                    onClick={handleCreateTag}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    {t("accounts.tagsCreateNew", { name: search.trim() })}
                  </button>
                ) : (
                  <span className="block px-2 py-1.5 text-sm text-muted-foreground">
                    {t("common.empty")}
                  </span>
                )}
              </CommandEmpty>
              <CommandGroup>
                {tags
                  .filter((tag) => tag.name.toLowerCase().includes(search.trim().toLowerCase()))
                  .map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={() => toggleTag(tag.id)}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value.includes(tag.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color ?? "var(--muted-foreground)" }}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                {showCreateOption && tags.length > 0 && (
                  <CommandItem value={`__create__${search}`} onSelect={handleCreateTag} disabled={creating}>
                    <Plus className="h-4 w-4" />
                    {t("accounts.tagsCreateNew", { name: search.trim() })}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: tag.color ?? "var(--muted-foreground)" }}
              />
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
