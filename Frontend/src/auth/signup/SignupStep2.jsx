import { MdClose } from "react-icons/md";
import logo from "../../assets/auctra_logo.svg";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function SignupStep2({
    onClose,
    previousStep,
    formData,
    updateField,
    handleSignup,
}) {
    return (
        <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto bg-neutral1 p-6 sm:p-8 shadow-lg mx-4">

            <div className="flex justify-end">
                <MdClose onClick={onClose} className="cursor-pointer" />
            </div>

            <div className="text-center">
                <img src={logo} className="mx-auto h-20 sm:h-28" />

                <h2 className="text-2xl font-bold text-primary">
                    Verify Your Identity
                </h2>

                <p className="text-neutral6 mt-2">Step 2 of 2</p>
            </div>

            <div className="mt-8 space-y-5">

                <Input
                    id="dob"
                    label="Date of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                />

                <Input
                    as="textarea"
                    id="address"
                    label="Address"
                    rows={3}
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                />

                <Input
                    as="select"
                    id="documentType"
                    label="Government Document"
                    value={formData.documentType}
                    onChange={(e) =>
                        updateField("documentType", e.target.value)
                    }
                >
                    <option value="">Select Document</option>
                    <option value="citizenship">Citizenship</option>
                    <option value="nid">National ID</option>
                    <option value="passport">Passport</option>
                </Input>

                <Input
                    id="frontImage"
                    label="Front Image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        updateField("frontImage", e.target.files[0])
                    }
                />

                <Input
                    id="backImage"
                    label="Back Image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        updateField("backImage", e.target.files[0])
                    }
                />

                <div className="flex gap-4">
                    {/* <button
                        onClick={previousStep}
                        className="w-1/2 border border-primary py-3 text-primary hover:bg-neutral2"
                    >
                        Back
                    </button> */}
                    <Button
    onClick={previousStep}
    variant="primaryBorder"
    size="md"
    className="w-1/2"
>
    Back
</Button>

                    {/* <button
                        onClick={handleSignup}
                        className="w-1/2 bg-secondaryd py-3 text-white hover:bg-secondaryd-hover"
                    >
                        Complete Signup
                    </button> */}

                  <Button
    onClick={handleSignup}
    variant="secondary"
    size="md"
    className="w-1/2"
>
    Complete Signup
</Button>  
                </div>

            </div>
        </div>
    );
}