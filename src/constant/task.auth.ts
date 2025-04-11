export interface TaskBody {
  title: string;
  description?: string;
  status?: "pending" | "completed";
}
