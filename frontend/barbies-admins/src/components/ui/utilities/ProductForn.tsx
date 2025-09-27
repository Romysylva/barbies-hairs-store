import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import axios from "../../lib/axios";

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  hairLenght: string;
  image: string;
  inStock: boolean;
  rating: number;
};

type ProductFormProps = {
  initialData?: Partial<ProductInput>;
  productId?: string;
  submitText?: string;
};

const ProductForm = ({
  initialData = {},
  productId,
  submitText = "Submit",
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    defaultValues: {
      name: initialData.name || "",
      description: initialData.description || "",
      price: initialData.price || 0,
      category: initialData.category || "",
      subcategory: initialData.subcategory || "",
      hairLenght: initialData.hairLenght || "",
      image: initialData.image || "",
      inStock: initialData.inStock ?? true,
      rating: initialData.rating || 0,
    },
  });

  const navigate = useNavigate();
  const { showToast } = useToast();

  const onSubmit = async (data: ProductInput) => {
    try {
      if (productId) {
        await axios.patch(`/products/${productId}`, data);
        showToast("Product updated!", "success");
      } else {
        await axios.post("/", data);
        showToast("Product created!", "success");
      }

      navigate("/products"); // Redirect after success
    } catch (err: any) {
      console.error(err);
      showToast(
        err?.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      // className="bhs:max-w-xl bhs:mx-auto bhs:space-y-4 bhs:border"
      className="bhs:bg-white bhs:p-4 bhs:max-w-xl bhs:mx-auto bhs:rounded bhs:shadow bhs:space-y-4 bhs:w-full "
    >
      <input
        {...register("name", { required: true })}
        placeholder="Product Name"
        // className="bhs:input"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full bhs:mr-4 bhs:lg:w-65"
      />
      {errors.name && (
        <p className="bhs:text-red-500 bhs:text-sm">
          erro{errors.name.message}
        </p>
      )}

      <input
        type="number"
        {...register("price", { required: true })}
        placeholder="Price"
        // className="bhs:input"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full bhs:lg:w-65"
      />
      {errors.price && (
        <p className="bhs:text-red-500 bhs:text-sm">{errors.price.message}</p>
      )}
      <textarea
        {...register("description", { required: true })}
        placeholder="Description"
        // className="bhs:input"
        className="bhs:w-full bhs:border bhs:p-2 bhs:rounded"
      />
      {errors.description && (
        <p className="bhs:text-red-500 bhs:text-sm">
          {errors.description.message}
        </p>
      )}

      <input
        {...register("category", { required: true })}
        placeholder="Category"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full bhs:mr-4 bhs:lg:w-65"
      />
      <input
        {...register("subcategory")}
        placeholder="Subcategory"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full  bhs:lg:w-65"
      />
      <input
        {...register("hairLenght")}
        placeholder="Hair Length"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full bhs:mr-4 bhs:lg:w-65"
      />
      <input
        {...register("image")}
        placeholder="Image URL"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full  bhs:lg:w-65"
      />
      <input
        type="number"
        step="0.1"
        {...register("rating")}
        placeholder="Rating (e.g., 4.5)"
        className=" bhs:border bhs:p-2 bhs:rounded bhs:w-full bhs:mr-4 bhs:lg:w-65"
      />

      <label className="bhs:flex bhs:items-center bhs:space-x-2">
        <input type="checkbox" {...register("inStock")} />
        <span>In Stock</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bhs:btn bhs:bg-barbiePurple bhs:text-white"
      >
        {submitText}
      </button>
    </form>
  );
};

export default ProductForm;
