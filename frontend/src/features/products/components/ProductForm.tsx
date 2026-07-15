import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, FileText, DollarSign, Hash, FolderTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { productGroupService, type ProductGroup } from "@/features/products/services/product-group-service";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const UNITS = ["Adet", "Kg", "m", "L", "m²", "m³", "Paket", "Kutu", "Takım", "Çift"];
const SELLING_CURRENCIES = ["TRY", "USD", "EUR"];

interface ProductFormValues {
  code: string;
  name: string;
  description?: string;
  unit: string;
  salePrice?: string;
  sellingCurrency: string;
  groupId?: string;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  loading?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductForm({ initialValues, loading, onSubmit }: ProductFormProps) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [groupOpen, setGroupOpen] = useState(false);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupLoading, setNewGroupLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await productGroupService.getAll();
      const body = res.data;
      const items = Array.isArray(body) ? body : body?.value ?? [];
      setGroups(items);
    } catch {
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const formSchema = z.object({
    code: z.string().min(1, t("validation.required")),
    name: z.string().min(1, t("validation.required")),
    description: z.string().optional(),
    unit: z.string().min(1, t("validation.required")),
    salePrice: z.string().optional(),
    sellingCurrency: z.string().min(1, t("validation.required")),
    groupId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? {
      code: "",
      name: "",
      description: "",
      unit: "",
      salePrice: "",
      sellingCurrency: "TRY",
      groupId: "",
    },
  });

  const selectedGroupId = form.watch("groupId");

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setNewGroupLoading(true);
    try {
      const res = await productGroupService.create({ name: newGroupName.trim() });
      const created = res.data.data;
      setGroups((prev) => [...prev, created]);
      form.setValue("groupId", created.id);
      setNewGroupDialogOpen(false);
      setNewGroupName("");
      toast.success(t("common.success"), {
        description: t("products.groupCreateSuccess"),
      });
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setNewGroupLoading(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate autoComplete="off" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t("products.code")}
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Hash className="h-4 w-4" />
                      </InputGroupAddon>
                      <InputGroupInput placeholder={t("products.codePlaceholder")} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>{t("products.codeDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t("products.name")}
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Package className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput placeholder={t("products.namePlaceholder")} {...field} />
                      </InputGroup>
                    </FormControl>
                    <FormDescription>{t("products.nameDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="groupId"
            render={() => (
              <FormItem>
                <FormLabel>{t("products.group")}</FormLabel>
                <FormControl>
                  <Popover open={groupOpen} onOpenChange={setGroupOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={groupOpen}
                        className="w-full justify-between"
                      >
                        {selectedGroup
                          ? selectedGroup.name
                          : t("products.groupPlaceholder")}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder={t("products.groupSearchPlaceholder")} />
                        <CommandList>
                          <CommandEmpty>{t("products.bomNoResults")}</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              key="__new__"
                              value="__new__"
                              onSelect={() => {
                                setGroupOpen(false);
                                setNewGroupDialogOpen(true);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t("products.groupNew")}
                            </CommandItem>
                            {groups.map((group) => (
                              <CommandItem
                                key={group.id}
                                value={group.name}
                                onSelect={() => {
                                  form.setValue("groupId", group.id);
                                  setGroupOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedGroupId === group.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {group.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription>{t("products.groupDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("products.description")}</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" className="items-start pt-2.5">
                      <FileText className="h-4 w-4" />
                    </InputGroupAddon>
                    <Textarea
                      placeholder={t("products.descriptionPlaceholder")}
                      className="min-h-[80px] border-none shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("products.descriptionDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {t("products.unit")}
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("products.unitPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>{t("products.unitDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-2">
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("products.salePrice")}</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <DollarSign className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder={t("products.salePricePlaceholder")}
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormDescription>{t("products.salePriceDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sellingCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>&nbsp;</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SELLING_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? t("common.ellipsis") : t("common.save")}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {t("products.groupNewDialogTitle")}
            </DialogTitle>
            <DialogDescription>{t("products.groupNewDialogDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <FolderTree className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t("products.groupNewDialogPlaceholder")}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateGroup();
                  }
                }}
              />
            </InputGroup>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewGroupDialogOpen(false);
                  setNewGroupName("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreateGroup} disabled={newGroupLoading || !newGroupName.trim()}>
                {newGroupLoading ? t("common.ellipsis") : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
