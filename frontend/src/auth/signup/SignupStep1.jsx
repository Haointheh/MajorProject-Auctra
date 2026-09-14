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
    loading,
    error,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!loading) nextStep();
    };

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

                <p className="text-neutral6 mt-2">Step 1 of 3</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {error && (
                    <div className="border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                        {error}
                    </div>
                )}

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
                    type="submit"
                    variant="secondary"
                    size="md"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? "Sending code…" : "Continue"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                Already have an account?
                <button
                    type="button"
                    onClick={switchToLogin}
                    className="ml-2 text-primary font-semibold"
                >
                    Log In
                </button>
            </div>

        </div>
    );
}