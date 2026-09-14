import { MdClose } from "react-icons/md";
import logo from "../../assets/auctra_logo.svg";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import FileUploadBox from "../../ui/FileUploadBox";

export default function SignupStep2({
    onClose,
    previousStep,
    formData,
    updateField,
    onSubmitRequest,
    loading,
    error,
}) {
    // Enter key (or clicking "Complete Signup") opens the confirmation step
    // rather than submitting straight away — the actual signup only fires
    // once that's confirmed.
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!loading) onSubmitRequest();
    };

    return (
        <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto bg-neutral1 p-6 sm:p-8 shadow-lg mx-4">

            {/* CLOSE */}
            <div className="flex justify-end">
                <MdClose onClick={onClose} className="cursor-pointer" />
            </div>

            {/* HEADER */}
            <div className="text-center">
                <img src={logo} className="mx-auto h-20 sm:h-28" />

                <h2 className="text-2xl font-bold text-primary">
                    Verify Your Identity
                </h2>

                <p className="text-neutral6 mt-2">Step 3 of 3</p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {error && (
                    <div className="border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                        {error}
                    </div>
                )}

                <Input
                    id="dob"
                    label="Date of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                        updateField("dob", e.target.value)
                    }
                />

                <Input
                    id="address"
                    label="Address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) =>
                        updateField("address", e.target.value)
                    }
                />

                <Input
                    id="documentId"
                    label="Document ID Number"
                    type="text"
                    value={formData.documentId}
                    onChange={(e) =>
                        updateField("documentId", e.target.value)
                    }
                />

                <Input
                    as="select"
                    id="documentType"
                    label="Government Document"
                    value={formData.documentType}
                    placeholder="Select Document"
                    onChange={(e) =>
                        updateField("documentType", e.target.value)
                    }
                >
                    {/* <option value="">Select Document</option> */}
                    <option value="" disabled>
        Select Document
    </option>
                    <option value="citizenship">Citizenship</option>
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                </Input>

                {/* FILE UPLOADS (REUSABLE COMPONENT) */}
                <FileUploadBox
                    label="Front Image"
                    value={formData.frontImage}
                    onChange={(file) =>
                        updateField("frontImage", file)
                    }
                />

                <FileUploadBox
                    label="Back Image"
                    value={formData.backImage}
                    onChange={(file) =>
                        updateField("backImage", file)
                    }
                />

                {/* BUTTONS */}
                <div className="flex gap-4 pt-2">
                    <Button
                        type="button"
                        onClick={previousStep}
                        variant="primaryBorder"
                        className="w-1/2"
                        disabled={loading}
                    >
                        Back
                    </Button>

                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-1/2"
                        disabled={loading}
                    >
                        Complete Signup
                    </Button>
                </div>

            </form>
        </div>
    );
}


