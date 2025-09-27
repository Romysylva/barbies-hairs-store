// components/ui/Input.tsx
type InputProps = {
  label?: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({ label, type = "text", name, value, onChange }: InputProps) => (
  <div className=" bhs:sm:w-5xl ">
    <label className="bhs:block bhs:mb-1 bhs:text-sm bhs:font-medium">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="bhs:w-full bhs:px-3 bhs:py-2 bhs:border bhs:rounded-md bhs:border-gray-300 focus:bhs:outline-none focus:bhs:ring-1 focus:bhs:ring-barbiePurple"
      placeholder="search..."
    />
  </div>
);

export default Input;

// Usage: {
/* <Input label="Full Name" name="fullName" value={name} onChange={handleChange} /> */
// }
