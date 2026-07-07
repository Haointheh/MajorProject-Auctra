export default function Input({
    label,
    as = "input",
    placeholder = "",
    className = "",
    id,
    ...props
}) {
    const Component = as;

    const baseClass =
        "mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none";

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm text-neutral9 font-medium"
                >
                    {label}
                </label>
            )}

            <Component
                id={id}
                {...props}
                placeholder={placeholder}
                className={`${baseClass} ${className}`}
            />
        </div>
    );
}