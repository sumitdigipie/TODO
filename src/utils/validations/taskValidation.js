import * as Yup from "yup";

export const taskValidationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  assignedTo: Yup.string().required("Assign task is required")
});
