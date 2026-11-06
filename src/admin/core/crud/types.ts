export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  /** Optional verification code shown to admin (never stored or logged). */
  code?: string;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
};

export type ServerAction = (
  previous: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export type ListParams = {
  q: string;
  page: number;
  pageSize: number;
  sort: string;
  direction: "asc" | "desc";
  filters: Record<string, string>;
};

export type ListResult<Row> = {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function failure(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { status: "error", message, fieldErrors };
}

export function success(message: string, code?: string): ActionState {
  return { status: "success", message, code };
}
