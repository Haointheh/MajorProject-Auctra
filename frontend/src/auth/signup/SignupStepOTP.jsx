import { MdClose } from "react-icons/md";
import logo from "../../assets/auctra_logo.svg";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function SignupStepOTP({
    onClose,
    previousStep,
    formData,
    otp,
    setOtp,
    handleVerifyOtp,
    handleResendOtp,
    loading,
    resending,
    error,
}) {
    return (
        <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto bg-neutral1 p-6 sm:p-8 shadow-lg mx-4">

            <div className="flex justify-end">
                <MdClose onClick={onClose} className="cursor-pointer" />
            </div>

            <div className="text-center">
                <img src={logo} className="mx-auto h-20 sm:h-28" />

                <h2 className="text-2xl font-bold text-primary">
                    Verify Your Email
                </h2>

                <p className="text-neutral6 mt-2">Step 2 of 3</p>
                <p className="text-sm text-neutral6 mt-3">
                    We sent a 6-digit code to <span className="font-semibold">{formData.email}</span>.
                    It expires in 10 minutes.
                </p>
            </div>

            <div className="mt-8 space-y-5">

                {error && (
                    <div className="border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                        {error}
                    </div>
                )}

                <Input
                    id="otp"
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />

                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-sm text-primary font-semibold disabled:opacity-50"
                >
                    {resending ? "Resending…" : "Didn't get a code? Resend"}
                </button>

                <div className="flex gap-4 pt-2">
                    <Button
                        onClick={previousStep}
                        variant="primaryBorder"
                        className="w-1/2"
                        disabled={loading}
                    >
                        Back
                    </Button>

                    <Button
                        onClick={handleVerifyOtp}
                        variant="secondary"
                        className="w-1/2"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? "Verifying…" : "Verify"}
                    </Button>
                </div>

            </div>
        </div>
    );
}
