
// Importing from the shadcn/ui toast components
import { useToast as useShadcnToast } from "@/components/ui/toast"

// Re-export both the hook and the toast function
export const useToast = useShadcnToast;

export const toast = {
  success: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Success",
      description: message,
    });
  },
  error: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  info: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Info",
      description: message,
    });
  },
  warning: (message: string) => {
    const { toast } = useShadcnToast();
    toast({
      title: "Warning",
      description: message,
      variant: "destructive",
    });
  },
};
