// export default function Input({
//     label,
//     as = "input",
//     placeholder = "",
//     className = "",
//     id,
//     ...props
// }) {
//     const Component = as;

//     const baseClass =
//         "mt-2 block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm text-neutral9 placeholder:text-neutral6 focus:border-primary focus:outline-none";

//     return (
//         <div className="w-full">
//             {label && (
//                 <label
//                     htmlFor={id}
//                     className="block text-sm text-neutral9 font-medium"
//                 >
//                     {label}
//                 </label>
//             )}

//             <Component
//                 id={id}
//                 {...props}
//                 placeholder={placeholder}
//                 className={`${baseClass} ${className}`}
//             />
//         </div>
//     );
// }

import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

export default function Input({
    label,
    as = "input",
    type = "text",
    placeholder = "",
    className = "",
    id,
    ...props
}) {
    const Component = as;
    const [showPassword, setShowPassword] = useState(false);

    const isPassword =
        as === "input" && type === "password";

    const inputType = isPassword
        ? (showPassword ? "text" : "password")
        : type;

    const baseClass =
        "block w-full border border-neutral4 bg-neutral2 px-3 py-2 sm:px-4 sm:py-3 text-sm text-neutral9 placeholder:text-neutral6 focus:placeholder:text-transparent focus:border-primary focus:outline-none";

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-neutral9"
                >
                    {label}
                </label>
            )}

            {isPassword ? (
                <div className="relative mt-2">
                    <input
                        id={id}
                        type={inputType}
                        placeholder={placeholder}
                        className={`${baseClass} pr-10 ${className}`}
                        {...props}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(!showPassword)
                        }
                        className="absolute inset-y-0 right-3 flex items-center text-neutral6 hover:text-primary"
                    >
                        {showPassword ? (
                            <FaRegEyeSlash />
                        ) : (
                            <FaRegEye />
                        )}
                    </button>
                </div>
            ) : (
                <Component
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={`mt-2 ${baseClass} ${className}`}
                    {...props}
                />
            )}
        </div>
    );
}