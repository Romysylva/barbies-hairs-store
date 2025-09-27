// app/actions/userActions.ts
// "use server";

// import apiClient from "@/lib/apiClient";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// export async function createUser(formData: FormData) {
//   try {
//     const payload = {
//       userName: formData.get("userName"),
//       userType: formData.get("userType"),
//       password: formData.get("password"),
//       confirmPassword: formData.get("confirmPassword"),
//     };

//     await apiClient.post("/users", payload);

//     revalidatePath("/users");
//     redirect("/users");
//   } catch (error: any) {
//     console.error(
//       "Error creating user:",
//       error.response?.data || error.message
//     );
//     redirect(
//       `/users/add?errorMessage=${encodeURIComponent("Failed to create user")}`
//     );
//   }
// }

"use server";

import apiClient from "@/lib/apiClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AxiosError } from "axios";

export async function createUser(formData: FormData) {
  try {
    const payload = new FormData();

    payload.append("name", formData.get("name") as string);
    payload.append("email", formData.get("email") as string);
    payload.append("roles", formData.get("roles") as string);
    payload.append("password", formData.get("password") as string);
    payload.append(
      "passwordConfirm",
      formData.get("passwordConfirm") as string
    );
    payload.append("location", formData.get("location") as string);

    const photo = formData.get("photo") as File | null;
    if (photo) {
      payload.append("photo", photo);
    }

    // Call backend
    const res = await apiClient.post("/auths/register", payload);
    console.log(payload);

    if (res.status === 201 || res.status === 200) {
      // revalidate user list page
      revalidatePath("/users", "page");
      // redirect to user list
      redirect("/users");
    } else {
      throw new Error("Unexpected response from server");
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(
        "Error creating user:",
        error.response?.data || error.message
      );
    } else if (error instanceof Error) {
      console.error("Unexpected error:", error.message);
    }

    redirect(
      `/users/add?errorMessage=${encodeURIComponent("Failed to create user")}`
    );
  }
}

// "use server";

// import apiClient from "@/lib/apiClient";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { AxiosError } from "axios";

// export async function createUser(formData: FormData) {
//   try {
//     // Use the same FormData that comes from the client
//     const res = await apiClient.post("/auths/register", formData);

//     if (res.status === 201 || res.status === 200) {
//       revalidatePath("/users", "page");
//       redirect("/users");
//     } else {
//       throw new Error("Unexpected response from server");
//     }
//   } catch (error: unknown) {
//     if (error instanceof AxiosError) {
//       console.error(
//         "Error creating user:",
//         error.response?.data || error.message
//       );
//     } else if (error instanceof Error) {
//       console.error("Unexpected error:", error.message);
//     }

//     redirect(
//       `/users/add?errorMessage=${encodeURIComponent("Failed to create user")}`
//     );
//   }
// }

// "use server";

// import apiClient from "@/lib/apiClient";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { AxiosError } from "axios";
// import FormDataNode from "form-data";

// export async function createUser(formData: FormData) {
//   try {
//     const nodeFormData = new FormDataNode();

//     for (const [key, value] of formData.entries()) {
//       if (value instanceof File) {
//         const buffer = Buffer.from(await value.arrayBuffer());
//         nodeFormData.append(key, buffer, {
//           filename: value.name,
//           contentType: value.type, // 👈 helps backend parse it correctly
//         });
//       } else {
//         nodeFormData.append(key, value as string);
//       }
//     }

//     const res = await apiClient.post("/auths/register", nodeFormData, {
//       headers: {
//         ...nodeFormData.getHeaders(),
//       },
//     });

//     if (res.status === 201 || res.status === 200) {
//       revalidatePath("/users", "page");
//       redirect("/users");
//     } else {
//       throw new Error("Unexpected response from server");
//     }
//   } catch (error: unknown) {
//     if (error instanceof AxiosError) {
//       console.error(
//         "Error creating user:",
//         error.response?.data || error.message
//       );
//     } else if (error instanceof Error) {
//       console.error("Unexpected error:", error.message);
//     }

//     redirect(
//       `/users/add?errorMessage=${encodeURIComponent("Failed to create user")}`
//     );
//   }
// }
