import { createUser } from "@/actions/user-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";

interface AddUsersProps {
  searchParams?: Promise<{ errorMessage?: string }>;
}

export default async function AddUsers({ searchParams }: AddUsersProps) {
  const params = await searchParams;
  const errorMessage = params?.errorMessage ?? "";

  return (
    <div>
      <h1 className="bhs:text-3xl bhs:font-semibold bhs:p-2">Add User</h1>

      <form
        className="bhs:grid bhs:gap-x-6 bhs:gap-y-10 bhs:mt-10 bhs:grid-cols-2 bhs:px-2"
        action={createUser}
        // encType="multipart/form-data"
      >
        {errorMessage?.length > 0 ? (
          <div className="bhs:col-span-2 bhs:border bhs:border-red-500 bhs:rounded-xl bhs:px-5 bhs:py-3 bhs:bg-red-50 bhs:w-fit">
            <span className="bhs:text-red-500 bhs:text-mg bhs:font-500">
              {errorMessage}
            </span>
          </div>
        ) : (
          ""
        )}

        <div>
          <Label required={true}>Username</Label>
          <Input
            type="text"
            placeholder="Enter Username"
            className="custom-input"
            name="name"
          />
        </div>

        {/* roles dropdown */}
        <div>
          <Label required={true}>User Role</Label>
          <select
            className="custom-select bhs:appearance-none bhs:cursor-pointer"
            name="roles"
          >
            <option value="">Select User Type</option>
            <option value="Super Admin">Super Admin</option>
            <option value="admin">admin</option>
            <option value="manager">manager</option>
            <option value="user">user</option>
          </select>
        </div>

        <div>
          <Label required={true}>Email</Label>
          <Input
            type="email"
            placeholder="email@example.com"
            className="custom-input"
            name="email"
          />
        </div>

        <div>
          <Label required={true}>Password</Label>
          <Input
            type="password"
            placeholder="Enter Password"
            className="custom-input"
            name="password"
          />
        </div>

        <div>
          <Label required={true}>Confirm Password</Label>
          <Input
            type="password"
            placeholder="Confirm Password"
            className="custom-input"
            name="passwordConfirm"
          />
        </div>

        <div>
          <Label required={true}>Location</Label>
          <Input
            type="text"
            placeholder="Location"
            className="custom-input"
            name="location"
          />
        </div>

        <div>
          <Label>Profile Image</Label>
          <input
            type="file"
            className="custom-select"
            name="photo"
            accept="image/*"
          />
        </div>

        <Button className="bhs:w-52 bhs:col-span-2 bhs:mt-2 bhs:bg-pink-400">
          Submit
        </Button>
      </form>
    </div>
  );
}
