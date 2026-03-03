import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBusinessLines,
  getBusinessLine,
  createBusinessLine,
  updateBusinessLine,
  deleteBusinessLine,
} from "@/apis/actions/business-lines";
import type {
  CreateBusinessLineInput,
  UpdateBusinessLineInput,
} from "@/lib/validations/business-line";

export const useBusinessLines = (params?: {
  search?: string;
  activeOnly?: boolean;
}) => {
  return useQuery({
    queryKey: ["business-lines", params],
    queryFn: async () => {
      const result = await getBusinessLines(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useBusinessLine = (id: string) => {
  return useQuery({
    queryKey: ["business-lines", id],
    queryFn: async () => {
      const result = await getBusinessLine(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });
};

export const useCreateBusinessLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBusinessLineInput) => {
      const result = await createBusinessLine(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-lines"] });
    },
  });
};

export const useUpdateBusinessLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBusinessLineInput) => {
      const result = await updateBusinessLine(input);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-lines"] });
      queryClient.invalidateQueries({
        queryKey: ["business-lines", variables.id],
      });
    },
  });
};

export const useDeleteBusinessLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBusinessLine(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-lines"] });
    },
  });
};
