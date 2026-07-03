import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/api/axios";

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  roles: Array<{ id: string; name: string }>;
  permissions: string[];
  balance?: number;
  organizations?: Array<{ id: string; name: string; role: string; isSetupRequired: boolean }>;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  priceVariesByLanguage: boolean;
  languageCurrencies: Record<string, string>;
}

interface AppState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  activeOrganizationId: string | null;
  activeOrganizationDetails: OrganizationDetails | null;
  loadingDetails: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setActiveOrganizationId: (organizationId: string | null) => void;
  addOrganization: (organization: { id: string; name: string; role: string; isSetupRequired: boolean }) => void;
  setOrganizations: (organizations: Array<{ id: string; name: string; role: string; isSetupRequired: boolean }>) => void;
  updateUser: (userUpdates: Partial<User>) => void;
  fetchActiveOrganizationDetails: () => Promise<OrganizationDetails | null>;
  setToken: (token: string) => void;
  getSupportedLanguages: () => string[];
  getDefaultLanguage: () => string;
  getLangInfo: (langCode: string) => { name: string; flag: string };
  getLanguageCurrency: (langCode: string) => string;
  getPriceVariesByLanguage: () => boolean;
}

const LANG_CONFIGS: Record<string, { name: string; flag: string }> = {
  tr: { name: "Türkçe", flag: "/media/flags/flags/tr-TR.svg" },
  en: { name: "English", flag: "/media/flags/flags/en-US.svg" },
  de: { name: "Deutsch", flag: "/media/flags/flags/germany.svg" },
  ru: { name: "Русский", flag: "/media/flags/flags/russia.svg" },
  ar: { name: "العربية", flag: "/media/flags/flags/saudi-arabia.svg" },
  fr: { name: "Français", flag: "/media/flags/flags/france.svg" },
  es: { name: "Español", flag: "/media/flags/flags/spain.svg" },
  it: { name: "Italiano", flag: "/media/flags/flags/italy.svg" },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      activeOrganizationId: null,
      activeOrganizationDetails: null,
      loadingDetails: false,
      login: (user, token) => {
        const defaultOrganizationId =
          user.organizations && user.organizations.length === 1
            ? user.organizations[0].id
            : null;
        set({
          isAuthenticated: true,
          token,
          user,
          activeOrganizationId: defaultOrganizationId,
        });
      },
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          activeOrganizationId: null,
          activeOrganizationDetails: null,
        });
      },
      setActiveOrganizationId: (activeOrganizationId) => {
        set({ activeOrganizationId, activeOrganizationDetails: null });
        if (activeOrganizationId) {
          get().fetchActiveOrganizationDetails();
        }
      },
      addOrganization: (organization) =>
        set((state) => {
          if (!state.user) return state;
          const currentOrganizations = state.user.organizations || [];
          const updatedOrganizations = [...currentOrganizations, organization];
          return {
            user: { ...state.user, organizations: updatedOrganizations },
            activeOrganizationId: organization.id,
            activeOrganizationDetails: null,
          };
        }),
      setOrganizations: (organizations) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, organizations },
          };
        }),
      updateUser: (userUpdates) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, ...userUpdates },
          };
        }),
      setToken: (token) => {
        set({ token });
      },
      fetchActiveOrganizationDetails: async () => {
        set({ loadingDetails: true });
        try {
          const response = await api.get("/organization");
          const details = response.data.data;
          set({ activeOrganizationDetails: details, loadingDetails: false });
          return details;
        } catch (e) {
          console.error("Failed to fetch organization details", e);
          set({ loadingDetails: false });
          return null;
        }
      },
      getSupportedLanguages: () => {
        return get().activeOrganizationDetails?.supportedLanguages || ["tr"];
      },
      getDefaultLanguage: () => {
        return get().activeOrganizationDetails?.defaultLanguage || "tr";
      },
      getLangInfo: (langCode) => {
        return (
          LANG_CONFIGS[langCode.toLowerCase()] || {
            name: langCode.toUpperCase(),
            flag: "/media/flags/flags/flag.svg",
          }
        );
      },
      getLanguageCurrency: (langCode) => {
        const currencies =
          get().activeOrganizationDetails?.languageCurrencies || {};
        return currencies[langCode.toLowerCase()] || "TRY";
      },
      getPriceVariesByLanguage: () => {
        return get().activeOrganizationDetails?.priceVariesByLanguage ?? false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
        activeOrganizationId: state.activeOrganizationId,
        activeOrganizationDetails: state.activeOrganizationDetails,
      }),
    }
  )
);
