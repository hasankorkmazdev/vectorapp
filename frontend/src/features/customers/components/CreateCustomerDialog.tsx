import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { customerService } from "@/features/customers/services/customer-service";

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCustomerDialog({ open, onOpenChange, onSuccess }: CreateCustomerDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const formSchema = z.object({
    companyName: z.string().min(1, t("validation.required")),
    taxNumber: z.string().optional(),
    taxOffice: z.string().optional(),
    phone: z.array(z.string()),
    email: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      taxNumber: "",
      taxOffice: "",
      phone: [],
      email: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await customerService.create(values);
      toast.success(t("common.success"), {
        description: t("customers.createSuccess"),
      });
      form.reset();
      setPhoneInput("");
      setEmailInput("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(t("common.error"), {
        description: error.response?.data?.message || t("common.error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const addPhone = () => {
    if (phoneInput.trim()) {
      const current = form.getValues("phone");
      form.setValue("phone", [...current, phoneInput.trim()]);
      setPhoneInput("");
    }
  };

  const removePhone = (index: number) => {
    const current = form.getValues("phone");
    form.setValue("phone", current.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    if (emailInput.trim()) {
      const current = form.getValues("email");
      form.setValue("email", [...current, emailInput.trim()]);
      setEmailInput("");
    }
  };

  const removeEmail = (index: number) => {
    const current = form.getValues("email");
    form.setValue("email", current.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("customers.createTitle")}</DialogTitle>
          <DialogDescription>{t("customers.createDescription")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate autoComplete="off" className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("customers.companyName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("customers.companyNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.taxNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("customers.taxNumberPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxOffice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("customers.taxOffice")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("customers.taxOfficePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={() => (
                <FormItem>
                  <FormLabel>{t("customers.phone")}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("customers.phonePlaceholder")}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addPhone();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={addPhone}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  {form.watch("phone").length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("phone").map((item, index) => (
                        <Badge key={index} variant="secondary">
                          {item}
                          <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-destructive" onClick={() => removePhone(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>{t("customers.phoneDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <FormLabel>{t("customers.email")}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("customers.emailPlaceholder")}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addEmail();
                          }
                        }}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={addEmail}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  {form.watch("email").length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("email").map((item, index) => (
                        <Badge key={index} variant="secondary">
                          {item}
                          <Button type="button" variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-destructive" onClick={() => removeEmail(index)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>{t("customers.emailDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("common.ellipsis") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
