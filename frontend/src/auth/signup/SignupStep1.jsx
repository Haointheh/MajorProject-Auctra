// // import { MdClose } from "react-icons/md";
// // import logo from "../../assets/auctra_logo.svg";
// // import Input from "../../ui/Input";
// // import Button from "../../ui/Button";

// // export default function SignupStep1({
// //     onClose,
// //     switchToLogin,
// //     formData,
// //     updateField,
// //     nextStep,
// // }) {
// //     return (
// //         // <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto bg-neutral1 p-6 sm:p-8 shadow-lg mx-4">
// //         <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg h-[90vh] bg-neutral1 shadow-lg mx-4 flex flex-col">
// //             <div className="flex justify-end">
// //                 <MdClose onClick={onClose} className="cursor-pointer" />
// //             </div>

// //             <div className="text-center">
// //                 <img src={logo} className="mx-auto h-20 sm:h-28" />

// //                 <h2 className="text-2xl font-bold text-primary">
// //                     Create an Account
// //                 </h2>

// //                 <p className="text-neutral6 mt-2">Step 1 of 2</p>
// //             </div>

// //             <div className="mt-8 space-y-5">

// //                 <Input
// //                     id="name"
// //                     label="Name"
// //                     placeholder="Enter your name"
// //                     value={formData.name}
// //                     onChange={(e) => updateField("name", e.target.value)}
// //                 />

// //                 <Input
// //                     id="phone"
// //                     label="Phone Number"
// //                     placeholder="Enter phone number"
// //                     value={formData.phone}
// //                     onChange={(e) => updateField("phone", e.target.value)}
// //                 />

// //                 <Input
// //                     id="password"
// //                     type="password"
// //                     label="Password"
// //                     placeholder="Enter password"
// //                     value={formData.password}
// //                     onChange={(e) => updateField("password", e.target.value)}
// //                 />

// //                 <Input
// //                     id="confirmPassword"
// //                     type="password"
// //                     label="Confirm Password"
// //                     placeholder="Re-enter password"
// //                     value={formData.confirmPassword}
// //                     onChange={(e) =>
// //                         updateField("confirmPassword", e.target.value)
// //                     }
// //                 />

// //                 <Button
// //     onClick={nextStep}
// //     variant="secondary"
// //     size="md"
// //     className="w-full"
// // >
// //     Continue
// // </Button>
// //             </div>

// //             <div className="mt-6 text-center text-sm">
// //                 Already have an account?
// //                 <button
// //                     onClick={switchToLogin}
// //                     className="ml-2 text-primary font-semibold"
// //                 >
// //                     Log In
// //                 </button>
// //             </div>

// //         </div>
// //     );
// // }

// import { MdClose } from "react-icons/md";
// import logo from "../../assets/auctra_logo.svg";
// import Input from "../../ui/Input";
// import Button from "../../ui/Button";

// export default function SignupStep1({
//     onClose,
//     switchToLogin,
//     formData,
//     updateField,
//     nextStep,
// }) {
//     return (
//         <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg h-[90vh] bg-neutral1 p-6 sm:p-8 shadow-lg mx-4 flex flex-col">

//             {/* Fixed Header */}
//             <div className="shrink-0">
//                 <div className="flex justify-end">
//                     <MdClose
//                         onClick={onClose}
//                         className="cursor-pointer"
//                     />
//                 </div>

//                 <div className="text-center">
//                     <img
//                         src={logo}
//                         className="mx-auto h-20 sm:h-28"
//                         alt="Auctra"
//                     />

//                     <h2 className="text-2xl font-bold text-primary">
//                         Create an Account
//                     </h2>

//                     <p className="text-neutral6 mt-2">
//                         Step 1 of 2
//                     </p>
//                 </div>
//             </div>

//             {/* Scrollable Form */}
//             <div className="flex-1 overflow-y-auto mt-8">
//                 <div className="h-full overflow-y-auto pr-4">
//                 <div className="space-y-5">

//                     <Input
//                         id="name"
//                         label="Name"
//                         placeholder="Enter your name"
//                         value={formData.name}
//                         onChange={(e) =>
//                             updateField("name", e.target.value)
//                         }
//                     />

//                     <Input
//                         id="phone"
//                         label="Phone Number"
//                         placeholder="Enter phone number"
//                         value={formData.phone}
//                         onChange={(e) =>
//                             updateField("phone", e.target.value)
//                         }
//                     />

//                     <Input
//                         id="password"
//                         type="password"
//                         label="Password"
//                         placeholder="Enter password"
//                         value={formData.password}
//                         onChange={(e) =>
//                             updateField("password", e.target.value)
//                         }
//                     />

//                     <Input
//                         id="confirmPassword"
//                         type="password"
//                         label="Confirm Password"
//                         placeholder="Re-enter password"
//                         value={formData.confirmPassword}
//                         onChange={(e) =>
//                             updateField(
//                                 "confirmPassword",
//                                 e.target.value
//                             )
//                         }
//                     />
//                 </div>
//                 </div>

//             </div>

//             {/* Fixed Footer */}
//             <div className="shrink-0 pt-6">

//                 <Button
//                     onClick={nextStep}
//                     variant="secondary"
//                     size="md"
//                     className="w-full"
//                 >
//                     Continue
//                 </Button>

//                 <div className="mt-6 text-center text-sm">
//                     Already have an account?
//                     <button
//                         onClick={switchToLogin}
//                         className="ml-2 text-primary font-semibold"
//                     >
//                         Log In
//                     </button>
//                 </div>

//             </div>

//         </div>
//     );
// }

import { MdClose } from "react-icons/md";
import logo from "../../assets/auctra_logo.svg";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function SignupStep1({
    onClose,
    switchToLogin,
    formData,
    updateField,
    nextStep,
}) {
    return (
        <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto bg-neutral1 p-6 sm:p-8 shadow-lg mx-4">

            <div className="flex justify-end">
                <MdClose onClick={onClose} className="cursor-pointer" />
            </div>

            <div className="text-center">
                <img src={logo} className="mx-auto h-20 sm:h-28" />

                <h2 className="text-2xl font-bold text-primary">
                    Create an Account
                </h2>

                <p className="text-neutral6 mt-2">Step 1 of 2</p>
            </div>

            <div className="mt-8 space-y-5">

                <Input
                    id="name"
                    label="Name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                />

                <Input
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                />

                <Input
                    as="select"
                    id="role"
                    label="I want to"
                    value={formData.role}
                    onChange={(e) => updateField("role", e.target.value)}
                >
                    <option value="user">Buy on Auctra</option>
                    <option value="seller">Sell on Auctra</option>
                </Input>

                <Input
                    id="phone"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                />

                <Input
                    id="password"
                    type="password"
                    label="Password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                />

                <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                    }
                />

                <Button
    onClick={nextStep}
    variant="secondary"
    size="md"
    className="w-full"
>
    Continue
</Button>
            </div>

            <div className="mt-6 text-center text-sm">
                Already have an account?
                <button
                    onClick={switchToLogin}
                    className="ml-2 text-primary font-semibold"
                >
                    Log In
                </button>
            </div>

        </div>
    );
}