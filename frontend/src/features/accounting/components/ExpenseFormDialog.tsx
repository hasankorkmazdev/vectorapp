import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, FileText, Calendar, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  accountingService,
  type Category,
} from "@/features/accounting/services/accounting-service";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseFormDialog({ open, onOpenChange, onSuccess }: ExpenseFormDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const formSchema = z.object({
    amount: z.number({ message: t("validation.required") }).min(0.01, t("validation.required")),
    description: z.string().min(1, t("validation.required")),
    date: z.string().min(1, t("validation.required")),
    categoryId: z.string().min(1, t("validation.required")),
    paymentType: z.enum(["cash", "credit_card", "bank_transfer", "check"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined as unknown as number,
      description: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      paymentType: "cash",
    },
  });

  useEffect(() => {
    if (open) {
      accountingService.getExpenseCategories().then(setCategories);
      form.reset({
        amount: undefined as unknown as number,
        description: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        paymentType: "cash",
      });
    }
  }, [open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await accountingService.createExpense(values);
      toast.success(t("common.success"), {
        description: t("financial.expenseCreateSuccess"),
      });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-0 flex flex-col h-full">
        <SheetHeader className="px-6 pt-6 shrink-0">
          <SheetTitle className="inline-flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t("financial.addExpense")}
          </SheetTitle>
          <SheetDescription>{t("financial.addExpenseDescription")}</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 space-y-4 py-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("financial.amount")}</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <Receipt className="h-4 w-4" />
                        </InputGroupAddon>
                        <NumberInput
                          className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent h-full"
                          data-slot="input-group-control"
                          placeholder="0.00"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormDescription>{t("financial.amountDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("financial.description")}</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <FileText className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput placeholder={t("financial.descriptionPlaceholder")} {...field} />
                      </InputGroup>
                    </FormControl>
                    <FormDescription>{t("financial.descriptionDesc")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t("financial.date")}</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <Calendar className="h-4 w-4" />
                          </InputGroupAddon>
                          <InputGroupInput type="date" {...field} />
                        </InputGroup>
                      </FormControl>
                      <FormDescription>{t("financial.dateDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t("financial.paymentType")}</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("financial.selectPaymentType")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">{t("financial.paymentCash")}</SelectItem>
                            <SelectItem value="credit_card">{t("financial.paymentCreditCard")}</SelectItem>
                            <SelectItem value="bank_transfer">{t("financial.paymentBankTransfer")}</SelectItem>
                            <SelectItem value="check">{t("financial.paymentCheck")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>{t("financial.paymentTypeDescription")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("financial.category")}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("financial.selectCategory")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>{t("financial.expenseCategoryDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="flex-row gap-2 shrink-0 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                <XCircle className="h-4 w-4" />
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                <CheckCircle className="h-4 w-4" />
                {loading ? t("common.ellipsis") : t("common.save")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
