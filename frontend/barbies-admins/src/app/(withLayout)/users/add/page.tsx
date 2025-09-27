import AddUsers from "@/screen/users/add";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ errorMessage?: string }>;
}) {
  return (
    <>
      <AddUsers searchParams={searchParams} />
    </>
  );
}
