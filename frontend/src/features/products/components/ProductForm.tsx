import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, FileText, DollarSign, Ruler } from "lucide-react";
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

const UNITS = ["Adet", "Kg", "m", "L", "m²", "m³", "Paket", "Kutu", "Takım", "Çift"];

interface ProductFormValues {
  name: string;
  description?: string;
  unit: string;
  salePrice?: string;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  loading?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductForm({ initialValues, loading, onSubmit }: ProductFormProps) {
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(1, t("validation.required")),
    description: z.string().optional(),
    unit: z.string().min(1, t("validation.required")),
    salePrice: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? {
      name: "",
      description: "",
      unit: "",
      salePrice: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate autoComplete="off" className="space-y-6">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>
                  {t("products.unit")}
                </FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Ruler className="h-4 w-4" />
                    </InputGroupAddon>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-none shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0">
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
                  </InputGroup>
                </FormControl>
                <FormDescription>{t("products.unitDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? t("common.ellipsis") : t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
